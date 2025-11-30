// Skill Engine: Analyzes candidate responses to identify strengths

import { GoogleGenAI } from '@google/genai';
import { ConversationState, SkillProfile, SkillUpdate } from './types';
import { TEXT_MODEL_ID } from '../../config/models';

export class SkillEngine {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async analyzeResponse(
    answer: string,
    question: string,
    currentSkillProfile: SkillProfile,
    conversationContext: string[]
  ): Promise<SkillUpdate[]> {


    const contextText = conversationContext.length > 0
      ? `Previous conversation context:\n${conversationContext.slice(-5).join('\n')}\n`
      : '';

    const currentSkillsText = currentSkillProfile.skills.length > 0
      ? `Current known skills:\n${currentSkillProfile.skills.map(s => `- ${s.name} (${s.level}, confidence: ${s.confidence.toFixed(2)})`).join('\n')}\n`
      : 'No skills identified yet.\n';

    const prompt = `You are a skill analysis engine for technical interviews. Analyze the candidate's answer to identify technical skills, expertise levels, and evidence.

${contextText}

${currentSkillsText}

Question asked: "${question}"

Candidate's answer: "${answer}"

Analyze this answer and return a JSON object with this structure:
{
  "skillUpdates": [
    {
      "skillName": "string (e.g., 'Python', 'React', 'System Design')",
      "newLevel": "beginner | intermediate | advanced | expert (only if significantly different from current)",
      "newEvidence": ["quote or evidence from answer"],
      "confidenceChange": 0.0-1.0 (how much to increase confidence based on this answer)
    }
  ],
  "newSkills": [
    {
      "skillName": "string",
      "level": "beginner | intermediate | advanced | expert",
      "evidence": ["quote from answer"],
      "confidence": 0.0-1.0
    }
  ],
  "strengths": ["identified strength 1", "identified strength 2"]
}

Rules:
- Only identify concrete technical skills mentioned or demonstrated
- Be conservative with level assessments
- Extract specific evidence (quotes) from the answer
- Don't repeat skills already in the profile unless there's significant new evidence
- Focus on what the candidate actually demonstrated, not what they claimed

Return ONLY valid JSON, no additional text.`;

    try {
      const result = await this.genAI.models.generateContent({
        model: TEXT_MODEL_ID,
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      const jsonText = result.text ? result.text.trim() : "";

      // Extract JSON from response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      const finalJson = jsonMatch ? jsonMatch[0] : jsonText;

      const analysis = JSON.parse(finalJson);

      const updates: SkillUpdate[] = [];

      // Process skill updates
      if (analysis.skillUpdates) {
        analysis.skillUpdates.forEach((update: any) => {
          updates.push({
            skillName: update.skillName,
            newLevel: update.newLevel,
            newEvidence: update.newEvidence || [],
            confidenceChange: Math.min(1, Math.max(0, update.confidenceChange || 0.1))
          });
        });
      }

      // Process new skills
      if (analysis.newSkills) {
        analysis.newSkills.forEach((skill: any) => {
          updates.push({
            skillName: skill.skillName,
            newLevel: skill.level,
            newEvidence: skill.evidence || [],
            confidenceChange: skill.confidence || 0.3
          });
        });
      }

      return updates;
    } catch (error: any) {
      const status = error?.status || error?.cause?.status || error?.response?.status;
      if (status === 429 || status === 503) {
        console.warn('Skill engine: model busy or quota exceeded, skipping skill update', error);
        // Return empty array when quota exceeded (skills will be evaluated after interview)
        return [];
      }
      console.error('Skill engine error:', error);
      return [];
    }
  }

  getTopSkills(skillProfile: SkillProfile, limit: number = 5): Skill[] {
    return [...skillProfile.skills]
      .sort((a, b) => {
        // Sort by confidence * level weight
        const levelWeight = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
        const scoreA = a.confidence * levelWeight[a.level];
        const scoreB = b.confidence * levelWeight[b.level];
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }
}

