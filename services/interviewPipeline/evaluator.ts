// evaluator.ts
import { PIPELINE_CONFIG } from "./pipelineConfig";
import { safeGenerateJSON, LLMResult } from "./llmClient";
import { generateScoringPrompt, getRubricForRole } from "./scoringRubrics";

export type TurnEvaluation = {
  score: number; // 0–100
  strengths: string[];
  weaknesses: string[];
  quality:
    | "excellent"
    | "good"
    | "average"
    | "weak"
    | "unacceptable"
    | "unknown";
  skillUpdates: {
    communication: number;
    reasoning: number;
    domain: number;
  };
  notes: string;
  heuristicOnly: boolean;
  scoreSource: 'heuristic' | 'llm'; // Новый флаг для UI
};

// Счетчик вызовов для контроля частоты LLM
let turnEvaluationCount = 0;
const LLM_EVALUATION_INTERVAL = 1; // Evaluate EVERY turn for Expert-grade accuracy
const MIN_ANSWER_LENGTH_FOR_LLM = 10; // Even short answers should be evaluated by LLM if possible

// Expert-grade эвристическая оценка с проверкой ключевых слов и полноты
function heuristicEvaluate(
  answer: string,
  question?: string,
  expectedKeywords?: string[]
): TurnEvaluation {
  const trimmed = answer.trim();
  const tooShort = trimmed.length < PIPELINE_CONFIG.thresholds.shortAnswerChars;
  const wordCount = trimmed.split(/\s+/).length;

  let score = 50;
  const weaknesses: string[] = [];
  const strengths: string[] = [];

  if (!trimmed) {
    score = 5;
    weaknesses.push("No answer provided.");
  } else if (tooShort) {
    score = 25;
    weaknesses.push("Answer is extremely short and lacks detail.");
  } else {
    // Базовая оценка за длину (но не линейно)
    const lengthScore = Math.min(100, (wordCount / 30) * 100); // Насыщение на 30 словах
    
    // Penalize repetition (dumb anti-spam)
    const uniqueWords = new Set(trimmed.toLowerCase().split(/\s+/)).size;
    const diversityRatio = uniqueWords / wordCount;
    
    if (diversityRatio < 0.4 && wordCount > 20) {
       score = 20; // Spam detected
       weaknesses.push("Answer is repetitive and lacks content.");
    } else {
       score = 40 + Math.round(lengthScore * 0.2); // Base 40 + up to 20 for length
       if (wordCount > 10) strengths.push("Answer provided.");
    }
  }

  // Проверка ключевых слов (если предоставлены)
  if (expectedKeywords && expectedKeywords.length > 0) {
    const lowerAnswer = trimmed.toLowerCase();
    const mentioned = expectedKeywords.filter(k => 
      lowerAnswer.includes(k.toLowerCase())
    );
    const keywordCoverage = mentioned.length / expectedKeywords.length;
    
    // 70% веса на ключевые слова
    score = Math.round(score * 0.3 + keywordCoverage * 100 * 0.7);
    
    if (keywordCoverage >= 0.7) {
      strengths.push("Answer covers most expected key points.");
    } else if (keywordCoverage < 0.3) {
      weaknesses.push("Answer misses important key points.");
    }
  }

  // Проверка полноты: наличие конкретных примеров, метрик, шагов
  const hasNumbers = /\d+/.test(trimmed);
  const hasExamples = /например|for example|например|instance|case|проект|project/i.test(trimmed);
  const hasSteps = /(first|then|next|finally|сначала|затем|потом|наконец)/i.test(trimmed);
  
  if (hasNumbers) {
    score += 10;
    strengths.push("Answer includes specific metrics or numbers.");
  }
  if (hasExamples) {
    score += 10;
    strengths.push("Answer provides concrete examples.");
  }
  if (hasSteps) {
    score += 5;
    strengths.push("Answer is structured with clear steps.");
  }

  // Проверка на отрицательный ответ (нет опыта)
  const lowerAnswer = trimmed.toLowerCase();
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
  ];
  
  const isNegative = negativePatterns.some(pattern => pattern.test(lowerAnswer));
  if (isNegative) {
    score = Math.max(5, score - 30);
    weaknesses.push("Candidate explicitly stated lack of experience.");
  }

  // Check for toxic keywords
  for (const toxic of PIPELINE_CONFIG.thresholds.toxicKeywords) {
    if (lowerAnswer.includes(toxic.toLowerCase())) {
      score = Math.max(0, score - 40);
      weaknesses.push(`Inappropriate language detected.`);
      break;
    }
  }

  // Проверка на evasive ответы
  if (/не хочу|pass|skip|i don't want|не хочу/i.test(lowerAnswer)) {
    score = Math.max(5, score - 30);
    weaknesses.push("Candidate explicitly avoided answering.");
  }

  // Проверка на формальность/шаблонность (возможный AI-ответ)
  const tooFormal = /(firstly|secondly|in conclusion|to summarize|во-первых|во-вторых|в заключение)/i.test(lowerAnswer);
  if (tooFormal && wordCount > 100) {
    score -= 5;
    weaknesses.push("Answer may be overly formal or template-like.");
  }

  // Нормализация score
  score = Math.max(0, Math.min(100, score));

  const quality: TurnEvaluation["quality"] =
    score >= 80
      ? "excellent"
      : score >= 65
      ? "good"
      : score >= 45
      ? "average"
      : score >= 25
      ? "weak"
      : "unacceptable";

  return {
    score,
    strengths,
    weaknesses,
    quality,
    skillUpdates: {
      communication: score / 100,
      reasoning: score / 100,
      domain: score / 100,
    },
    notes: "Heuristic evaluation only (LLM unavailable or skipped).",
    heuristicOnly: true,
    scoreSource: 'heuristic',
  };
}

