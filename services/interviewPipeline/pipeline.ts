// services/interviewPipeline/pipeline.ts - Mercor-grade interview pipeline

import { QuestionPlan, PipelineState, TurnMetrics, AntiCheatSignal, QuestionType, RefinedQuestion, AnswerEvaluation } from './types';
import { getQuestionForRoleAndStage, Stage } from './questionBank';
import { evaluateTurn, resetEvaluationCounter, generateFinalEvaluation, TurnEvaluation } from './evaluator';
import { PIPELINE_CONFIG } from './pipelineConfig';
import { getLLMUsage } from './llmClient';
import { runAntiCheat } from './antiCheat';

export interface InterviewState {
  role: string;
  stage: string;
  difficulty: number;
  skillProfile: any;
  transcript: { q: string; a: string }[];
  usedQuestions: string[];
  finished: boolean;
  hasGreeted: boolean;
  consecutiveSilence: number;
  language?: string;
  externalContext?: string;
}

interface EvaluationResult {
  score: number; // 0–100 по этому ответу
  strengths: string[];
  weaknesses: string[];
  skillUpdates: { skillName: string; delta: number; reason: string }[];
  quality: 'poor' | 'average' | 'good' | 'excellent' | 'unknown';
  rawMetrics: TurnMetrics;
}

export class InterviewPipeline {
  private state: PipelineState;
  private questionMemory: Array<{ question: string; answer: string; topic: string; score: number }> = [];
  private lastAnswerKeywords: string[] = [];
  private difficultyLevel: number = 2; // 1-5, starts at medium
  private turnEvalInProgress: boolean = false;
  // Mercor-grade адаптивная логика: отслеживание тем и follow-up вопросов
  private currentTopic: string | null = null;
  private topicFollowUpCount: Map<string, number> = new Map(); // Сколько follow-up задано по теме
  private skippedTopics: Set<string> = new Set(); // Пропущенные темы (отрицательные ответы)
  private completedTopics: Set<string> = new Set(); // Завершенные темы (хорошие ответы)

  constructor(
    _apiKey: string,
    _systemPrompt: string,
    initialSkills: string[] = [],
  ) {
    resetEvaluationCounter(); // Сброс счетчика при новом интервью
    this.state = {
      questionsAsked: 0,
      totalQuestions: 10,
      interviewPhase: 'intro',
      discoveredStrengths: [],
      discoveredWeaknesses: [],
      turns: [],
      antiCheatSignals: [],
      skillProfile: initialSkills.map((name) => ({
        name,
        level: 50,
        evidence: [],
      })),
      hasLLMDegraded: false,
    };
  }

  getState(): PipelineState {
    return { ...this.state };
  }

