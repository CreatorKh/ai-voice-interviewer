// evaluator.ts
import { PIPELINE_CONFIG } from "./pipelineConfig";
import { safeGenerateJSON, LLMResult } from "./llmClient";

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
const LLM_EVALUATION_INTERVAL = 3; // Вызывать LLM только каждый 3-й раз
const MIN_ANSWER_LENGTH_FOR_LLM = 50; // Минимальная длина ответа для LLM-оценки

// Mercor-grade эвристическая оценка с проверкой ключевых слов и полноты
function heuristicEvaluate(
  answer: string,
  question?: string,
  expectedKeywords?: string[]
): TurnEvaluation {
  const trimmed = answer.trim();
  const tooShort = trimmed.length < PIPELINE_CONFIG.thresholds.shortAnswerChars;

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
    // Базовая оценка за длину
    const wordCount = trimmed.split(/\s+/).length;
    const lengthScore = Math.min(100, (wordCount / 50) * 100); // Нормализуем на ~50 слов
    
    score = 30 + Math.round(lengthScore * 0.3); // 30% веса на длину
    strengths.push("Answer is at least somewhat elaborated.");
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

  const llmResult: LLMResult = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.evaluator,
    systemPrompt: PIPELINE_CONFIG.prompts.evaluation,
    userPrompt: `
ROLE: ${role}
QUESTION: ${question}
ANSWER: ${answer}

INTERVIEW CONTEXT:
${transcriptSoFar}
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

