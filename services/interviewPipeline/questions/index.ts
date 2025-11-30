// questions/index.ts - Центральный экспорт всех вопросов

export type Stage =
  | "Background"
  | "Core"
  | "SQL"
  | "DeepDive"
  | "Case"
  | "Debug"
  | "WrapUp";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type RoleKey =
  | "data_scientist"
  | "data_analyst"
  | "anti_fraud"
  | "backend"
  | "frontend"
  | "devops"
  | "ml_engineer"
  | "product_manager"
  | "sql_specialist"
  | "sql_analyst"
  | "cybersecurity"
  | "ecommerce_seller"
  | "sales_manager";

export type QuestionEntry = {
  text: string;
  stage: Stage;
  difficulty: Difficulty;
  tags?: string[];
  expectedKeywords?: string[];
};

// Импортируем вопросы после определения типов
import { dataAnalystQuestions } from './dataAnalyst';
import { dataScientistQuestions } from './dataScientist';
import { antiFraudQuestions } from './antiFraud';
import { backendQuestions } from './backend';
import { frontendQuestions } from './frontend';
import { devopsQuestions } from './devops';
import { cybersecurityQuestions } from './cybersecurity';
import { salesQuestions } from './sales';
import { productQuestions } from './product';

export const QUESTION_BANK: Record<RoleKey, QuestionEntry[]> = {
  data_analyst: dataAnalystQuestions,
  data_scientist: dataScientistQuestions,
  anti_fraud: antiFraudQuestions,
  backend: backendQuestions,
  frontend: frontendQuestions,
  devops: devopsQuestions,
  ml_engineer: dataScientistQuestions, // Use DS questions for ML
  product_manager: productQuestions,
  sql_specialist: dataAnalystQuestions, // SQL-focused
  sql_analyst: dataAnalystQuestions,
  cybersecurity: cybersecurityQuestions,
  ecommerce_seller: salesQuestions,
  sales_manager: salesQuestions,
};

export function roleToKey(role: string): RoleKey {
  const lower = role.toLowerCase();
  if (lower.includes("data scientist") || lower.includes("ml engineer") || lower.includes("machine learning")) return "data_scientist";
  if (lower.includes("data analyst") || lower.includes("bi analyst") || lower.includes("business analyst")) return "data_analyst";
  if (lower.includes("anti-fraud") || lower.includes("antifraud") || lower.includes("fraud")) return "anti_fraud";
  if (lower.includes("backend") || lower.includes("java") || lower.includes("python developer") || lower.includes("node")) return "backend";
  if (lower.includes("frontend") || lower.includes("react") || lower.includes("vue") || lower.includes("angular")) return "frontend";
  if (lower.includes("devops") || lower.includes("sre") || lower.includes("platform")) return "devops";
  if (lower.includes("product") || lower.includes("pm")) return "product_manager";
  if (lower.includes("sql")) return "sql_analyst";
  if (lower.includes("cyber") || lower.includes("security") || lower.includes("soc") || lower.includes("pentest")) return "cybersecurity";
  if (lower.includes("sales") || lower.includes("seller") || lower.includes("account manager")) return "sales_manager";
  return "data_analyst";
}

// Функция для получения вопроса по роли, стадии и сложности
export function getQuestionForRoleAndStage(
  role: string,
  stage: Stage,
  difficulty: Difficulty,
  usedQuestions: string[] = []
): string | null {
  const key = roleToKey(role);
  if (!key || !QUESTION_BANK[key]) return null;

  const candidates = QUESTION_BANK[key].filter(
    (q) =>
      q.stage === stage &&
      Math.abs(q.difficulty - difficulty) <= 1 &&
      !usedQuestions.includes(q.text)
  );

  if (!candidates.length) return null;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx].text;
}

// Функция для получения всех вопросов по роли
export function getQuestionsForRole(role: string): QuestionEntry[] {
  const key = roleToKey(role);
  if (!key || !QUESTION_BANK[key]) return [];
  return QUESTION_BANK[key];
}

// Функция для получения количества вопросов по роли
export function getQuestionCountForRole(role: string): number {
  return getQuestionsForRole(role).length;
}