export async function evaluateTurn(params: {
  role: string;
  question: string;
  answer: string;
  transcriptSoFar: string;
  turnIndex?: number; // Индекс тура для контроля частоты
}): Promise<TurnEvaluation> {
  const { answer, question, role, transcriptSoFar, turnIndex = 0 } = params;
  turnEvaluationCount += 1;

  // Если нет ответа — сразу эвристика
  if (!answer.trim()) {
    return heuristicEvaluate(answer, question);
  }

  const trimmed = answer.trim();
  const shouldUseLLM = 
    trimmed.length >= MIN_ANSWER_LENGTH_FOR_LLM && // Достаточно длинный ответ
    (turnEvaluationCount % LLM_EVALUATION_INTERVAL === 0 || turnIndex === 0); // Каждый 3-й или первый

  if (!shouldUseLLM) {
    console.log(`[Evaluator] Skipping LLM for turn ${turnIndex} (heuristic only, length: ${trimmed.length})`);
    // Извлекаем ожидаемые ключевые слова из вопроса (простая эвристика)
    const expectedKeywords = extractExpectedKeywords(question, role);
    return heuristicEvaluate(answer, question, expectedKeywords);
  }

  // Генерируем специфичный промпт для оценки на основе роли
  const roleSpecificPrompt = generateScoringPrompt(role);

  const llmResult: LLMResult = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.evaluator,
    systemPrompt: `${PIPELINE_CONFIG.prompts.evaluation}\n\n${roleSpecificPrompt}`,
    userPrompt: `
ROLE: ${role}
QUESTION: ${question}
ANSWER: ${answer}

INTERVIEW CONTEXT:
${transcriptSoFar}

IMPORTANT: Score this answer STRICTLY based on the role-specific criteria above.
- Be harsh on vague answers
- Reward specific examples with metrics
- Penalize rehearsed/generic answers
`,
  });

  // Жесткая проверка: если LLM не сработал, ВСЕГДА heuristicOnly = true
  if (!llmResult.ok || !llmResult.fromLLM || !llmResult.data) {
    console.log(`[Evaluator] LLM failed (${llmResult.fallbackReason}), using heuristic`);
    const expectedKeywords = extractExpectedKeywords(question, role);
    return heuristicEvaluate(answer, question, expectedKeywords);
  }

  const json = llmResult.data;

  return {
    score: json.score ?? 50,
    strengths: json.strengths ?? [],
    weaknesses: json.weaknesses ?? [],
    quality: json.quality ?? "unknown",
    skillUpdates: json.skillUpdates ?? {
      communication: 0.5,
      reasoning: 0.5,
      domain: 0.5,
    },
    notes: json.notes ?? "",
    heuristicOnly: false,
    scoreSource: 'llm',
  };
}

