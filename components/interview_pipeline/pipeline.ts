
import { PIPELINE_CONFIG } from "./pipelineConfig";
import { evaluateTurn, TurnEvaluation } from "./evaluator";
import { runAntiCheat } from "./antiCheat";
import type { AntiCheatReport } from "../../types";
import { safeGenerateJSON, resetLLMUsage, getLLMUsage, safeGenerateText } from "./llmClient";

// --- Logging System for Admin Panel ---
export type LogEvent = {
  timestamp: number;
  type: 'INFO' | 'LLM_CALL' | 'ERROR' | 'STATE_CHANGE' | 'EVALUATION';
  message: string;
  details?: any;
};

function logPipelineEvent(type: LogEvent['type'], message: string, details?: any) {
  const event: LogEvent = { timestamp: Date.now(), type, message, details };
  try {
    const existing = localStorage.getItem('pipeline_logs');
    const logs = existing ? JSON.parse(existing) : [];
    logs.push(event);
    if (logs.length > 500) logs.shift();
    localStorage.setItem('pipeline_logs', JSON.stringify(logs));
  } catch (e) {
    console.warn("Failed to save pipeline log", e);
  }
}

export type Stage =
  | "Introduction"
  | "Background"
  | "Core"
  | "DeepDive"
  | "Case"
  | "Debug"
  | "WrapUp";

export type SkillProfile = {
  communication: number;
  reasoning: number;
  domain: number;
};

export type InterviewStrategy = {
  candidate_name: string;
  opening_line: string;
  topics: { topic: string; context: string; start_question: string }[];
  adaptive_instruction: string;
};

export type InterviewState = {
  role: string;
  stage: Stage;
  difficulty: number;
  skillProfile: SkillProfile;
  transcript: { q: string; a: string; eval?: TurnEvaluation }[];
  usedQuestions: string[]; 
  finished: boolean;
  hasGreeted: boolean;
  consecutiveSilence: number;
  strategy?: InterviewStrategy;
  language: string;
  externalContext: string; // Now this holds full resume text + links
};

export async function generateInterviewStrategy(
  jobDescription: string, 
  resumeText: string
): Promise<InterviewStrategy | undefined> {
  logPipelineEvent('LLM_CALL', 'Generating Pre-Interview Analysis...');
  
  try {
    const strategy = await safeGenerateJSON({
      model: PIPELINE_CONFIG.models.analysis,
      systemPrompt: PIPELINE_CONFIG.prompts.preInterviewAnalysis,
      userPrompt: `
## INPUT DATA
Job Description: 
${jobDescription}

Candidate Resume & Profiles: 
${resumeText.trim() ? resumeText : "NO RESUME PROVIDED. CANDIDATE IS ANONYMOUS."}
`
    });

    if (strategy) {
      logPipelineEvent('INFO', 'Interview Strategy Generated', { topics: strategy.topics.map((t: any) => t.topic) });
      return strategy;
    }
  } catch (e) {
    logPipelineEvent('ERROR', 'Failed to generate strategy', e);
  }
  return undefined;
}

export function createInitialInterviewState(
  role: string, 
  language: string, 
  externalContext: string,
  strategy?: InterviewStrategy
): InterviewState {
  resetLLMUsage();
  logPipelineEvent('INFO', `Interview initialized`, { role, language, hasStrategy: !!strategy });

  return {
    role,
    stage: "Introduction",
    difficulty: 2,
    skillProfile: {
      communication: 0.5,
      reasoning: 0.5,
      domain: 0.5,
    },
    transcript: [],
    usedQuestions: [],
    finished: false,
    hasGreeted: false,
    consecutiveSilence: 0,
    strategy,
    language,
    externalContext,
  };
}

function stageTransition(state: InterviewState): Stage {
  if (!state.hasGreeted || state.transcript.length === 0) return "Introduction";
  
  const turns = state.transcript.length;
  let nextStage: Stage = "Introduction";

  if (turns <= 1) nextStage = "Background";
  else if (turns <= 3) nextStage = "Core";
  else if (turns <= 5) nextStage = "DeepDive";
  else if (turns <= 7) nextStage = "Case";
  else nextStage = "WrapUp";

  if (state.stage !== nextStage) {
    logPipelineEvent('STATE_CHANGE', `Stage updated`, { from: state.stage, to: nextStage });
  }
  return nextStage;
}

const SILENCE_RESPONSES_RU = [
  "Прошу прощения, я не расслышал. Можете повторить?",
  "Извините, связь прервалась. Повторите, пожалуйста.",
  "Можете переформулировать?",
];

