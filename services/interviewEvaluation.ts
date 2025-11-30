// services/interviewEvaluation.ts

import { GoogleGenAI } from '@google/genai';
import { getLLMConfig } from '../config/llmConfig';
import { normalizeModelId } from '../config/modelUtils';
import { TranscriptEntry, Speaker, ApplicationData } from '../types';
import { PipelineState } from './interviewPipeline/types';
import { buildCandidateContext, generateEvaluatorContextPrompt } from './interviewPipeline/candidateContext';

// Динамический импорт OpenAI для уменьшения размера бандла
let OpenAI: any = null;
async function getOpenAI() {
  if (!OpenAI) {
    const openaiModule = await import("openai");
    OpenAI = openaiModule.OpenAI;
  }
  return OpenAI;
}

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
      evidence: skill.evidence.slice(-3)
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
  const config = getLLMConfig();
  const apiKey = config.apiKey;
  
  if (!apiKey) {
    console.warn('[Evaluation] No API key, using fallback');
    return buildLocalFallbackSummary(transcript, pipelineState);
  }

  const transcriptText = buildTranscriptText(transcript);
  const resumeText = applicationData.profileSummary || '';
  const socialSummary = applicationData.parsedSkills
    ? `Skills: ${applicationData.parsedSkills.join(', ')}`
    : 'No social profile data available';

  // Собираем контекст кандидата из резюме и профилей
  const candidateProfile = buildCandidateContext(applicationData);
  const candidateContext = generateEvaluatorContextPrompt(candidateProfile, applicationData.language || 'Unknown Role');
  
  // Формируем информацию о профилях
  const profilesInfo: string[] = [];
  if (applicationData.linkedInUrl) profilesInfo.push(`LinkedIn: ${applicationData.linkedInUrl}`);
  if (applicationData.githubUrl) profilesInfo.push(`GitHub: ${applicationData.githubUrl}`);
  if (applicationData.leetcodeUrl) profilesInfo.push(`LeetCode: ${applicationData.leetcodeUrl} (алгоритмы)`);
  if (applicationData.codeforcesUrl) profilesInfo.push(`Codeforces: ${applicationData.codeforcesUrl} (competitive programming)`);
  if (applicationData.tryhackmeUrl) profilesInfo.push(`TryHackMe: ${applicationData.tryhackmeUrl} (кибербезопасность)`);
  if (applicationData.kaggleUrl) profilesInfo.push(`Kaggle: ${applicationData.kaggleUrl} (data science)`);
  
  const profilesSummary = profilesInfo.length > 0 
    ? `\n\nONLINE PROFILES:\n${profilesInfo.join('\n')}`
    : '\n\nNo online profiles provided.';

  const systemPrompt = `You are a senior technical recruiter and hiring committee assistant at a top tech company.

You receive:
- Full interview transcript (AI interviewer and candidate).
- Structured pipeline metrics (per-question metrics, skill profile, anti-cheat signals).
- Candidate's application data (resume, skills, social profiles).
- Online profiles (LinkedIn, GitHub, LeetCode, Codeforces, TryHackMe, Kaggle) if available.

IMPORTANT EVALUATION RULES:
1. Cross-reference interview answers with resume/CV - flag inconsistencies
2. If candidate has LeetCode/Codeforces profile, expect strong algorithmic skills
3. If candidate has TryHackMe profile for security role, expect practical security knowledge
4. If candidate has Kaggle profile for DS role, expect ML/data competition experience
5. If candidate has GitHub, expect ability to discuss code and projects
6. Years of experience from resume should correlate with answer depth

Your tasks:
1. Provide a clear overall verdict: "Strong hire", "Hire", "Borderline", or "No hire".
2. Justify this verdict in 3-5 concise bullet points.
3. Describe candidate's main technical strengths and weaknesses with specific evidence from the interview AND resume/profiles.
4. Provide per-skill scores from 0 to 100 for each skill in the provided skill profile.
5. Analyze behaviour and answers for potential AI assistance (cheating). Use both:
   - Heuristic anti-cheat signals from the pipeline (timings / suspicious patterns).
   - Content style in the transcript (overly polished language, unnatural structure, etc.).
   - IMPORTANT: Compare claimed experience in resume with actual demonstrated knowledge
6. PROFILE CONSISTENCY CHECK:
   - If resume claims 5+ years experience but answers are junior-level → RED FLAG
   - If LeetCode profile exists but can't solve basic algo questions → RED FLAG
   - If GitHub profile shows Python projects but claims Java expertise → INCONSISTENCY
7. Provide recommendations for:
   - Next interview round (what to focus on).
   - Possible roles / projects where this candidate would fit best.
8. Return the result in a **strict JSON** format with the following shape:

{
  "verdict": "Strong hire | Hire | Borderline | No hire",
  "verdict_reasoning": ["...", "..."],
  "overall_score": 0-100,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "skill_scores": [
    { "name": "SkillName", "score": 0-100, "evidence": "..." }
  ],
  "profile_consistency": {
    "resume_match": "high | medium | low",
    "profile_signals": ["LeetCode suggests strong algorithms", "GitHub shows Python expertise"],
    "inconsistencies": ["Claimed 5 years but answers suggest junior level"]
  },
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
Selected Level: ${applicationData.selectedLevel || 'Not specified'}
${candidateProfile.yearsOfExperience ? `Claimed Experience: ${candidateProfile.yearsOfExperience} years` : ''}

=== RESUME / CV ===
${resumeText || '[no resume text available]'}

=== ONLINE PROFILES ===
${profilesSummary}

=== DETECTED STRENGTHS FROM PROFILES ===
${candidateProfile.strengths.length > 0 ? candidateProfile.strengths.map(s => `- ${s}`).join('\n') : 'No additional signals from profiles'}

=== PARSED SKILLS (from application) ===
${JSON.stringify(applicationData.parsedSkills || [], null, 2)}

=== CANDIDATE CONTEXT ===
${candidateContext}

=== PIPELINE STATE (metrics, skills, anti-cheat) ===
${JSON.stringify(pipelineState, null, 2)}

=== FULL INTERVIEW TRANSCRIPT ===
${transcriptText}

=== EVALUATION FOCUS ===
1. Does candidate's performance match their resume/claimed experience?
2. Do answers demonstrate skills suggested by their online profiles?
3. Are there any inconsistencies between claimed and demonstrated knowledge?`;

  try {
    let text: string;
    
    if (config.provider === "openai") {
      const OpenAIClass = await getOpenAI();
      const openai = new OpenAIClass({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true
      });

      console.log('[Evaluation] Using OpenAI GPT-4o for evaluation...');
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Лучшая модель для evaluation
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      text = response.choices[0]?.message?.content || "";
      
    } else if (config.provider === "google_gemini") {
      const genAI = new GoogleGenAI({ apiKey: config.apiKey });
      const normalizedModelId = normalizeModelId(config.modelId, config.provider);
      
      console.log('[Evaluation] Using Gemini for evaluation...');
    const result = await genAI.models.generateContent({
        model: normalizedModelId,
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

      text = result.text ? result.text.trim() : "";
    } else {
      throw new Error(`Unknown provider: ${config.provider}`);
    }

    if (!text) {
      console.warn('[Evaluation] Empty response from model, using fallback.');
      return buildLocalFallbackSummary(transcript, pipelineState);
    }

    // Try to extract JSON if there's extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const finalJson = jsonMatch ? jsonMatch[0] : text;

    // Validate it's valid JSON
    JSON.parse(finalJson);
    console.log('[Evaluation] Successfully generated evaluation with LLM');
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
