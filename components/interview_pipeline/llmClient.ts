
import { GoogleGenAI } from "@google/genai";
import { PIPELINE_CONFIG } from "./pipelineConfig";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

let callsUsed = 0;
let lastCallTs = 0;

export function resetLLMUsage() {
  callsUsed = 0;
  lastCallTs = 0;
}

export function getLLMUsage() {
  return { callsUsed, limit: PIPELINE_CONFIG.limits.maxLLMCallsPerInterview };
}

async function safeGenerate(opts: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  isJson: boolean;
}): Promise<string | null> {
  const now = Date.now();
  const {
    maxLLMCallsPerInterview,
    minSecondsBetweenLLMCalls,
  } = PIPELINE_CONFIG.limits;

  if (callsUsed >= maxLLMCallsPerInterview) {
    console.warn("[LLM] quota reached, fallback to heuristics");
    return null;
  }

  if (lastCallTs && now - lastCallTs < minSecondsBetweenLLMCalls * 1000) {
    // Optional: throttler. Disabled for speed.
  }

  try {
    const response = await ai.models.generateContent({
      model: opts.model,
      contents: [{ role: "user", parts: [{ text: opts.userPrompt }] }],
      config: {
        systemInstruction: opts.systemPrompt,
        ...(opts.isJson && { responseMimeType: "application/json" }),
      }
    });

    return response.text ? response.text.trim() : null;
  } catch (err: any) {
    console.error("[LLM] call failed, using fallback:", err?.message || err);
    return null;
  }
}

export async function safeGenerateJSON(opts: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<any | null> {
  const text = await safeGenerate({ ...opts, isJson: true });
  if (!text) return null;
  try {
    // Robust JSON extraction:
    // 1. Attempt straight parse
    try {
      return JSON.parse(text);
    } catch (e) {
      // 2. If that fails, strip markdown code blocks and try finding the { ... } block
      let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const firstOpen = cleanText.indexOf('{');
      const lastClose = cleanText.lastIndexOf('}');

      if (firstOpen !== -1 && lastClose !== -1) {
        cleanText = cleanText.substring(firstOpen, lastClose + 1);
        return JSON.parse(cleanText);
      }
      throw new Error("No JSON object found");
    }
  } catch (e) {
    console.error("Failed to parse JSON from LLM:", e, text);
    return null;
  }
}

export async function safeGenerateText(opts: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string | null> {
  return await safeGenerate({ ...opts, isJson: false });
}
