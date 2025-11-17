// newPipeline.ts - Unified orchestrator with question bank
import { PIPELINE_CONFIG } from "./pipelineConfig";
import { evaluateTurn, TurnEvaluation } from "./evaluator";
import { runAntiCheat, AntiCheatReport } from "./antiCheat";
import { safeGenerateJSON, resetLLMUsage, getLLMUsage } from "./llmClient";
import { QUESTION_BANK, getQuestionForRoleAndStage, Stage } from "./questionBank";

export type SkillProfile = {
  communication: number;
  reasoning: number;
  domain: number;
};

export type InterviewState = {
  role: string;
  stage: Stage;
  difficulty: number;
  skillProfile: SkillProfile;
  transcript: { q: string; a: string; eval?: TurnEvaluation }[];
  finished: boolean;
};

export function createInitialInterviewState(role: string): InterviewState {
  resetLLMUsage();

  return {
    role,
    stage: "Background",
    difficulty: 2,
    skillProfile: {
      communication: 0.5,
      reasoning: 0.5,
      domain: 0.5,
    },
    transcript: [],
    finished: false,
  };
}

function stageTransition(state: InterviewState): Stage {
  const turns = state.transcript.length;
  if (turns <= 1) return "Background";
  if (turns <= 3) return "Core";
  if (turns <= 6) return "DeepDive";
  if (turns <= 8) return "Case";
  if (turns <= 10) return "Debug";
  return "WrapUp";
}

async function updateDifficulty(
  current: number,
  lastScore: number
): Promise<number> {
  const json = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.evaluator,
    systemPrompt: PIPELINE_CONFIG.prompts.difficultyController,
    userPrompt: `
CURRENT_LEVEL: ${current}
LAST_SCORE: ${lastScore}
`,
  });

  if (!json) {
    // fallback по порогам
    const { low, mid, high } = PIPELINE_CONFIG.thresholds.difficulty;
    if (lastScore < low) return Math.max(1, current - 1);
    if (lastScore > high) return Math.min(5, current + 1);
    return current;
  }

  const level = Number(json);
  if (!Number.isFinite(level)) return current;
  return Math.min(5, Math.max(1, level));
}

async function updateSkillProfile(
  prev: SkillProfile,
  evalTurn: TurnEvaluation
): Promise<SkillProfile> {
  const json = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.evaluator,
    systemPrompt: PIPELINE_CONFIG.prompts.skillEngine,
    userPrompt: `
PREVIOUS_SKILLS: ${JSON.stringify(prev)}
EVALUATION: ${JSON.stringify(evalTurn)}
`,
  });

  if (!json) {
    // простой EMA
    const alpha = 0.2;
    return {
      communication:
        (1 - alpha) * prev.communication + alpha * evalTurn.skillUpdates.communication,
      reasoning:
        (1 - alpha) * prev.reasoning + alpha * evalTurn.skillUpdates.reasoning,
      domain: (1 - alpha) * prev.domain + alpha * evalTurn.skillUpdates.domain,
    };
  }

  return {
    communication: json.communication ?? prev.communication,
    reasoning: json.reasoning ?? prev.reasoning,
    domain: json.domain ?? prev.domain,
  };
}

export async function generateNextQuestion(state: InterviewState): Promise<{
  state: InterviewState;
  question: string;
}> {
  const stage = stageTransition(state);
  state.stage = stage;

  // 1) Пытаемся взять вопрос из локального банка (шаблоны)
  const bankQuestion = getQuestionForRoleAndStage(
    state.role,
    stage,
    state.difficulty as 1 | 2 | 3 | 4 | 5
  );

  if (bankQuestion) {
    return { state, question: bankQuestion };
  }

  // 2) Если банк ничего не дал — планируем через LLM
  const lastEval = state.transcript[state.transcript.length - 1]?.eval;

  const json = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.interviewer,
    systemPrompt: PIPELINE_CONFIG.prompts.questionPlanner,
    userPrompt: `
ROLE: ${state.role}
STAGE: ${stage}
DIFFICULTY: ${state.difficulty}
LAST_EVAL: ${JSON.stringify(lastEval ?? null)}
SKILLS: ${JSON.stringify(state.skillProfile)}
TRANSCRIPT_SUMMARY (short):
${state.transcript
  .slice(-5)
  .map((t) => `Q: ${t.q}\nA: ${t.a}`)
  .join("\n\n")}
`,
  });

  const question =
    (typeof json === "string" && json) ||
    "Расскажите о недавнем проекте, которым вы особенно гордитесь, и вашей роли в нём.";

  return { state, question };
}

export async function processAnswer(params: {
  state: InterviewState;
  question: string;
  answer: string;
}): Promise<{ state: InterviewState }> {
  const { state, question, answer } = params;

  const transcriptText = state.transcript
    .map((t, idx) => `Q${idx + 1}: ${t.q}\nA${idx + 1}: ${t.a}`)
    .join("\n\n");

  const evaluation = await evaluateTurn({
    role: state.role,
    question,
    answer,
    transcriptSoFar: transcriptText,
  });

  state.transcript.push({ q: question, a: answer, eval: evaluation });

  // обновляем сложность
  state.difficulty = await updateDifficulty(
    state.difficulty,
    evaluation.score
  );

  // обновляем skill vector
  state.skillProfile = await updateSkillProfile(
    state.skillProfile,
    evaluation
  );

  // решаем, завершать ли интервью (простая логика, можешь усилить)
  if (state.transcript.length >= PIPELINE_CONFIG.limits.maxTurnsForLLMEval) {
    state.finished = true;
  }

  return { state };
}

export async function finalizeInterview(
  state: InterviewState
): Promise<{
  summary: any;
  antiCheat: AntiCheatReport;
  llmUsage: { callsUsed: number; limit: number };
}> {
  const transcriptText = state.transcript
    .map(
      (t, idx) =>
        `Q${idx + 1}: ${t.q}\nA${idx + 1}: ${t.a}\nSCORE: ${
          t.eval?.score ?? "n/a"
        }`
    )
    .join("\n\n");

  const avgScore =
    state.transcript.reduce((acc, t) => acc + (t.eval?.score ?? 0), 0) /
    Math.max(1, state.transcript.length);

  const summaryJson = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.summary,
    systemPrompt: PIPELINE_CONFIG.prompts.finalSummary,
    userPrompt: `
ROLE: ${state.role}
SKILL_PROFILE: ${JSON.stringify(state.skillProfile)}
AVG_SCORE: ${avgScore}

TRANSCRIPT WITH SCORES:
${transcriptText}
`,
  });

  const antiCheat = await runAntiCheat({
    transcript: transcriptText,
    heuristicScores: {
      avgScore,
      turns: state.transcript.length,
    },
  });

  const llmUsage = getLLMUsage();

  return {
    summary: summaryJson ?? {
      overallScore: avgScore,
      finalVerdict: "No Hire",
      strengths: [],
      areasForImprovement: ["LLM summary unavailable, using heuristics only."],
      summaryText:
        "Interview completed, but final LLM summary could not be generated due to quota or service limits.",
    },
    antiCheat,
    llmUsage,
  };
}

