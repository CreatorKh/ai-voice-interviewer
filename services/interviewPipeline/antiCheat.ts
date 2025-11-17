// antiCheat.ts
import { PIPELINE_CONFIG } from "./pipelineConfig";
import { safeGenerateJSON } from "./llmClient";

export type AntiCheatReport = {
  riskScore: number;
  flags: string[];
  reason: string;
  verdict: "clean" | "suspicious" | "cheating" | "unknown";
  heuristicOnly: boolean;
};

function heuristicAntiCheat(transcript: string): AntiCheatReport {
  const toks = transcript.toLowerCase();
  const flags: string[] = [];
  let riskScore = 10;

  for (const bad of PIPELINE_CONFIG.thresholds.toxicKeywords) {
    if (toks.includes(bad.toLowerCase())) {
      flags.push(`Toxic language detected: "${bad}"`);
      riskScore += 40;
    }
  }

  if (transcript.split("\n").length < 4) {
    flags.push("Very short / low-effort interview.");
    riskScore += 20;
  }

  if (riskScore > 100) riskScore = 100;

  return {
    riskScore,
    flags,
    reason: flags[0] ?? "No significant issues detected (heuristic).",
    verdict: riskScore > 70 ? "suspicious" : "clean",
    heuristicOnly: true,
  };
}

export async function runAntiCheat(params: {
  transcript: string;
  heuristicScores: {
    avgScore: number;
    turns: number;
  };
}): Promise<AntiCheatReport> {
  const { transcript, heuristicScores } = params;

  if (!PIPELINE_CONFIG.antiCheat.enabled) {
    return {
      riskScore: 0,
      flags: [],
      reason: "Anti-cheat disabled.",
      verdict: "unknown",
      heuristicOnly: true,
    };
  }

  const llmResult = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.antiCheat,
    systemPrompt: PIPELINE_CONFIG.prompts.antiCheat,
    userPrompt: `
TRANSCRIPT:
${transcript}

HEURISTIC SCORES:
${JSON.stringify(heuristicScores)}
`,
  });

  // Жесткая проверка: если LLM не сработал, используем эвристику
  if (!llmResult.ok || !llmResult.fromLLM || !llmResult.data) {
    return heuristicAntiCheat(transcript);
  }

  const json = llmResult.data;

  return {
    riskScore: json.riskScore ?? 0,
    flags: json.flags ?? [],
    reason: json.reason ?? "",
    verdict: json.verdict ?? "unknown",
    heuristicOnly: false,
  };
}