  /**
   * Mercor-grade question generation with follow-ups and adaptive difficulty
   * Uses question bank first, then falls back to LLM if needed
   */
  async generateNextQuestion(
    role: string,
    candidateName: string,
    language: string,
  ): Promise<RefinedQuestion> {
    console.log('[Pipeline] Planning next question (light mode, adaptive)...');

    const phase = this.state.interviewPhase;
    const qIndex = this.state.questionsAsked;
    const lastAnswer = this.questionMemory[this.questionMemory.length - 1];

    // Adaptive difficulty adjustment
    if (lastAnswer) {
      if (lastAnswer.score < 30) {
        this.difficultyLevel = Math.max(1, this.difficultyLevel - 1);
      } else if (lastAnswer.score > 70) {
        this.difficultyLevel = Math.min(5, this.difficultyLevel + 1);
      }
    }

    // Phase progression
    if (qIndex === 0) {
      this.state.interviewPhase = 'intro';
    } else if (qIndex >= 2 && qIndex < 5) {
      this.state.interviewPhase = 'core';
    } else if (qIndex >= 5 && qIndex < 8) {
      this.state.interviewPhase = 'deep-dive';
    } else if (qIndex >= 8) {
      this.state.interviewPhase = 'wrap-up';
    }

    // Map interview phase to Stage
    const stageMap: { [key: string]: Stage } = {
      'intro': 'Background',
      'core': 'Core',
      'deep-dive': 'DeepDive',
      'wrap-up': 'WrapUp',
    };
    const stage = stageMap[phase] || 'Background';

    // Mercor-grade адаптивная логика: проверка на необходимость follow-up или переход к новой теме
    if (lastAnswer) {
      const lastTopic = lastAnswer.topic;
      const followUpCount = this.topicFollowUpCount.get(lastTopic) || 0;
      const maxFollowUps = 2; // Максимум 2 follow-up вопроса по теме

      // Если ответ неполный (score < 70) и еще не задано много follow-up - задаем уточняющий вопрос
      if (lastAnswer.score < 70 && followUpCount < maxFollowUps && !this.skippedTopics.has(lastTopic)) {
        this.topicFollowUpCount.set(lastTopic, followUpCount + 1);
        this.currentTopic = lastTopic;
        const followUpQuestion = this.generateFollowUpQuestion(lastAnswer, role, language);
        if (followUpQuestion) {
          return {
            question: followUpQuestion,
            tone: 'professional',
            style: 'concise',
            metadata: {
              topic: lastTopic,
              type: 'technical',
              estimatedDuration: 60,
            },
          };
        }
      }

      // Если тема пропущена или завершена - переходим к новой теме
      if (this.skippedTopics.has(lastTopic) || this.completedTopics.has(lastTopic)) {
        this.currentTopic = null;
        this.topicFollowUpCount.delete(lastTopic);
      }
    }

    // Try to get question from bank first (избегаем пропущенных тем)
    const bankQuestion = getQuestionForRoleAndStage(
      role,
      stage,
      this.difficultyLevel as 1 | 2 | 3 | 4 | 5
    );

    // Generate question based on context (use bank if available, otherwise generate)
    const question = bankQuestion || this.generateContextualQuestion(role, phase, lastAnswer, language);

    const questionType: QuestionType = phase === 'intro' ? 'background' :
      phase === 'core' ? 'technical' :
      phase === 'deep-dive' ? 'deep-dive' :
      'wrap-up';

    return {
      question,
      tone: 'professional',
      style: 'concise',
      metadata: {
        topic: lastAnswer?.topic || 'general',
        type: questionType,
        estimatedDuration: 60,
      },
    };
  }

  /**
   * Generate follow-up question for incomplete answer (Mercor-grade)
   */
  private generateFollowUpQuestion(
    lastAnswer: { question: string; answer: string; topic: string; score: number },
    role: string,
    language: string,
  ): string | null {
    const followUps: { [key: string]: { [key: string]: string[] } } = {
      'English': {
        'Machine Learning': [
          'Can you provide a specific example of when you used this technique?',
          'What challenges did you face and how did you overcome them?',
          'What metrics did you use to measure success?',
        ],
        'SQL/Database': [
          'Can you explain how you optimized this query?',
          'What indexing strategy did you use?',
          'How did you handle data consistency?',
        ],
        'Fraud Detection': [
          'What features did you engineer for this model?',
          'How did you handle class imbalance?',
          'What was the false positive rate?',
        ],
        'Data Analysis': [
          'What tools did you use for this analysis?',
          'How did you validate your findings?',
          'What insights did you derive?',
        ],
        'Backend Development': [
          'How did you ensure scalability?',
          'What caching strategies did you implement?',
          'How did you handle errors and edge cases?',
        ],
        'Frontend': [
          'How did you optimize performance?',
          'What state management approach did you use?',
          'How did you handle user interactions?',
        ],
      },
      'Russian': {
        'Machine Learning': [
          'Можете привести конкретный пример использования этой техники?',
          'С какими трудностями вы столкнулись и как их преодолели?',
          'Какие метрики вы использовали для оценки успеха?',
        ],
        'SQL/Database': [
          'Можете объяснить, как вы оптимизировали этот запрос?',
          'Какую стратегию индексирования вы использовали?',
          'Как вы обрабатывали согласованность данных?',
        ],
        'Fraud Detection': [
          'Какие признаки вы создали для этой модели?',
          'Как вы обрабатывали дисбаланс классов?',
          'Каков был процент ложных срабатываний?',
        ],
        'Data Analysis': [
          'Какие инструменты вы использовали для этого анализа?',
          'Как вы проверяли свои выводы?',
          'Какие инсайты вы получили?',
        ],
        'Backend Development': [
          'Как вы обеспечивали масштабируемость?',
          'Какие стратегии кеширования вы использовали?',
          'Как вы обрабатывали ошибки и граничные случаи?',
        ],
        'Frontend': [
          'Как вы оптимизировали производительность?',
          'Какой подход к управлению состоянием вы использовали?',
          'Как вы обрабатывали взаимодействия пользователей?',
        ],
      },
    };

    const langFollowUps = followUps[language] || followUps['English'];
    const topicFollowUps = langFollowUps[lastAnswer.topic] || langFollowUps['Machine Learning'];
    const followUpCount = this.topicFollowUpCount.get(lastAnswer.topic) || 0;
    
    if (followUpCount <= topicFollowUps.length) {
      return topicFollowUps[followUpCount - 1] || topicFollowUps[0];
    }
    
    return null; // Больше нет follow-up вопросов
  }

