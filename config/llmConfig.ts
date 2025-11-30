// config/llmConfig.ts - Configuration for LLM provider and model selection

export type LLMProvider = "openai" | "google_gemini";

export interface LLMConfig {
  provider: LLMProvider;
  modelId: string;    // например "gpt-4o" или "gemini-1.5-flash"
  apiKey: string;
  realtimeMode?: boolean;  // если нужно real-time режим (для live интервью)
}

// Дефолтная конфигурация
// Приоритет: OpenAI ключ > Gemini ключ
const getDefaultConfig = (): LLMConfig => {
  const openaiKey = process.env.OPENAI_API_KEY || "";
  const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";

  // Если есть OpenAI ключ, используем OpenAI по умолчанию (лучшее качество)
  if (openaiKey) {
    return {
      provider: "openai",
      modelId: "gpt-4o", // Лучшая модель OpenAI для оценки
      apiKey: openaiKey,
      realtimeMode: false, // OpenAI не поддерживает realtime mode как Gemini
    };
  }

  // Иначе используем Gemini (fallback)
  return {
    provider: "google_gemini",
    modelId: "gemini-2.0-flash-exp", // Новая быстрая модель Gemini
    apiKey: geminiKey,
    realtimeMode: true,
  };
};

const DEFAULT_CONFIG: LLMConfig = getDefaultConfig();

// Ключ для localStorage
const CONFIG_STORAGE_KEY = "llm_config";

// Загрузка конфигурации из localStorage или использование дефолтной
export function loadLLMConfig(): LLMConfig {
  if (typeof window === "undefined") {
    // Server-side: используем дефолт
    return DEFAULT_CONFIG;
  }

  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Валидация
      if (parsed.provider && parsed.modelId && parsed.apiKey) {
        return parsed as LLMConfig;
      }
    }
  } catch (e) {
    console.warn("Failed to load LLM config from localStorage:", e);
  }

  return DEFAULT_CONFIG;
}

// Сохранение конфигурации в localStorage
export function saveLLMConfig(config: LLMConfig): void {
  if (typeof window === "undefined") {
    console.warn("Cannot save LLM config on server-side");
    return;
  }

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save LLM config to localStorage:", e);
  }
}

// Получить текущую конфигурацию
export function getLLMConfig(): LLMConfig {
  return loadLLMConfig();
}

// Сброс к дефолтной конфигурации
export function resetLLMConfig(): LLMConfig {
  const defaultConfig = DEFAULT_CONFIG;
  saveLLMConfig(defaultConfig);
  return defaultConfig;
}

// Валидация конфигурации
export function validateLLMConfig(config: Partial<LLMConfig>): { valid: boolean; error?: string } {
  if (!config.provider || (config.provider !== "openai" && config.provider !== "google_gemini")) {
    return { valid: false, error: "Invalid provider. Must be 'openai' or 'google_gemini'" };
  }

  if (!config.modelId || config.modelId.trim().length === 0) {
    return { valid: false, error: "Model ID is required" };
  }

  if (!config.apiKey || config.apiKey.trim().length === 0) {
    return { valid: false, error: "API key is required" };
  }

  return { valid: true };
}

