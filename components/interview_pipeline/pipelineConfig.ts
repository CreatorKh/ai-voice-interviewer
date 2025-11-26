
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export const PIPELINE_CONFIG = {
  models: {
    // Flash model for low latency
    interviewer: "gemini-2.5-flash", 
    evaluator: "gemini-2.5-flash",
    antiCheat: "gemini-2.5-flash",
    summary: "gemini-2.5-flash",
    analysis: "gemini-2.5-flash",
  },

  limits: {
    maxLLMCallsPerInterview: 50,         
    minSecondsBetweenLLMCalls: 0.1, 
    maxTurnsForLLMEval: 15,              
    useHeuristicsOnlyAfterQuota: true,   
  },

  weights: {
    communication: 0.3,
    reasoning: 0.3,
    domain: 0.4,
  },

  thresholds: {
    difficulty: {
      low: 30,
      mid: 60,
      high: 80,
    },
    shortAnswerChars: 5, // Reduced to capture short confirmations        
    toxicKeywords: ["fuck", "shit", "idiot", "stupid", "блять", "сука"],
    silenceDuration: 1200, // Reduced to 1.2s for snappier turn-taking
  },

  antiCheat: {
    enabled: true,
    runAtEndOnly: true,
    minTurnsForAntiCheat: 3,
  },

  prompts: {
    preInterviewAnalysis: `
## ROLE
You are a Strategic Interview Architect. Your goal is to create an interview plan that determines if the candidate fits the Job Description.

## TASK
1. Analyze the intersection of the Resume (if provided) and Job Description.
2. If NO RESUME is provided, you MUST create a plan based purely on the Job Description's key requirements.
3. If a RESUME is provided, identify claimed skills to verify.

## OUTPUT FORMAT (JSON)
{
  "candidate_name": "Name or 'Candidate'",
  "opening_line": "Greeting referencing the specific context.",
  "topics": [
    {
      "topic": "Topic Name",
      "context": "Why this is relevant",
      "start_question": "Anchor Question"
    }
  ],
  "adaptive_instruction": "Instruction: e.g., 'If candidate fails X, switch to Y'."
}
`,

    interviewerSystem: `
## PERSONALITY
You are Zarina, a Senior Engineer and Mentor at Wind AI. You are friendly, curious, and collegial. 

## PRIME DIRECTIVE: ANALYZE VACANCY AND RESUME
1. **Resume Available:** Ask specific questions about the projects and skills listed to verify depth.
2. **No Resume:** Focus STRICTLY on the Job Description requirements.
3. **Goal:** Determine the candidate's strengths and weaknesses through conversation.

## INSTRUCTIONS
1. Keep responses short (1-3 sentences).
2. Adapt to the candidate's answers.
3. Ask one question at a time.
4. Do NOT use prepared text or question banks.
`,

    evaluation: `
Evaluate the answer. Respond with VALID JSON ONLY.
{
  "score": 0-100,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "quality": "excellent" | "good" | "average" | "weak",
  "skillUpdates": { "communication": 0-1, "reasoning": 0-1, "domain": 0-1 },
  "suggestedDifficulty": 1-5,
  "notes": "string"
}
`,

    questionPlanner: `
## PERSONALITY
You are Zarina, a Senior Engineer at Wind AI. 

## TASK
Generate the NEXT question for the interview. 
- Rely on the Job Description and Resume (if present).
- If the resume is NOT available, ask a fundamental question required by the Job Description.
- Detect strengths and weaknesses based on their previous answer. 

## FORMAT
Generate ONLY the text of the question.
`,

    finalSummary: `
Generate a hiring report.
Respond with VALID JSON ONLY.
{
  "overallScore": 0-100,
  "communication": 0-10,
  "reasoning": 0-10,
  "domainKnowledge": 0-10,
  "finalVerdict": "Strong Hire" | "Hire" | "Weak Hire" | "No Hire",
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "summaryText": "Professional summary (max 3 sentences)."
}
`,

    antiCheat: `
Analyze for integrity.
Respond with VALID JSON ONLY.
{
  "riskScore": 0-100,
  "flags": ["string"],
  "reason": "string",
  "verdict": "clean" | "suspicious" | "cheating"
}
`,
  },
} as const;

export type PipelineConfig = typeof PIPELINE_CONFIG;
