// services/interviewEvaluation.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TEXT_MODEL_ID } from '../config/models';
import { TranscriptEntry, Speaker, ApplicationData } from '../types';
import { PipelineState } from './interviewPipeline/types';

function buildTranscriptText(transcript: TranscriptEntry[]): string {
  return transcript
    .map((t) => {
      const role = t.speaker === Speaker.USER ? 'Candidate' : 'AI';
      return `${role}: ${t.text}`;
    })
    .join('\n');
}

function buildLocalFallbackSummary(
  transcript: TranscriptEntry[],
  pipelineState: PipelineState,
): string {
  const totalTurns = pipelineState.turns.length;
  const avgScore =
    pipelineState.turns.length > 0
      ? Math.round(
          pipelineState.turns.reduce((acc, t) => acc + (t.score || 50), 0) /
            pipelineState.turns.length,
        )
      : 50;

  const strengths = pipelineState.discoveredStrengths.join(', ') || 'Not clearly identified.';
  const weaknesses = pipelineState.discoveredWeaknesses.join(', ') || 'Not clearly identified.';

  return JSON.stringify({
    verdict: avgScore >= 70 ? 'Hire' : avgScore >= 50 ? 'Borderline' : 'No hire',
    verdict_reasoning: [
      `Average answer quality: ${avgScore}/100`,
      `Total questions answered: ${totalTurns}`,
    ],
    overall_score: avgScore,
    strengths: pipelineState.discoveredStrengths.length > 0 
      ? pipelineState.discoveredStrengths 
      : ['No clear strengths identified from heuristic analysis'],
    weaknesses: pipelineState.discoveredWeaknesses.length > 0
      ? pipelineState.discoveredWeaknesses
      : ['No clear weaknesses identified from heuristic analysis'],
    skill_scores: pipelineState.skillProfile.map(skill => ({
      name: skill.name,
      score: skill.level,
      evidence: skill.evidence.slice(-3) // Last 3 pieces of evidence
    })),
    anti_cheat: {
      suspicion_level: pipelineState.antiCheatSignals.some(s => s.severity === 'high') 
        ? 'high' 
        : pipelineState.antiCheatSignals.some(s => s.severity === 'medium')
        ? 'medium'
        : 'low',
      signals: pipelineState.antiCheatSignals.map(s => `${s.code}: ${s.message}`),
      summary: pipelineState.antiCheatSignals.length > 0
        ? `${pipelineState.antiCheatSignals.length} suspicious patterns detected during interview`
        : 'No obvious anomalies detected'
    },
    role_fit: {
      best_fit_roles: ['To be determined from full evaluation'],
      notes: 'This is a fallback summary. Full evaluation requires API access.'
    },
    next_steps: {
      recommended_rounds: ['Technical interview', 'Cultural fit interview'],
      focus_points: ['Deep dive into identified strengths', 'Address identified weaknesses']
    }
  }, null, 2);
}

export async function generateEvaluation(
  transcript: TranscriptEntry[],
  pipelineState: PipelineState,
  applicationData: ApplicationData,
): Promise<string> {
  const apiKey = process.env.API_KEY as string;
  if (!apiKey) {
    console.warn('[Evaluation] No API key, using fallback');
    return buildLocalFallbackSummary(transcript, pipelineState);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: TEXT_MODEL_ID });

  const transcriptText = buildTranscriptText(transcript);

  const resumeText = applicationData.profileSummary || '';

  const socialSummary = applicationData.parsedSkills 
    ? `Skills: ${applicationData.parsedSkills.join(', ')}`
    : 'No social profile data available';

  const systemPrompt = `You are a senior technical recruiter and hiring committee assistant.

You receive:
- Full interview transcript (AI interviewer and candidate).
- Structured pipeline metrics (per-question metrics, skill profile, anti-cheat signals).
- Candidate's application data (resume, skills, social profiles).

Your tasks:
1. Provide a clear overall verdict: "Strong hire", "Hire", "Borderline", or "No hire".
2. Justify this verdict in 3–5 concise bullet points.
3. Describe candidate's main technical strengths and weaknesses with specific evidence from the interview and resume.
4. Provide per-skill scores from 0 to 100 for each skill in the provided skill profile.
5. Analyze behaviour and answers for potential AI assistance (cheating). Use both:
   - Heuristic anti-cheat signals from the pipeline (timings / suspicious patterns).
   - Content style in the transcript (overly polished language, unnatural structure, etc.).
6. Provide recommendations for:
   - Next interview round (what to focus on).
   - Possible roles / projects where this candidate would fit best.
7. Return the result in a **strict JSON** format with the following shape:

{
  "verdict": "Strong hire | Hire | Borderline | No hire",
  "verdict_reasoning": ["...", "..."],
  "overall_score": 0-100,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "skill_scores": [
    { "name": "SkillName", "score": 0-100, "evidence": "..." }
  ],
  "anti_cheat": {
    "suspicion_level": "low | medium | high",
    "signals": ["...", "..."],
    "summary": "..."
  },
  "role_fit": {
    "best_fit_roles": ["...", "..."],
    "notes": "..."
  },
  "next_steps": {
    "recommended_rounds": ["...", "..."],
    "focus_points": ["...", "..."]
  }
}

If some information is missing (e.g. no resume), still fill the JSON but be explicit about uncertainty.
Do NOT add any extra keys or text outside this JSON.
Return ONLY valid JSON, no additional text.`;

  const userPrompt = `CANDIDATE:
Name: ${applicationData.name}
Applied role: ${applicationData.language || 'Unknown'}
Language: ${applicationData.language}

RESUME / CV (raw text, may be partial):
${resumeText || '[no resume text available]'}

PARSED SKILLS (from application):
${JSON.stringify(applicationData.parsedSkills || [], null, 2)}

SOCIAL PROFILES / PORTFOLIO (parsed summary or raw data):
${socialSummary}

PIPELINE STATE (metrics, skills, anti-cheat) – JSON:
${JSON.stringify(pipelineState, null, 2)}

FULL INTERVIEW TRANSCRIPT:
${transcriptText}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text().trim();

    if (!text) {
      console.warn('[Evaluation] Empty response from model, using fallback.');
      return buildLocalFallbackSummary(transcript, pipelineState);
    }

    // Try to extract JSON if there's extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const finalJson = jsonMatch ? jsonMatch[0] : text;

    // Validate it's valid JSON
    JSON.parse(finalJson);
    return finalJson;
  } catch (err: any) {
    const status = err?.status || err?.cause?.status || err?.response?.status;
    if (status === 429 || status === 503) {
      console.warn('[Evaluation] API quota exceeded or service unavailable, using fallback', err);
    } else {
      console.error('[Evaluation] Error generating evaluation:', err);
    }
    return buildLocalFallbackSummary(transcript, pipelineState);
  }
}

