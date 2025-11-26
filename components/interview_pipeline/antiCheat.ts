
import { PIPELINE_CONFIG } from "./pipelineConfig";
import { safeGenerateJSON } from "./llmClient";
import { AntiCheatReport } from '../../types';

function heuristicAntiCheat(transcript: string): AntiCheatReport {
  const toks = transcript.toLowerCase();
  const flags: string[] = [];
  let riskScore = 10;

  for (const bad of PIPELINE_CONFIG.thresholds.toxicKeywords) {
    if (toks.includes(bad)) {
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

  const json = await safeGenerateJSON({
    model: PIPELINE_CONFIG.models.antiCheat,
    systemPrompt: PIPELINE_CONFIG.prompts.antiCheat,
    userPrompt: `
TRANSCRIPT:
${transcript}

HEURISTIC SCORES:
${JSON.stringify(heuristicScores)}
`,
  });

  if (!json) {
    return heuristicAntiCheat(transcript);
  }

  return {
    riskScore: json.riskScore ?? 0,
    flags: json.flags ?? [],
    reason: json.reason ?? "",
    verdict: json.verdict ?? "unknown",
    heuristicOnly: false,
  };
}