// Извлечение ожидаемых ключевых слов из вопроса (эвристика)
function extractExpectedKeywords(question: string, role: string): string[] {
  const keywords: string[] = [];
  const lowerQuestion = question.toLowerCase();
  const lowerRole = role.toLowerCase();

  // Роль-специфичные ключевые слова
  if (lowerRole.includes('data') || lowerRole.includes('analyst')) {
    keywords.push('data', 'analysis', 'sql', 'python', 'metrics');
  }
  if (lowerRole.includes('fraud') || lowerRole.includes('antifraud')) {
    keywords.push('fraud', 'detection', 'risk', 'transaction', 'kyc');
  }
  if (lowerRole.includes('ml') || lowerRole.includes('engineer')) {
    keywords.push('model', 'training', 'deployment', 'mlops', 'pipeline');
  }
  if (lowerRole.includes('backend')) {
    keywords.push('api', 'database', 'server', 'scalability');
  }
  if (lowerRole.includes('frontend')) {
    keywords.push('ui', 'component', 'react', 'javascript', 'state');
  }

  // Извлечение из вопроса
  const techTerms = ['python', 'sql', 'react', 'node', 'docker', 'kubernetes', 'aws', 'azure'];
  for (const term of techTerms) {
    if (lowerQuestion.includes(term)) {
      keywords.push(term);
    }
  }

  return [...new Set(keywords)]; // Уникальные
}

// Сброс счетчика при новом интервью
export function resetEvaluationCounter() {
  turnEvaluationCount = 0;
}