  /**
   * Generate contextual question with follow-ups
   */
  private generateContextualQuestion(
    role: string,
    phase: string,
    lastAnswer: { question: string; answer: string; topic: string; score: number } | undefined,
    language: string,
  ): string {
    // Follow-up logic: if last answer mentioned technologies, ask about them
    if (lastAnswer && this.lastAnswerKeywords.length > 0) {
      const techKeywords = this.lastAnswerKeywords.filter(k => 
        ['python', 'sql', 'react', 'javascript', 'docker', 'kubernetes', 'ml', 'pandas', 'tensorflow', 'pytorch'].includes(k.toLowerCase())
      );

      if (techKeywords.length > 0 && phase !== 'intro') {
        const tech = techKeywords[0];
        return this.generateTechFollowUp(tech, role, this.difficultyLevel, language);
      }

      // If answer was weak, ask for clarification
      if (lastAnswer.score < 40) {
        return this.generateClarificationQuestion(lastAnswer.answer, role, language);
      }

      // If answer was strong, go deeper
      if (lastAnswer.score > 70 && phase === 'core') {
        return this.generateDeepDiveQuestion(lastAnswer.topic, role, this.difficultyLevel, language);
      }
    }

    // Phase-based questions
    switch (phase) {
      case 'intro':
        return this.generateIntroQuestion(role, '', language); // candidateName не используется в этом контексте
      case 'core':
        return this.generateCoreQuestion(role, this.difficultyLevel, language);
      case 'deep-dive':
        return this.generateDeepDiveQuestion(
          this.state.discoveredStrengths[0] || 'technical skills',
          role,
          this.difficultyLevel,
          language
        );
      case 'wrap-up':
        return this.generateWrapUpQuestion(role, language);
      default:
        return `Tell me more about your experience with ${role}.`;
    }
  }

  private generateIntroQuestion(role: string, candidateName: string, language: string): string {
    const greetings: { [key: string]: string } = {
      'English': `Hi ${candidateName}, welcome. Let's start with your background. Can you briefly describe your most relevant experience for the ${role} position?`,
      'Russian': `Привет, ${candidateName}, добро пожаловать. Давайте начнём с вашего опыта. Можете кратко описать ваш наиболее релевантный опыт для позиции ${role}?`,
    };
    return greetings[language] || greetings['English'];
  }

  private generateCoreQuestion(role: string, difficulty: number, language: string): string {
    const roleQuestions: { [key: string]: { [key: number]: string } } = {
      'Data Scientist': {
        1: 'What data analysis tools have you used?',
        2: 'Can you explain a time when you had to clean messy data? What challenges did you face?',
        3: 'Describe a machine learning project from start to finish. What metrics did you optimize?',
        4: 'How would you handle class imbalance in a binary classification problem? Walk me through your approach.',
        5: 'Design a real-time fraud detection system. What features would you engineer and why?',
      },
      'Backend Developer': {
        1: 'What backend technologies are you familiar with?',
        2: 'Describe a time when you had to optimize a slow database query. What was your approach?',
        3: 'How would you design an API that needs to handle 1 million requests per second?',
        4: 'Explain how you would implement distributed caching. What trade-offs would you consider?',
        5: 'Design a system for handling eventual consistency across multiple data centers.',
      },
      'Frontend Developer': {
        1: 'What frontend frameworks have you worked with?',
        2: 'How do you handle state management in a large React application?',
        3: 'Explain how you would optimize a slow-rendering component. What tools and techniques?',
        4: 'Design a component architecture for a complex dashboard with real-time updates.',
        5: 'How would you implement a virtual scrolling list that handles 10,000+ items efficiently?',
      },
    };

    const questions = roleQuestions[role] || roleQuestions['Data Scientist'];
    return questions[difficulty] || questions[2];
  }

