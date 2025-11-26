
import { PIPELINE_CONFIG } from "./pipelineConfig";
import { safeGenerateJSON } from "./llmClient";

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
  suggestedDifficulty: number;
  notes: string;
  heuristicOnly: boolean;
};

function heuristicEvaluate(answer: string, currentDifficulty: number): TurnEvaluation {
  const trimmed = answer.trim();
  const tooShort =
    trimmed.length < PIPELINE_CONFIG.thresholds.shortAnswerChars;

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
    score = 55;
    strengths.push("Answer is at least somewhat elaborated.");
    weaknesses.push("No semantic analysis (heuristic mode).");
  }

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
    suggestedDifficulty: currentDifficulty,
    notes: "Heuristic evaluation only (LLM unavailable or skipped).",
    heuristicOnly: true,
  };
}

export async function evaluateTurn(params: {
  role: string;
  question: string;
  answer: string;
  transcriptSoFar: string;
  currentDifficulty: number;
  externalContext?: string;
}): Promise<TurnEvaluation> {
  const { answer, question, role, transcriptSoFar, currentDifficulty, externalContext } = params;

  if (!answer.trim()) {
    return heuristicEvaluate(answer, currentDifficulty);
  }

  const json = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.evaluator,
    systemPrompt: PIPELINE_CONFIG.prompts.evaluation,
    userPrompt: `
ROLE: ${role}
QUESTION: ${question}
ANSWER: ${answer}
CURRENT_DIFFICULTY: ${currentDifficulty}

INTERVIEW CONTEXT:
${transcriptSoFar}

CANDIDATE PROFILE / CONTEXT:
${externalContext || "Not provided"}
`,
  });

  if (!json) {
    return heuristicEvaluate(answer, currentDifficulty);
  }

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
    suggestedDifficulty: json.suggestedDifficulty ?? currentDifficulty,
    notes: json.notes ?? "",
    heuristicOnly: false,
  };
}