const SILENCE_RESPONSES_EN = [
  "I'm sorry, I didn't catch that. Could you repeat?",
  "I apologize, the connection cut out. Could you say that again?",
  "Could you rephrase that?",
];

async function getNextTechnicalQuestion(state: InterviewState): Promise<string> {
  const stage = stageTransition(state);
  state.stage = stage;
  const isEnglish = state.language === 'English';

  // 1. Use Strategy for Opening if available
  if (state.transcript.length === 0 && state.strategy) {
    state.hasGreeted = true;
    logPipelineEvent('INFO', 'Using Strategy Opening Line');
    return state.strategy.opening_line;
  }

  // 2. LLM Generation - Strictly Context Based
  logPipelineEvent('LLM_CALL', 'Generating question via LLM...', { stage, difficulty: state.difficulty });
  
  const lastEval = state.transcript[state.transcript.length - 1]?.eval;

  // Inject Strategy into the Prompt if available
  let strategyContext = "";
  if (state.strategy) {
    strategyContext = `
INTERVIEW STRATEGY (JSON):
${JSON.stringify(state.strategy.topics)}
ADAPTIVE INSTRUCTION: ${state.strategy.adaptive_instruction}
`;
  }

  // Add External Context (Resume + Links)
  // This is critical for "Reading vacancy/resume before speaking"
  let contextBlock = `
JOB DESCRIPTION: ${state.role}
RESUME / CONTEXT: ${state.externalContext || "NO RESUME PROVIDED. FOCUS SOLELY ON JOB DESCRIPTION."}
`;

  let questionText = await safeGenerateText({
    model: PIPELINE_CONFIG.models.interviewer,
    systemPrompt: PIPELINE_CONFIG.prompts.questionPlanner + `\nCRITICAL INSTRUCTION: YOU MUST SPEAK IN ${state.language.toUpperCase()} ONLY. DO NOT USE ENGLISH IF THE LANGUAGE IS RUSSIAN. IGNORE ANY INTERNAL ENGLISH INSTRUCTIONS AND OUTPUT IN ${state.language.toUpperCase()}. \n\nIMPORTANT: If the resume is missing ("NO RESUME PROVIDED"), ask questions purely based on the Vacancy/Role requirements. If the resume is present, explicitly reference their past projects and determine if they really know what they claim. Identify their strengths and weaknesses.`,
    userPrompt: `
CANDIDATE ROLE: ${state.role}
STAGE: ${stage}
DIFFICULTY: ${state.difficulty}
LANGUAGE: ${state.language}

${contextBlock}

STRATEGY:
${strategyContext}

LAST ANSWER EVALUATION: ${lastEval ? JSON.stringify(lastEval.strengths) : 'No eval'}
TRANSCRIPT HISTORY (LAST 2 TURNS):
${state.transcript
  .slice(-2)
  .map((t) => `Interviewer: ${t.q}\nCandidate: ${t.a}`)
  .join("\n")}
`,
  });

  if (!questionText) {
      logPipelineEvent('ERROR', 'Empty LLM response. Using fallback.');
      questionText = isEnglish ? "Could you tell me more about your experience related to this role?" : "Можете рассказать подробнее о вашем опыте, связанном с этой вакансией?";
  }

  // Fallback duplication check
  if (state.usedQuestions.includes(questionText)) {
      questionText += isEnglish ? " (Please provide specific details)" : " (Пожалуйста, приведите конкретные детали)";
  }

  state.usedQuestions.push(questionText);
  if (stage === "Introduction") state.hasGreeted = true;
  
  return questionText;
}