  private generateTechFollowUp(tech: string, role: string, difficulty: number, language: string): string {
    const followUps: { [key: string]: string } = {
      'python': `You mentioned Python. Can you explain ${difficulty >= 3 ? 'how the GIL affects concurrent processing' : 'a specific Python project you worked on'}?`,
      'sql': `You mentioned SQL. ${difficulty >= 3 ? 'How would you optimize a query that joins 5 tables with millions of rows?' : 'Can you describe a complex query you wrote?'}`,
      'react': `You mentioned React. ${difficulty >= 3 ? 'Explain how React\'s reconciliation algorithm works and when you might need to optimize it.' : 'What React patterns do you use most often?'}`,
      'ml': `You mentioned machine learning. ${difficulty >= 4 ? 'Walk me through how you would handle feature drift in a production ML system.' : 'What ML models have you deployed to production?'}`,
    };

    return followUps[tech.toLowerCase()] || `Tell me more about your experience with ${tech}.`;
  }

  private generateClarificationQuestion(lastAnswer: string, role: string, language: string): string {
    if (lastAnswer.length < 20) {
      return `I'd like to understand better. Can you provide a specific example or more detail?`;
    }
    return `Let me clarify: can you walk me through the steps you took, or explain the reasoning behind that approach?`;
  }

  private generateDeepDiveQuestion(topic: string, role: string, difficulty: number, language: string): string {
    if (difficulty >= 4) {
      return `Let's go deeper. Can you walk me through a complex problem you solved related to ${topic}? Include the constraints, your approach, and the outcome.`;
    }
    return `You mentioned ${topic}. Can you describe a specific project or challenge where you applied this?`;
  }

  private generateWrapUpQuestion(role: string, language: string): string {
    return `Do you have any questions about the ${role} position or our company?`;
  }

