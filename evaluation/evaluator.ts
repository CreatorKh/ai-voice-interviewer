// Main evaluation module - optimized for single LLM call

import { GoogleGenerativeAI } from '@google/genai';
import { TEXT_MODEL_ID } from '../config/models';
import { TranscriptEntry, Speaker, Job, ApplicationData } from '../types';
import { FinalEvaluation, TurnEvaluation, SkillScore, AntiCheatReport } from './types';
import { PipelineState } from '../services/interviewPipeline/types';
import { PIPELINE_CONFIG } from '../services/interviewPipeline/pipelineConfig';
import { runAntiCheat as runNewAntiCheat } from '../services/interviewPipeline/antiCheat';
import { safeGenerateJSON, getLLMUsage } from '../services/interviewPipeline/llmClient';

const client = new GoogleGenerativeAI(process.env.API_KEY as string);

// 1. Превратить transcript в массив Q/A блоков
function groupIntoTurns(transcript: TranscriptEntry[]): { question: string; answer: string }[] {
  const turns: { question: string; answer: string }[] = [];
  let currentQuestion = '';
  let currentAnswer = '';

  for (const entry of transcript) {
    if (entry.speaker === Speaker.AI) {
      if (currentQuestion || currentAnswer) {
        if (currentQuestion.trim() && currentAnswer.trim()) {
          turns.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
        }
        currentAnswer = '';
      }
      currentQuestion = (currentQuestion + ' ' + entry.text).trim();
    } else if (entry.speaker === Speaker.USER) {
      currentAnswer = (currentAnswer + ' ' + entry.text).trim();
    }
  }

  if (currentQuestion.trim() && currentAnswer.trim()) {
    turns.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
  }

  return turns.filter(t => t.question && t.answer);
}

