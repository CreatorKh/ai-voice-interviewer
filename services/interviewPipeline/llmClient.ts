// llmClient.ts
import { GoogleGenerativeAI } from "@google/genai";
import { PIPELINE_CONFIG } from "./pipelineConfig";
import { getLLMConfig } from "../../config/llmConfig";

// Динамический импорт OpenAI для уменьшения размера бандла
let OpenAI: any = null;
async function getOpenAI() {
  if (!OpenAI) {
    const openaiModule = await import("openai");
    OpenAI = openaiModule.OpenAI;
  }
  return OpenAI;
}

let callsUsed = 0;
let lastCallTs = 0;
let hasLLMDegraded = false; // Глобальный флаг деградации

export function resetLLMUsage() {
  callsUsed = 0;
  lastCallTs = 0;
  hasLLMDegraded = false;
}

export function getLLMUsage() {
  return { callsUsed, limit: PIPELINE_CONFIG.limits.maxLLMCallsPerInterview, hasDegraded: hasLLMDegraded };
}

export type LLMResult<T = any> = {
  ok: boolean;
  fromLLM: boolean;
  data: T | null;
  fallbackReason?: 'quota_reached' | 'too_frequent' | 'timeout' | 'service_error' | 'parse_error' | 'unknown_error';
  error?: string;
};

const LLM_TIMEOUT_MS = 2500; // 2.5 секунды таймаут

export async function safeGenerateJSON(opts: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<LLMResult> {
  const now = Date.now();
  const {
    maxLLMCallsPerInterview,
    minSecondsBetweenLLMCalls,
  } = PIPELINE_CONFIG.limits;

  // Проверка квоты
  if (callsUsed >= maxLLMCallsPerInterview) {
    console.warn("[LLM] quota reached, fallback to heuristics");
    hasLLMDegraded = true;
    return {
      ok: false,
      fromLLM: false,
      data: null,
      fallbackReason: 'quota_reached',
    };
  }

  // Проверка частоты
  if (lastCallTs && now - lastCallTs < minSecondsBetweenLLMCalls * 1000) {
    console.warn("[LLM] too frequent, skipping this call");
    return {
      ok: false,
      fromLLM: false,
      data: null,
      fallbackReason: 'too_frequent',
    };
  }

  // Таймаут через AbortController (если API поддерживает)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, LLM_TIMEOUT_MS);

  try {
    const config = getLLMConfig();
    const startTime = Date.now();
    let text: string;

    // Выбор провайдера
    if (config.provider === "openai") {
      const OpenAIClass = await getOpenAI();
      // ВАЖНО: dangerouslyAllowBrowser разрешает использование API ключа в браузере
      // В продакшене лучше использовать прокси-сервер для безопасности
      const openai = new OpenAIClass({ 
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true // Разрешаем использование в браузере (для разработки)
      });
      
      const response = await Promise.race([
        openai.chat.completions.create({
          model: opts.model || config.modelId,
          messages: [
            { role: "system", content: opts.systemPrompt },
            { role: "user", content: "\n\nNow answer strictly in JSON format only, no extra text.\n" + opts.userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('LLM_TIMEOUT')), LLM_TIMEOUT_MS);
        }),
      ]);

      clearTimeout(timeoutId);
      text = response.choices[0]?.message?.content || "";
      
    } else if (config.provider === "google_gemini") {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: opts.model || config.modelId });
      
      const response = await Promise.race([
        model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { text: opts.systemPrompt },
                {
                  text:
                    "\n\nNow answer strictly in JSON format only, no extra text.\n" +
                    opts.userPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('LLM_TIMEOUT')), LLM_TIMEOUT_MS);
        }),
      ]);

      clearTimeout(timeoutId);
      text = response.response.text();
    } else {
      throw new Error(`Unknown provider: ${config.provider}`);
    }

    const elapsed = Date.now() - startTime;
    
    if (elapsed > LLM_TIMEOUT_MS - 100) {
      console.warn(`[LLM] slow response (${elapsed}ms), but got result`);
    }

    callsUsed += 1;
    lastCallTs = now;

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const finalJson = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(finalJson);
      
      return {
        ok: true,
        fromLLM: true,
        data: parsed,
      };
    } catch (e) {
      console.error("Failed to parse JSON from LLM:", e, text);
      hasLLMDegraded = true;
      return {
        ok: false,
        fromLLM: false,
        data: null,
        fallbackReason: 'parse_error',
        error: e instanceof Error ? e.message : String(e),
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    
    // Проверка на таймаут
    if (err?.message === 'LLM_TIMEOUT' || err?.name === 'AbortError') {
      console.warn("[LLM] timeout, using fallback");
      hasLLMDegraded = true;
      return {
        ok: false,
        fromLLM: false,
        data: null,
        fallbackReason: 'timeout',
        error: 'Request timeout',
      };
    }

    const status = err?.status || err?.cause?.status || err?.response?.status;
    if (status === 429 || status === 503) {
      console.warn("[LLM] quota/service error, using fallback:", err?.message || err);
      hasLLMDegraded = true;
      return {
        ok: false,
        fromLLM: false,
        data: null,
        fallbackReason: status === 429 ? 'quota_reached' : 'service_error',
        error: err?.message || String(err),
      };
    }
    
    console.error("[LLM] call failed, using fallback:", err?.message || err);
    hasLLMDegraded = true;
    return {
      ok: false,
      fromLLM: false,
      data: null,
      fallbackReason: 'unknown_error',
      error: err?.message || String(err),
    };
  }
}