  /**
   * Process answer with local heuristics (no LLM calls)
   */
  async processAnswer(
    question: string,
    answer: string,
    plan: QuestionPlan | null,
    responseTimeMs: number,
    answerDurationMs: number,
  ): Promise<AnswerEvaluation> {
    if (this.turnEvalInProgress) {
      console.log('[Pipeline] Answer evaluation already in progress, skipping...');
      return this.getDefaultEvaluation();
    }

    this.turnEvalInProgress = true;

    try {
      console.log('[Pipeline] Running light anti-cheat detection (heuristics only, no API calls)...');

      // Compute metrics
      const metrics = this.computeMetrics(question, answer, responseTimeMs, answerDurationMs);

      // Try to use new evaluator (with LLM if available, fallback to heuristics)
      const transcriptSoFar = this.questionMemory
        .map((m, idx) => `Q${idx + 1}: ${m.question}\nA${idx + 1}: ${m.answer}`)
        .join('\n\n');

      let evaluation;
      try {
        const turnIndex = this.state.questionsAsked;
        evaluation = await evaluateTurn({
          role: plan?.topic || 'general',
          question,
          answer,
          transcriptSoFar,
          turnIndex, // Передаем индекс для контроля частоты LLM
        });
        
        // Обновляем флаг деградации из LLM usage
        const llmUsage = getLLMUsage();
        if (llmUsage.hasDegraded) {
          this.state.hasLLMDegraded = true;
        }
      } catch (error) {
        console.warn('[Pipeline] Evaluator failed, using local heuristics:', error);
        this.state.hasLLMDegraded = true;
        // Fallback to local heuristics
        const quality = this.estimateQuality(metrics);
        const score = this.calculateScore(metrics, quality);
        evaluation = {
          score,
          strengths: this.extractStrengths(metrics, answer),
          weaknesses: this.extractWeaknesses(metrics, answer),
          quality,
          skillUpdates: {
            communication: score / 100,
            reasoning: score / 100,
            domain: score / 100,
          },
          notes: 'Local heuristic evaluation',
          heuristicOnly: true,
          scoreSource: 'heuristic',
        };
      }

      // Легкий античит (только эвристики, без LLM) - тяжелый античит будет в конце
      const antiCheatSignals = this.detectAntiCheat(metrics);

      // Extract keywords for follow-ups
      this.lastAnswerKeywords = this.extractKeywords(answer);

      // Определяем тему ответа
      const answerTopic = this.inferTopic(answer) || plan?.topic || 'general';

      // Mercor-grade адаптивная логика: проверка на отрицательный ответ
      const isNegative = this.isNegativeResponse(answer);
      if (isNegative) {
        // Пропускаем тему при отрицательном ответе
        this.skippedTopics.add(answerTopic);
        console.log(`[Pipeline] Topic "${answerTopic}" skipped due to negative response`);
      } else if (evaluation.score >= 70) {
        // Хороший ответ - тема завершена
        this.completedTopics.add(answerTopic);
        console.log(`[Pipeline] Topic "${answerTopic}" completed with score ${evaluation.score}`);
      }

      // Store in memory
      this.questionMemory.push({
        question,
        answer,
        topic: answerTopic,
        score: evaluation.score,
      });

      // Update state
      this.state.turns.push(metrics);
      this.state.antiCheatSignals.push(...antiCheatSignals);
      this.state.questionsAsked += 1;

      const answerEvaluation: AnswerEvaluation = {
        score: evaluation.score,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        skillUpdates: [],
        quality: evaluation.quality,
        rawMetrics: metrics,
      };

      console.log('[Pipeline] Answer evaluated:', { 
        score: evaluation.score, 
        strengths: evaluation.strengths, 
        weaknesses: evaluation.weaknesses,
        heuristicOnly: evaluation.heuristicOnly 
      });

      return answerEvaluation;
    } finally {
      this.turnEvalInProgress = false;
    }
  }

  private computeMetrics(
    question: string,
    answer: string,
    responseTimeMs: number,
    answerDurationMs: number,
  ): TurnMetrics {
    const words = answer.trim().split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const wordCount = words.length;
    const uniqueWordCount = uniqueWords.size;
    const lexicalDiversity = wordCount > 0 ? uniqueWordCount / wordCount : 0;

    // Count filler words
    const fillerWords = ['ээ', 'э', 'ну', 'как бы', 'типа', 'um', 'uh', 'you know', 'like', 'so', 'well'];
    const fillerCount = words.filter(w => fillerWords.includes(w.toLowerCase())).length;

    // Average sentence length
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0
      ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
      : 0;

    // Detect suspicious patterns
    const suspiciousPatterns: string[] = [];
    if (responseTimeMs < 500 && wordCount > 50) {
      suspiciousPatterns.push('TOO_FAST_LONG_ANSWER');
    }
    if (wordCount < 5) {
      suspiciousPatterns.push('LOW_EFFORT');
    }
    if (lexicalDiversity < 0.3 && wordCount > 30) {
      suspiciousPatterns.push('REPETITIVE');
    }

    return {
      question,
      answer,
      topic: this.inferTopic(answer),
      questionType: 'technical',
      depth: 'medium',
      responseTimeMs,
      answerDurationMs,
      wordCount,
      uniqueWordCount,
      lexicalDiversity,
      fillerCount,
      avgSentenceLength,
      suspiciousPatterns,
    };
  }

  private detectAntiCheat(metrics: TurnMetrics): AntiCheatSignal[] {
    const signals: AntiCheatSignal[] = [];

    if (metrics.suspiciousPatterns.includes('TOO_FAST_LONG_ANSWER')) {
      signals.push({
        code: 'TOO_FAST_LONG_ANSWER',
        severity: 'medium',
        message: 'Answer was very long but response time was suspiciously short',
        turnIndex: this.state.turns.length,
      });
    }

    if (metrics.suspiciousPatterns.includes('LOW_EFFORT')) {
      signals.push({
        code: 'LOW_EFFORT',
        severity: 'low',
        message: 'Answer was very short or minimal',
        turnIndex: this.state.turns.length,
      });
    }

    if (metrics.suspiciousPatterns.includes('REPETITIVE')) {
      signals.push({
        code: 'REPETITIVE',
        severity: 'low',
        message: 'Answer showed low lexical diversity, possible copy-paste',
        turnIndex: this.state.turns.length,
      });
    }

    // Check for toxic content
    const toxicWords = ['уёбища', 'алло', 'fuck', 'shit', 'damn'];
    if (toxicWords.some(word => metrics.answer.toLowerCase().includes(word))) {
      signals.push({
        code: 'TOXIC_CONTENT',
        severity: 'high',
        message: 'Answer contained inappropriate language',
        turnIndex: this.state.turns.length,
      });
    }

    return signals;
  }

