// services/interviewPipeline/types.ts

export type QuestionType =
  | 'intro'
  | 'background'
  | 'technical'
  | 'system-design'
  | 'behavioural'
  | 'deep-dive'
  | 'wrap-up';

export type InterviewPhase =
  | 'intro'
  | 'core'
  | 'deep-dive'
  | 'wrap-up';

export interface QuestionPlan {
  topic: string;
  questionType: QuestionType;
  depth: 'shallow' | 'medium' | 'deep';
  goal: string;
}

export interface SkillScore {
  name: string;
  level: number; // 0–100
  evidence: string[];
}

export interface TurnMetrics {
  question: string;
  answer: string;
  topic: string;
  questionType: QuestionType;
  depth: 'shallow' | 'medium' | 'deep';
  responseTimeMs: number;
  answerDurationMs: number;
  wordCount: number;
  uniqueWordCount: number;
  lexicalDiversity: number; // unique / total
  fillerCount: number;
  avgSentenceLength: number;
  languageGuess?: string;
  suspiciousPatterns: string[]; // локальные античит-сигналы
  score?: number; // локальная оценка
}

export interface AntiCheatSignal {
  code: string;         // напр. 'TOO_FAST_LONG_ANSWER'
  severity: 'low' | 'medium' | 'high';
  message: string;
  turnIndex: number;
}

export interface PipelineState {
  questionsAsked: number;
  totalQuestions: number;
  interviewPhase: InterviewPhase;
  discoveredStrengths: string[];
  discoveredWeaknesses: string[];
  skillProfile: SkillScore[];
  turns: TurnMetrics[];
  antiCheatSignals: AntiCheatSignal[];
  hasLLMDegraded?: boolean; // Флаг деградации LLM (503/429/таймауты)
}

// Legacy types for compatibility
export interface RefinedQuestion {
  question: string;
  tone: string;
  style: string;
  metadata: {
    topic: string;
    type: string;
    estimatedDuration: number;
  };
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  skillUpdates: any[];
  quality: 'poor' | 'average' | 'good' | 'excellent' | 'unknown';
  detailedAnalysis?: string;
  rawMetrics?: TurnMetrics;
}

export interface ConversationState {
  questionsAsked: number;
  totalQuestions: number;
  interviewPhase: InterviewPhase;
  coveredTopics: string[];
  discoveredStrengths: string[];
  discoveredWeaknesses: string[];
  currentTopic: string | null;
  skillProfile: {
    skills: Array<{
      name: string;
      level: string;
      confidence: number;
    }>;
  };
  antiCheatFlags: string[];
}

export interface DraftQuestion {
  question: string;
  structure: {
    opening?: string;
    mainQuestion: string;
    followUpHints?: string[];
  };
  metadata: {
    topic: string;
    type: string;
    estimatedDuration: number;
  };
}

export interface SkillProfile {
  skills: Array<{
    name: string;
    level: string;
    confidence: number;
  }>;
}

export interface Skill {
  name: string;
  level: string;
  confidence: number;
}

export interface SkillUpdate {
  skillName: string;
  newLevel: string;
  newEvidence: string[];
  confidenceChange: number;
}
