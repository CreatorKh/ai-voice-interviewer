// questionBank.ts - Центральный экспорт вопросов (200+ на позицию)

// Re-export всё из модульной структуры
export * from './questions/index';

// Для обратной совместимости также экспортируем основные функции
import { 
  QUESTION_BANK, 
  roleToKey, 
  getQuestionForRoleAndStage,
  getQuestionsForRole,
  getQuestionCountForRole,
  Stage,
  Difficulty,
  QuestionEntry,
  RoleKey
} from './questions/index';

export { 
  QUESTION_BANK, 
  roleToKey, 
  getQuestionForRoleAndStage,
  getQuestionsForRole,
  getQuestionCountForRole
};

export type { Stage, Difficulty, QuestionEntry, RoleKey };