export async function generateFinalEvaluation(params: {
  transcript: { speaker: string; text: string }[];
  role: string;
  evaluations: TurnEvaluation[];
}): Promise<any> {
  const { transcript, role, evaluations } = params;
  
  // Format transcript for LLM
  const formattedTranscript = transcript
    .map((t) => `${t.speaker}: ${t.text}`)
    .join("\n");

  const evaluationsText = evaluations
    .map((e, i) => `Turn ${i + 1}: Score ${e.score}, Quality ${e.quality}, Notes: ${e.notes}`)
    .join("\n");

  // 1. Draft Summary with "Smart" Analysis
  console.log("[Evaluator] Generating DEEP ANALYSIS summary...");
  const draftResult: LLMResult = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.summary,
    systemPrompt: `
You are a PRINCIPAL ENGINEER and BAR RAISER at a top tech company (like Google/Meta).
Your job is to evaluate a candidate for the ${role} position based on an interview transcript.

=== RULES OF EVALUATION ===
1. **TRANSCRIPT REPAIR**: The transcript comes from an AI voice system. It may have typos (e.g., "Java Script" vs "JavaScript", "Re-act" vs "React"). MENTALLY CORRECT these technical terms before evaluating. Do not penalize for ASR (Automatic Speech Recognition) errors.
2. **DEEP DIVE**: Don't just read the surface. Analyze the DEPTH of their answers. Did they explain "Why", or just "How"?
3. **BEHAVIORAL ANALYSIS**:
   - Look for HEDGING words ("maybe", "I guess", "probably") -> Sign of low confidence.
   - Look for STRUCTURE (Did they use "First, Second, Finally"?) -> Sign of seniority.
   - Look for HONESTY (Did they say "I don't know" vs trying to bluff?).
4. **STRENGTH FINDING (MATCHMAKING)**: Identify their unique "Superpower". What is the ONE thing they are world-class at?

Output JSON format:
{
  "overallScore": number (0-100),
  "communication": number (0-10),
  "reasoning": number (0-10),
  "domainKnowledge": number (0-10),
  "finalVerdict": "Hire" | "No Hire" | "Strong Hire" | "Weak Hire",
  "summaryText": "Detailed executive summary...",
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "technicalDepth": "High" | "Medium" | "Low",
  "cultureFit": "High" | "Medium" | "Low",
  "redFlags": ["string"],
  "superpower": "string (The candidate's strongest selling point)"
}
`,
    userPrompt: `
ROLE: ${role}
TRANSCRIPT:
${formattedTranscript}

EVALUATIONS (Turn-by-turn):
${evaluationsText}

=== SPECIAL INSTRUCTION ===
If the transcript contains obvious speech-to-text errors (e.g. phonetic misspellings of tech terms), ignore the error and evaluate the INTENT.
However, if the candidate talks nonsense, flag it.
`,
  });

  let finalResult = draftResult.data || {};
  let llmUsed = draftResult.fromLLM;

  // 2. Refine Pass (Optional, for polish)
  if (draftResult.ok && draftResult.fromLLM) {
     console.log("[Evaluator] Refining summary with Senior Bar Raiser...");
     const refineResult: LLMResult = await safeGenerateJSON({
        model: PIPELINE_CONFIG.models.summaryRefine,
        systemPrompt: PIPELINE_CONFIG.prompts.finalSummaryRefine, // Keep standard refine structure but pass enriched context
        userPrompt: `
ORIGINAL DRAFT ANALYSIS:
${JSON.stringify(draftResult.data)}

TRANSCRIPT:
${formattedTranscript}

ROLE: ${role}

=== REFINE INSTRUCTION ===
1. Ensure the "Superpower" is clearly defined.
2. Validate the "Red Flags" - are they real or just nervousness?
3. Make the "Summary" sound like it was written by a human expert, not a bot.
4. HIGHLIGHT MATCHMAKING POTENTIAL: Which specific team/project would this person fit best?
`,
     });

     if (refineResult.ok && refineResult.fromLLM && refineResult.data) {
        finalResult = refineResult.data;
     }
  }

  // Fallback if LLM failed completely
  if (!finalResult.overallScore) {
      console.log("[Evaluator] LLM summary failed, using heuristic fallback");
      const avgScore = evaluations.length > 0 
        ? Math.round(evaluations.reduce((a, b) => a + b.score, 0) / evaluations.length) 
        : 0;
        
      finalResult = {
          overallScore: avgScore,
          communication: avgScore / 10,
          reasoning: avgScore / 10,
          domainKnowledge: avgScore / 10,
          finalVerdict: avgScore > 70 ? "Hire" : "No Hire",
          strengths: evaluations.flatMap(e => e.strengths).slice(0, 5),
          areasForImprovement: evaluations.flatMap(e => e.weaknesses).slice(0, 5),
          summaryText: "AI evaluation was skipped due to technical limits. Based on heuristics, the candidate performed with an average score of " + avgScore,
      };
      llmUsed = false;
  }

  // Check if ANY turn was evaluated by LLM
  const anyTurnLLM = evaluations.some(e => !e.heuristicOnly);
  const finalLLMUsed = llmUsed || anyTurnLLM;

  return {
      ...finalResult,
      llmUsed: finalLLMUsed,
      summarySource: finalLLMUsed ? 'llm+heuristics' : 'heuristics-only',
      // Ensure scores structure matches what UI expects
      scores: {
          comms: finalResult.communication || 0,
          reasoning: finalResult.reasoning || 0,
          domain: finalResult.domainKnowledge || 0,
          overall: finalResult.overallScore || 0,
      },
      detailedFeedback: finalResult.summaryText,
      summary: finalResult.summaryText,
      strengths: finalResult.strengths || [],
      areasForImprovement: finalResult.areasForImprovement || []
  };
}

