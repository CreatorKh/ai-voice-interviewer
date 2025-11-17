// src/config/models.ts
import { getLLMConfig } from './llmConfig';

// Модель для live-аудио (как сейчас в InterviewScreen)
// Для Gemini Live API используется специальная модель
export const LIVE_MODEL_ID = 'models/gemini-2.5-flash-native-audio-preview-09-2025';

// Модель для обычных generateContent / scoring / pipeline
// Использует конфигурацию из llmConfig (можно переключить на OpenAI)
export function getTEXT_MODEL_ID(): string {
  const config = getLLMConfig();
  // Если выбран OpenAI, используем его модель, иначе Gemini
  return config.modelId;
}

// Для обратной совместимости (используется в старых файлах)
export const TEXT_MODEL_ID = getTEXT_MODEL_ID();