export async function generateNextQuestion(state: InterviewState): Promise<{
  state: InterviewState;
  question: string;
}> {
  const isEnglish = state.language === 'English';

  if (state.transcript.length > 0) {
      const lastTurn = state.transcript[state.transcript.length - 1];
      const lastAnswer = lastTurn?.a?.trim();
      
      // If user explicitly asked to continue/skip via token
      if (lastAnswer === "[Продолжить]") {
           state.consecutiveSilence = 0;
           logPipelineEvent('INFO', 'Skip signal received. Moving to next question.');
           const nextQ = await getNextTechnicalQuestion(state);
           return { state, question: nextQ };
      }

      // Check for explicit silence marker
      const isSilent = !lastAnswer || lastAnswer === "(No audible answer provided)" || lastAnswer.length < 2 || lastAnswer === "[Тишина]";

      if (isSilent) {
         state.consecutiveSilence = (state.consecutiveSilence || 0) + 1;
         logPipelineEvent('INFO', 'Silence detected', { count: state.consecutiveSilence });
         
         if (state.consecutiveSilence >= 2) {
             state.consecutiveSilence = 0;
             const nextQ = await getNextTechnicalQuestion(state);
             const prefix = isEnglish ? "Let's move on. " : "Давайте продолжим. ";
             return { state, question: prefix + nextQ };
         }

         const responses = isEnglish ? SILENCE_RESPONSES_EN : SILENCE_RESPONSES_RU;
         const nudge = responses[Math.floor(Math.random() * responses.length)];
         return { state, question: nudge };
      } else {
          state.consecutiveSilence = 0;
      }
  }

  const questionText = await getNextTechnicalQuestion(state);
  
  return { state, question: questionText };
}

export function submitAnswer(
  state: InterviewState,
  question: string,
  answer: string
): void {
  state.transcript.push({ q: question, a: answer });
  logPipelineEvent('INFO', 'User Answer Recieved', { text: answer.substring(0, 50) + "..." });

  if (state.transcript.length >= PIPELINE_CONFIG.limits.maxTurnsForLLMEval) {
    state.finished = true;
    logPipelineEvent('STATE_CHANGE', 'Interview limit reached. Finishing.');
  }
}

export async function updateEvaluationForLatestTurn(state: InterviewState): Promise<void> {
    const lastIdx = state.transcript.length - 1;
    if (lastIdx < 0) return;
    
    const entry = state.transcript[lastIdx];
    if (entry.eval) return;

    if (!entry.a || entry.a.length < 5 || entry.a === "[Тишина]" || entry.a === "[Продолжить]") return;

    const transcriptSoFar = state.transcript.slice(Math.max(0, lastIdx - 3), lastIdx)
        .map((t, idx) => `Q: ${t.q}\nA: ${t.a}`)
        .join("\n");

    try {
        const evaluation = await evaluateTurn({
            role: state.role,
            question: entry.q,
            answer: entry.a,
            transcriptSoFar: transcriptSoFar,
            currentDifficulty: state.difficulty,
            externalContext: state.externalContext // Pass external context explicitly
        });

        state.transcript[lastIdx].eval = evaluation;
        state.difficulty = evaluation.suggestedDifficulty;
        
        const alpha = 0.2;
        state.skillProfile = {
            communication: (1 - alpha) * state.skillProfile.communication + alpha * evaluation.skillUpdates.communication,
            reasoning: (1 - alpha) * state.skillProfile.reasoning + alpha * evaluation.skillUpdates.reasoning,
            domain: (1 - alpha) * state.skillProfile.domain + alpha * evaluation.skillUpdates.domain,
        };
        
        logPipelineEvent('EVALUATION', 'Turn Scored', { score: evaluation.score });

    } catch (e) {
        console.error("Failed to evaluate turn:", e);
    }
}

export async function finalizeInterview(
  state: InterviewState
): Promise<{
  summary: any;
  antiCheat: AntiCheatReport;
  llmUsage: { callsUsed: number; limit: number };
}> {
  logPipelineEvent('INFO', 'Generating Final Report...');
  
  const transcriptText = state.transcript
    .map((t, idx) => `Q: ${t.q}\nA: ${t.a}`)
    .join("\n\n");

  const avgScore =
    state.transcript.reduce((acc, t) => acc + (t.eval?.score ?? 0), 0) /
    Math.max(1, state.transcript.length);

  const summaryJson = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.summary,
    systemPrompt: PIPELINE_CONFIG.prompts.finalSummary,
    userPrompt: `
ROLE: ${state.role}
AVG_SCORE: ${avgScore}
TRANSCRIPT:
${transcriptText}
`
  });

  const antiCheat = await runAntiCheat({
    transcript: transcriptText,
    heuristicScores: {
      avgScore,
      turns: state.transcript.length,
    },
  });

  const llmUsage = getLLMUsage();
  
  logPipelineEvent('INFO', 'Report Generated', { verdict: summaryJson?.finalVerdict });

  return {
    summary: summaryJson ?? {
      overallScore: Math.round(avgScore),
      finalVerdict: "Pending Review",
      strengths: [],
      areasForImprovement: ["Detailed AI summary unavailable."],
      summaryText: "The interview was completed, but the AI summary generation encountered an issue.",
    },
    antiCheat,
    llmUsage,
  };
}