  private estimateQuality(metrics: TurnMetrics): 'poor' | 'average' | 'good' | 'excellent' | 'unknown' {
    if (metrics.wordCount < 10) return 'poor';
    if (metrics.wordCount < 30) return 'average';
    if (metrics.wordCount < 100 && metrics.lexicalDiversity > 0.5) return 'good';
    if (metrics.wordCount >= 100 && metrics.lexicalDiversity > 0.6) return 'excellent';
    return 'average';
  }

  private calculateScore(metrics: TurnMetrics, quality: string): number {
    let score = 30; // base

    // Length bonus
    if (metrics.wordCount >= 50) score += 20;
    else if (metrics.wordCount >= 30) score += 10;
    else if (metrics.wordCount < 10) score -= 20;

    // Quality bonus
    if (quality === 'excellent') score += 30;
    else if (quality === 'good') score += 20;
    else if (quality === 'poor') score -= 20;

    // Lexical diversity bonus
    if (metrics.lexicalDiversity > 0.6) score += 10;
    else if (metrics.lexicalDiversity < 0.3) score -= 10;

    // Filler penalty
    if (metrics.fillerCount > 5) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private extractStrengths(metrics: TurnMetrics, answer: string): string[] {
    const strengths: string[] = [];
    if (metrics.wordCount >= 50) strengths.push('Provides detailed answers');
    if (metrics.lexicalDiversity > 0.6) strengths.push('Uses varied vocabulary');
    if (metrics.fillerCount < 3) strengths.push('Speaks fluently with minimal fillers');
    if (/\d+/.test(answer)) strengths.push('Uses specific examples or numbers');
    return strengths;
  }

  private extractWeaknesses(metrics: TurnMetrics, answer: string): string[] {
    const weaknesses: string[] = [];
    if (metrics.wordCount < 20) weaknesses.push('Answers are too short');
    if (metrics.lexicalDiversity < 0.3) weaknesses.push('Limited vocabulary variety');
    if (metrics.fillerCount > 5) weaknesses.push('Uses too many filler words');
    if (!/\d+/.test(answer) && metrics.wordCount > 30) weaknesses.push('Lacks specific examples or metrics');
    return weaknesses;
  }

  private extractKeywords(answer: string): string[] {
    const techKeywords = ['python', 'sql', 'react', 'javascript', 'docker', 'kubernetes', 'ml', 'pandas', 'tensorflow', 'pytorch', 'node', 'typescript', 'java', 'go', 'rust'];
    const words = answer.toLowerCase().split(/\s+/);
    return words.filter(w => techKeywords.includes(w));
  }

  private inferTopic(answer: string): string {
    const lowerAnswer = answer.toLowerCase();
    const topics: { [key: string]: string } = {
      'python': 'Python',
      'sql': 'SQL/Database',
      'react': 'Frontend',
      'ml': 'Machine Learning',
      'machine learning': 'Machine Learning',
      'docker': 'DevOps',
      'fraud': 'Fraud Detection',
      'antifraud': 'Fraud Detection',
      'data': 'Data Analysis',
      'backend': 'Backend Development',
      'api': 'Backend Development',
    };

    for (const [key, topic] of Object.entries(topics)) {
      if (lowerAnswer.includes(key)) {
        return topic;
      }
    }

    return 'General Technical';
  }

  // Mercor-grade: проверка на отрицательный ответ (нет опыта)
  private isNegativeResponse(answer: string): boolean {
    const lowerAnswer = answer.toLowerCase();
    const negativePatterns = [
      /нет опыта/i,
      /не работал/i,
      /не знаком/i,
      /не приходилось/i,
      /no experience/i,
      /haven't worked/i,
      /not familiar/i,
      /не знаю/i,
      /don't know/i,
      /never used/i,
      /никогда не/i,
    ];
    return negativePatterns.some(pattern => pattern.test(lowerAnswer));
  }

  private updateSkillProfile(metrics: TurnMetrics, answer: string): void {
    // Simple heuristic-based skill updates
    const keywords = this.extractKeywords(answer);
    for (const keyword of keywords) {
      const skill = this.state.skillProfile.find(s => s.name.toLowerCase() === keyword.toLowerCase());
      if (skill) {
        // Gradually increase skill level based on answer quality
        const qualityBonus = metrics.wordCount > 50 ? 5 : 0;
        skill.level = Math.min(100, skill.level + qualityBonus);
        if (skill.evidence.length < 5) {
          skill.evidence.push(answer.substring(0, 100));
        }
      }
    }
  }

  private updatePhase(): void {
    const qCount = this.state.questionsAsked;
    if (qCount < 2) {
      this.state.interviewPhase = 'intro';
    } else if (qCount < 5) {
      this.state.interviewPhase = 'core';
    } else if (qCount < 8) {
      this.state.interviewPhase = 'deep-dive';
    } else {
      this.state.interviewPhase = 'wrap-up';
    }
  }

  private getDefaultEvaluation(): AnswerEvaluation {
    return {
      score: 50,
      strengths: [],
      weaknesses: [],
      skillUpdates: [],
      quality: 'unknown',
      rawMetrics: {
        question: '',
        answer: '',
        topic: 'general',
        questionType: 'technical',
        depth: 'medium',
        responseTimeMs: 0,
        answerDurationMs: 0,
        wordCount: 0,
        uniqueWordCount: 0,
        lexicalDiversity: 0,
        fillerCount: 0,
        avgSentenceLength: 0,
        suspiciousPatterns: [],
      },
    };
  }
}

export async function finalizeInterview(state: InterviewState): Promise<{ summary: any; antiCheat: any }> {
  console.log("[Pipeline] Finalizing interview...");

  // 1. Prepare data for evaluation
  // We need to convert state.transcript (q/a pairs) into flat TranscriptEntry[]-like structure
  const flatTranscript = state.transcript.flatMap(t => [
    { speaker: 'Interviewer', text: t.q },
    { speaker: 'Candidate', text: t.a }
  ]).filter(t => t.text);

  // We need to re-evaluate everything to get per-turn scores for the final summary
  // (Since InterviewScreen mocks the state, we might not have proper turn evaluations stored there)
  // In a real scenario, we should pass the evaluations. For now, we'll re-run or mock them.
  // Actually, we can just do a quick heuristic pass on them if they weren't stored.
  
  const evaluations: TurnEvaluation[] = [];
  
  for (const item of state.transcript) {
      if (item.a) {
          // Quick heuristic eval for summary context
          // We use evaluateTurn but force it to be heuristic if needed, 
          // but here we actually want good data for the summary.
          // To save time/quota, we might just use heuristicEvaluate directly from evaluator if exported,
          // but evaluateTurn handles logic.
          const evalResult = await evaluateTurn({
              role: state.role,
              question: item.q,
              answer: item.a,
              transcriptSoFar: "", // Not needed for simple heuristic
              turnIndex: 1 // Force heuristic if interval logic applies, or 0 to force LLM? 
              // Let's rely on default behavior.
          });
          evaluations.push(evalResult);
      }
  }

  // 2. Generate Summary
  const summary = await generateFinalEvaluation({
      transcript: flatTranscript,
      role: state.role,
      evaluations
  });

  // 3. Run Anti-Cheat
  // Calculate basic heuristic stats
  const avgScore = evaluations.reduce((sum, e) => sum + e.score, 0) / (evaluations.length || 1);
  
  const antiCheat = await runAntiCheat({
      transcript: flatTranscript.map(t => `${t.speaker}: ${t.text}`).join('\n'),
      heuristicScores: {
          avgScore,
          turns: evaluations.length
      }
  });

  return { summary, antiCheat };
}

