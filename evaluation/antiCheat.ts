// Anti-cheat analysis module

import { GoogleGenerativeAI } from '@google/genai';
import { TEXT_MODEL_ID } from '../config/models';
import { TranscriptEntry, Job, ApplicationData, Speaker } from '../types';
import { TurnEvaluation, AntiCheatReport, AntiCheatSignal } from './types';

const client = new GoogleGenerativeAI(process.env.API_KEY as string);

export async function runAntiCheat(
  transcript: TranscriptEntry[],
  turns: TurnEvaluation[],
  job: Job,
  app: ApplicationData,
  recordingUrl?: string,
): Promise<AntiCheatReport> {
  const textOnly = transcript
    .filter(t => t.speaker === Speaker.USER)
    .map(t => t.text)
    .join('\n');

  const prompt = `You are an anti-cheat heuristic analyzer for live interviews.

You must NOT claim 100% certainty. You only estimate RISK LEVEL.

JOB:
${job.title}
${job.description || ''}

CANDIDATE RESUME:
${app.profileSummary || ''}
${app.parsedSkills ? `Skills: ${app.parsedSkills.join(', ')}` : ''}

CANDIDATE ANSWERS (only user text):
${textOnly}

TURN-LEVEL EVALUATION:
${JSON.stringify(turns, null, 2)}

Optionally, there may be a recording URL (interviewer tool can analyze video separately):
${recordingUrl || 'NO_RECORDING_AVAILABLE'}

TASK:
Analyze possible signs that the candidate heavily relied on external AI tools or reading from a script.

Look for:
- very uniform, "perfect" language across all answers;
- generic answers that do not match candidate's own resume specifics;
- inconsistencies between resume and answers;
- meta-comments suggesting using another tool ("I see from the code you wrote...", while candidate didn't write code);
- abnormal level of detail in all topics regardless of claimed experience.

Produce a JSON with this schema:

{
  "overallRisk": "low" | "medium" | "high",
  "signals": [
    {
      "id": "string",
      "severity": "low" | "medium" | "high",
      "description": "human-readable explanation",
      "evidence": "short quote or reference"
    }
  ],
  "commentForRecruiter": "short explanation how to interpret this"
}

Be conservative: if there is no clear evidence, set overallRisk to "low".

Return ONLY valid JSON, no additional text.`;

  try {
    const model = client.getGenerativeModel({ model: TEXT_MODEL_ID });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const finalJson = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(finalJson);

    const signals: AntiCheatSignal[] = (parsed.signals || []).map((s: any) => ({
      id: s.id || 'signal',
      severity: s.severity || 'low',
      description: s.description || '',
      evidence: s.evidence || '',
    }));

    const report: AntiCheatReport = {
      overallRisk: parsed.overallRisk || 'low',
      signals,
      commentForRecruiter: parsed.commentForRecruiter || 'No significant anti-cheat signals detected.',
    };

    return report;
  } catch (error: any) {
    const status = error?.status || error?.cause?.status || error?.response?.status;
    if (status === 429 || status === 503) {
      console.warn('Anti-cheat: model busy or quota exceeded, using fallback', error);
      // Fallback when quota exceeded
      return {
        overallRisk: 'low',
        signals: [],
        commentForRecruiter: 'Anti-cheat analysis skipped due to API quota limits. Manual review recommended.',
      };
    }
    console.error('Anti-cheat analysis error:', error);
    // Fallback: return safe default
    return {
      overallRisk: 'low',
      signals: [],
      commentForRecruiter: 'Anti-cheat analysis unavailable. Manual review recommended.',
    };
  }
}

