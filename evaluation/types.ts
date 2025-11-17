// Types for interview evaluation system

import { TranscriptEntry, Job, ApplicationData } from '../types';

export interface TurnEvaluation {
  question: string;
  answer: string;
  topic: string;
  hardSkillTags: string[];
  softSkillTags: string[];
  score: number;           // 0-100 за этот ответ
  strengths: string[];
  weaknesses: string[];
  flags: string[];         // например: ["possible_ai_help", "off_topic"]
}

export interface SkillScore {
  name: string;            // "React", "System Design", "English"
  score: number;           // 0-100
  evidence: string[];      // цитаты / краткие объяснения
}

export interface AntiCheatSignal {
  id: string;
  severity: 'low' | 'medium' | 'high';
  description: string;     // текст человеческий
  evidence: string;        // на основе чего такой вывод
}

export interface AntiCheatReport {
  overallRisk: 'low' | 'medium' | 'high';
  signals: AntiCheatSignal[];
  commentForRecruiter: string;
}

export interface FinalEvaluation {
  overallScore: number;            // общая оценка
  summaryForRecruiter: string;     // резюме в 1–2 абзаца
  recommendation: 'strong_hire' | 'hire' | 'borderline' | 'no_hire';

  turnEvaluations: TurnEvaluation[]; // по каждому вопросу
  skills: SkillScore[];              // агрегировано по скиллам
  antiCheat: AntiCheatReport;

  // Для ссылок
  transcript: TranscriptEntry[];
  recordingUrl?: string;
  job: Job;
  applicationData: ApplicationData;
}

