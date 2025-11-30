// Refine Pass: Refines question style and tone (more powerful model)

import { GoogleGenAI } from '@google/genai';
import { DraftQuestion, RefinedQuestion, ConversationState } from './types';
import { TEXT_MODEL_ID } from '../../config/models';

export class RefinePass {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async refineQuestion(
    draft: DraftQuestion,
    state: ConversationState,
    jobTitle: string,
    candidateName: string,
    language: string
  ): Promise<RefinedQuestion> {
    // Use more powerful model for refinement


    const prompt = `You are refining an interview question. Take the draft and improve it.

Job Title: ${jobTitle}
Candidate: ${candidateName}
Language: ${language}
Interview Phase: ${state.interviewPhase}

Draft Question:
${draft.structure.opening ? `Opening: ${draft.structure.opening}\n` : ''}Main: ${draft.structure.mainQuestion}
${draft.structure.followUpHints?.length ? `Follow-up hints: ${draft.structure.followUpHints.join(', ')}` : ''}

Refine this question to:
1. Remove any filler or unnecessary words
2. Make it more natural and conversational
3. Ensure it's appropriate for ${language} language
4. Match the interview phase (${state.interviewPhase})
5. Maintain professional but friendly tone
6. Keep it concise but clear

Return JSON:
{
  "question": "string (refined, polished question ready to ask)",
  "tone": "professional | friendly | challenging | supportive",
  "style": "concise | detailed | conversational",
  "metadata": {
    "topic": "${draft.metadata.topic}",
    "type": "${draft.metadata.type}",
    "estimatedDuration": ${draft.metadata.estimatedDuration}
  }
}

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

      const refined = JSON.parse(finalJson);

      return {
        question: refined.question || draft.structure.mainQuestion,
        tone: refined.tone || 'professional',
        style: refined.style || 'conversational',
        metadata: {
          topic: refined.metadata?.topic || draft.metadata.topic,
          type: refined.metadata?.type || draft.metadata.type,
          estimatedDuration: refined.metadata?.estimatedDuration || draft.metadata.estimatedDuration
        }
      };
    } catch (error: any) {
      const status = error?.status || error?.cause?.status || error?.response?.status;
      if (status === 429 || status === 503) {
        console.warn('Refine pass: model busy or quota exceeded, using draft question', error);
        // Fallback to draft when quota exceeded
        return {
          question: draft.structure.mainQuestion,
          tone: 'professional',
          style: 'conversational',
          metadata: draft.metadata
        };
      }
      console.error('Refine pass error:', error);
      // Fallback to draft
      return {
        question: draft.structure.mainQuestion,
        tone: 'professional',
        style: 'conversational',
        metadata: draft.metadata
      };
    }
  }
}