// 2. Локальная оценка одного Q/A блока (БЕЗ LLM)
function evaluateTurnLocally(
  question: string,
  answer: string,
): TurnEvaluation {
  const text = (answer || '').trim();

  // Очень короткий ответ
  if (!text || text.length < 2) {
    return {
      question,
      answer,
      topic: 'General',
      hardSkillTags: [],
      softSkillTags: [],
      score: 10,
      strengths: [],
      weaknesses: ['Very short or low-effort answer'],
      flags: ['low_effort', 'evasive'],
    };
  }

  // Простые эвристики
  const hasNumbers = /\d/.test(text);
  const hasTechKeywords = /(sql|python|pandas|model|api|pipeline|docker|kubernetes|ml|data|react|javascript|typescript|node|algorithm|database|server|client|frontend|backend)/i.test(text);
  const lengthScore = Math.min(100, text.length * 2); // чем длиннее, тем больше (но до 100)
  
  const fillerWords = ['ээ', 'э', 'ну', 'как бы', 'типа', 'um', 'uh', 'you know', 'like', 'so'];
  const fillerCount = text.split(/\s+/).filter(w => fillerWords.includes(w.toLowerCase())).length;
  const hasLowFillers = fillerCount < 3;

  // Определяем тему по ключевым словам
  let topic = 'General';
  const topicKeywords: { [key: string]: string[] } = {
    'React': ['react', 'component', 'jsx', 'hooks', 'state'],
    'Python': ['python', 'pandas', 'numpy', 'django', 'flask'],
    'System Design': ['system', 'architecture', 'scalable', 'distributed', 'microservices'],
    'Algorithms': ['algorithm', 'complexity', 'sort', 'search', 'tree', 'graph'],
    'Database': ['database', 'sql', 'query', 'index', 'transaction'],
  };

  for (const [t, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(k => text.toLowerCase().includes(k))) {
      topic = t;
      break;
    }
  }

  // Hard skills из ключевых слов
  const hardSkillTags: string[] = [];
  if (hasTechKeywords) {
    if (/react|jsx|component/i.test(text)) hardSkillTags.push('React');
    if (/python|pandas|numpy/i.test(text)) hardSkillTags.push('Python');
    if (/sql|database|query/i.test(text)) hardSkillTags.push('SQL');
    if (/docker|kubernetes|container/i.test(text)) hardSkillTags.push('DevOps');
    if (/algorithm|complexity|data structure/i.test(text)) hardSkillTags.push('Algorithms');
  }

  // Soft skills
  const softSkillTags: string[] = [];
  if (hasLowFillers && text.length > 50) softSkillTags.push('Communication');
  if (hasNumbers) softSkillTags.push('Problem Solving');
  if (text.length > 100) softSkillTags.push('Detail-oriented');

  // Вычисляем score
  let score = 30; // базовый
  score += Math.min(30, lengthScore * 0.3); // длина ответа
  score += hasTechKeywords ? 20 : 0; // технические ключевые слова
  score += hasNumbers ? 10 : 0; // конкретные числа/примеры
  score += hasLowFillers ? 10 : 0; // мало filler words
  
  // Штрафы
  if (text.length < 20) score -= 20;
  if (fillerCount > 5) score -= 10;

  score = Math.max(0, Math.min(100, score));

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (text.length >= 50 && text.length <= 200) {
    strengths.push('Provides answers with reasonable level of detail');
  } else if (text.length < 20) {
    weaknesses.push('Answers are too short and lack detail');
  } else if (text.length > 300) {
    weaknesses.push('Answers are overly long and may lack focus');
  }

  if (hasTechKeywords) {
    strengths.push('Demonstrates technical knowledge');
  }

  if (hasLowFillers && text.length > 40) {
    strengths.push('Fluent answer with minimal filler words');
  } else if (fillerCount > 5) {
    weaknesses.push('Uses too many filler words');
  }

  const flags: string[] = [];
  if (text.length < 10) flags.push('low_effort');
  if (/не хочу|pass|skip|i don't know|не знаю/i.test(text)) flags.push('evasive');

  return {
    question,
    answer,
    topic,
    hardSkillTags,
    softSkillTags,
    score,
    strengths,
    weaknesses,
    flags,
  };
}

// 3. Агрегация по скиллам
function aggregateSkills(turns: TurnEvaluation[]): SkillScore[] {
  const map = new Map<string, { sum: number; count: number; evidence: string[] }>();

  for (const t of turns) {
    for (const skill of t.hardSkillTags) {
      if (!map.has(skill)) map.set(skill, { sum: 0, count: 0, evidence: [] });
      const e = map.get(skill)!;
      e.sum += t.score;
      e.count += 1;
      if (e.evidence.length < 3) {
        e.evidence.push(`Q: ${t.question.slice(0, 80)}... A: ${t.answer.slice(0, 80)}...`);
      }
    }
  }

  return Array.from(map.entries()).map(([name, data]) => ({
    name,
    score: data.count ? Math.round(data.sum / data.count) : 0,
    evidence: data.evidence,
  }));
}

// 4. Финальный репорт - ОДИН вызов LLM
export async function generateFinalEvaluation(
  transcript: TranscriptEntry[],
  recordingUrl: string | undefined,
  job: Job,
  applicationData: ApplicationData,
  pipelineState?: PipelineState,
): Promise<FinalEvaluation> {
  const turns = groupIntoTurns(transcript);

  if (turns.length === 0) {
    return {
      overallScore: 0,
      summaryForRecruiter: 'No interview data available for evaluation.',
      recommendation: 'borderline',
      turnEvaluations: [],
      skills: [],
      antiCheat: {
        overallRisk: 'low',
        signals: [],
        commentForRecruiter: 'No data available for anti-cheat analysis.',
      },
      transcript,
      recordingUrl,
      job,
      applicationData,
    };
  }

  // Локальная оценка всех turns (БЕЗ LLM)
  const turnEvaluations: TurnEvaluation[] = turns.map(t => 
    evaluateTurnLocally(t.question, t.answer)
  );

  const skills = aggregateSkills(turnEvaluations);

  // Вычисляем локальные средние
  const avgScore = turnEvaluations.length > 0
    ? Math.round(turnEvaluations.reduce((sum, t) => sum + t.score, 0) / turnEvaluations.length)
    : 0;

  // Базовая локальная оценка (fallback если LLM не доступен)
  const baseEvaluation: FinalEvaluation = {
    overallScore: avgScore,
    summaryForRecruiter: `Interview completed with ${turns.length} question-answer pairs. Average score: ${avgScore}/100 based on local heuristic evaluation.`,
    recommendation: avgScore >= 70 ? 'hire' : avgScore >= 50 ? 'borderline' : 'no_hire',
    turnEvaluations,
    skills,
    antiCheat: {
      overallRisk: 'low',
      signals: [],
      commentForRecruiter: 'Anti-cheat analysis based on local heuristics only.',
    },
    transcript,
    recordingUrl,
    job,
    applicationData,
  };

  // Попытка улучшить оценку через LLM (один вызов) - используем новый safeGenerateJSON
  try {
    // Собираем все саммари из turnEvaluations
    const allTurnSummaries = turnEvaluations.map((turn, idx) => {
      const strengths = turn.strengths.length > 0 ? `Strengths: ${turn.strengths.join(', ')}` : '';
      const weaknesses = turn.weaknesses.length > 0 ? `Areas for improvement: ${turn.weaknesses.join(', ')}` : '';
      const flags = turn.flags.length > 0 ? `Flags: ${turn.flags.join(', ')}` : '';
      return `Q${idx + 1}: ${turn.topic} (Score: ${turn.score}/100)\n${strengths ? strengths + '\n' : ''}${weaknesses ? weaknesses + '\n' : ''}${flags ? flags : ''}`;
    }).join('\n\n');

    const skillsSummary = skills.length > 0 
      ? skills.map(s => `${s.name}: ${s.score}/100`).join(', ')
      : 'No specific skills evaluated';

    // Античит сигналы из pipeline state
    const antiCheatSignals = pipelineState?.antiCheatSignals || [];
    const antiCheatSummary = antiCheatSignals.length > 0
      ? `Heuristic signals: ${antiCheatSignals.map((s: any) => `${s.code || s.id || 'signal'} (${s.severity || 'low'})`).join(', ')}`
      : 'No significant signals detected';

    // Use new safeGenerateJSON with quota limits
    const transcriptText = transcript
      .map((t, idx) => `${t.speaker}: ${t.text}`)
      .join('\n');

    // REFINE-ЦЕПОЧКА: Draft Pass → Refine Pass
    // Шаг 1: Draft Pass (быстрая модель для черновой оценки)
    const draftResult = await safeGenerateJSON({
      model: PIPELINE_CONFIG.models.summary,
      systemPrompt: PIPELINE_CONFIG.prompts.finalSummary,
      userPrompt: `

ROLE: ${job.title}
CANDIDATE: ${applicationData.name}
RESUME: ${applicationData.profileSummary || ''}
SKILLS: ${applicationData.parsedSkills ? applicationData.parsedSkills.join(', ') : ''}

DETAILED TURN-BY-TURN EVALUATION:
${allTurnSummaries}

AGGREGATED SKILL SCORES:
${skillsSummary}

LOCAL AVERAGE SCORE: ${avgScore}/100

TRANSCRIPT:
${transcriptText}
`,
    });

    // Шаг 2: Refine Pass (мощная модель для финальной оценки)
    let summaryResult = draftResult;
    if (draftResult.ok && draftResult.fromLLM && draftResult.data) {
      // Если draft успешен, делаем refine с мощной моделью
      const refineResult = await safeGenerateJSON({
        model: PIPELINE_CONFIG.models.summaryRefine,
        systemPrompt: PIPELINE_CONFIG.prompts.finalSummaryRefine,
        userPrompt: `

ORIGINAL DRAFT EVALUATION:
${JSON.stringify(draftResult.data, null, 2)}

FULL TRANSCRIPT:
${transcriptText}

DETAILED TURN-BY-TURN EVALUATION:
${allTurnSummaries}

AGGREGATED SKILL SCORES:
${skillsSummary}

ROLE: ${job.title}
CANDIDATE: ${applicationData.name}
RESUME: ${applicationData.profileSummary || ''}
SKILLS: ${applicationData.parsedSkills ? applicationData.parsedSkills.join(', ') : ''}

Please review the draft evaluation, check it against the transcript, and provide a refined, professional final evaluation.
`,
      });

      // Используем refine результат, если он успешен, иначе fallback на draft
      if (refineResult.ok && refineResult.fromLLM && refineResult.data) {
        summaryResult = refineResult;
        console.log('[Evaluator] Refine pass completed successfully');
      } else {
        console.warn('[Evaluator] Refine pass failed, using draft evaluation');
        // summaryResult уже содержит draftResult
      }
    }

    // Use new anti-cheat module (только в конце интервью)
    const antiCheatReport = await runNewAntiCheat({
      transcript: transcriptText,
      heuristicScores: {
        avgScore,
        turns: turnEvaluations.length,
      },
    });

    // Жесткая проверка: если LLM не сработал, используем fallback
    if (!summaryResult.ok || !summaryResult.fromLLM || !summaryResult.data) {
      // Fallback if LLM unavailable
      return {
        ...baseEvaluation,
        summaryForRecruiter: baseEvaluation.summaryForRecruiter + ` LLM-based refinement was skipped due to API quota limits (${summaryResult.fallbackReason || 'service_error'}). Scores are based on local heuristics only.`,
        antiCheat: {
          overallRisk: antiCheatReport.verdict === 'cheating' ? 'high' : antiCheatReport.verdict === 'suspicious' ? 'medium' : 'low',
          signals: antiCheatReport.flags.map((flag, idx) => ({
            id: `signal_${idx}`,
            severity: antiCheatReport.riskScore > 70 ? 'high' : antiCheatReport.riskScore > 40 ? 'medium' : 'low',
            description: flag,
            evidence: flag,
          })),
          commentForRecruiter: antiCheatReport.reason,
        },
      };
    }

    const summaryParsed = summaryResult.data;

    // Объединяем LLM оценку с локальными turnEvaluations
    const llmUsage = getLLMUsage();
    const final: FinalEvaluation = {
      overallScore: Number(summaryParsed.overallScore) || avgScore,
      summaryForRecruiter: summaryParsed.summaryForRecruiter || baseEvaluation.summaryForRecruiter,
      recommendation: summaryParsed.recommendation || baseEvaluation.recommendation,
      turnEvaluations, // Используем локальные оценки
      skills,
      antiCheat: summaryParsed.antiCheat ? {
        overallRisk: summaryParsed.antiCheat.overallRisk || 'low',
        signals: summaryParsed.antiCheat.signals || [],
        commentForRecruiter: summaryParsed.antiCheat.commentForRecruiter || '',
      } : {
        overallRisk: antiCheatReport.verdict === 'cheating' ? 'high' : antiCheatReport.verdict === 'suspicious' ? 'medium' : 'low',
        signals: antiCheatReport.flags.map((flag, idx) => ({
          id: `signal_${idx}`,
          severity: antiCheatReport.riskScore > 70 ? 'high' : antiCheatReport.riskScore > 40 ? 'medium' : 'low',
          description: flag,
          evidence: flag,
        })),
        commentForRecruiter: antiCheatReport.reason,
      },
      transcript,
      recordingUrl,
      job,
      applicationData,
    };

    // Add quota warning if needed
    if (llmUsage.callsUsed >= llmUsage.limit * 0.8) {
      final.summaryForRecruiter += `\n\nNote: LLM evaluation was partially limited due to quota constraints (${llmUsage.callsUsed}/${llmUsage.limit} calls used).`;
    }

    return final;
  } catch (error: any) {
    const status = error?.status || error?.cause?.status || error?.response?.status;
    if (status === 429 || status === 503) {
      console.warn('Final summary: model busy or quota exceeded, using local evaluation', error);
      // Возвращаем локальную оценку с флагом
      return {
        ...baseEvaluation,
        summaryForRecruiter: baseEvaluation.summaryForRecruiter + ' LLM-based refinement was skipped due to API quota limits. Scores are based on local heuristics.',
      };
    }
    console.error('Error generating final summary:', error);
    // Fallback на локальную оценку
    return baseEvaluation;
  }
}
