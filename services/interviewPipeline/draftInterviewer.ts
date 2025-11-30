// Draft Interviewer: Generates initial draft question (fast/cheap model)

import { GoogleGenerativeAI } from '@google/genai';
import { QuestionPlan, DraftQuestion, ConversationState } from './types';
import { TEXT_MODEL_ID } from '../../config/models';

export class DraftInterviewer {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateDraftQuestion(
    plan: QuestionPlan,
    state: ConversationState,
    jobTitle: string,
    candidateName: string,
    language: string,
    systemPrompt: string
  ): Promise<DraftQuestion> {
    // Use faster/cheaper model for draft
    const model = this.genAI.getGenerativeModel({ model: TEXT_MODEL_ID });

    const context = state.currentTopic 
      ? `We're currently exploring: ${state.currentTopic}`
      : 'Starting a new topic';

    const prompt = `You are drafting an interview question. Generate a draft question based on the plan.

${systemPrompt}

Job Title: ${jobTitle}
Candidate: ${candidateName}
Language: ${language}
Interview Phase: ${state.interviewPhase}

Question Plan:
- Topic: ${plan.topic}
- Type: ${plan.questionType}
- Depth: ${plan.depth}
- Goal: ${plan.goal}
${plan.context ? `- Context: ${plan.context}` : ''}

${context}

Generate a draft interview question. Return JSON:
{
  "question": "string (the main question)",
  "structure": {
    "opening": "string (optional opening phrase)",
    "mainQuestion": "string (the core question)",
    "followUpHints": ["hint 1", "hint 2"] (optional hints for follow-up)
  },
  "metadata": {
    "topic": "${plan.topic}",
    "type": "${plan.questionType}",
    "estimatedDuration": 60-180 (seconds)
  }
}

The question should be:
- Natural and conversational
- Appropriate for ${language} language
- Match the ${plan.depth} depth level
- Help achieve the goal: ${plan.goal}

Return ONLY valid JSON, no additional text.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().trim();

      // Extract JSON from response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      const finalJson = jsonMatch ? jsonMatch[0] : jsonText;

      const draft = JSON.parse(finalJson);

      return {
        question: draft.structure?.mainQuestion || draft.question || '',
        structure: {
          opening: draft.structure?.opening,
          mainQuestion: draft.structure?.mainQuestion || draft.question,
          followUpHints: draft.structure?.followUpHints || []
        },
        metadata: {
          topic: draft.metadata?.topic || plan.topic,
          type: draft.metadata?.type || plan.questionType,
          estimatedDuration: draft.metadata?.estimatedDuration || 120
        }
      };
    } catch (error: any) {
      const status = error?.status || error?.cause?.status || error?.response?.status;
      if (status === 429 || status === 503) {
        console.warn('Draft interviewer: model busy or quota exceeded, using fallback', error);
        // Fallback when quota exceeded
        return {
          question: `Can you tell me about your experience with ${plan.topic}?`,
          structure: {
            mainQuestion: `Can you tell me about your experience with ${plan.topic}?`
          },
          metadata: {
            topic: plan.topic,
            type: plan.questionType,
            estimatedDuration: 120
          }
        };
      }
      console.error('Draft interviewer error:', error);
      // Fallback
      return {
        question: `Can you tell me about your experience with ${plan.topic}?`,
        structure: {
          mainQuestion: `Can you tell me about your experience with ${plan.topic}?`
        },
        metadata: {
          topic: plan.topic,
          type: plan.questionType,
          estimatedDuration: 120
        }
      };
    }
  }
}

