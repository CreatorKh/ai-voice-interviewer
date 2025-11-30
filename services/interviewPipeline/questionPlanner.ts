// Question Planner: Plans the next question based on conversation state

import { GoogleGenerativeAI } from '@google/genai';
import { ConversationState, QuestionPlan } from './types';
import { TEXT_MODEL_ID } from '../../config/models';

export class QuestionPlanner {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async planNextQuestion(
    state: ConversationState,
    jobTitle: string,
    candidateName: string,
    language: string
  ): Promise<QuestionPlan> {
    const model = this.genAI.getGenerativeModel({ model: TEXT_MODEL_ID });

    const topSkills = state.skillProfile.skills
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map(s => `${s.name} (${s.level})`)
      .join(', ');

    const prompt = `You are a question planning engine for technical interviews. Plan the next question based on the conversation state.

Job Title: ${jobTitle}
Candidate: ${candidateName}
Interview Language: ${language}

Current State:
- Questions asked: ${state.questionsAsked} / ${state.totalQuestions}
- Interview phase: ${state.interviewPhase}
- Covered topics: ${state.coveredTopics.join(', ') || 'None yet'}
- Discovered strengths: ${state.discoveredStrengths.join(', ') || 'None yet'}
- Top skills identified: ${topSkills || 'None yet'}
- Current topic: ${state.currentTopic || 'Not set'}

Rules:
1. Don't repeat topics already covered
2. Vary question types (technical, behavioral, situational, follow-up)
3. In opening phase: start with general questions
4. In exploration phase: dive into identified strengths
5. In deep-dive phase: challenge with complex scenarios
6. In closing phase: summarize and final questions
7. Follow up on interesting points from previous answers
8. Adapt based on discovered strengths

Return a JSON object:
{
  "topic": "string (e.g., 'React Hooks', 'System Design', 'Problem Solving')",
  "questionType": "technical | behavioral | situational | follow-up",
  "depth": "surface | medium | deep",
  "goal": "string (what we want to learn from this question)",
  "context": "string (optional: additional context or why this question)"
}

Return ONLY valid JSON, no additional text.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().trim();

      // Extract JSON from response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      const finalJson = jsonMatch ? jsonMatch[0] : jsonText;

      const plan = JSON.parse(finalJson);

      return {
        topic: plan.topic || 'General',
        questionType: plan.questionType || 'technical',
        depth: plan.depth || 'medium',
        goal: plan.goal || 'Explore candidate knowledge',
        context: plan.context
      };
    } catch (error: any) {
      const status = error?.status || error?.cause?.status || error?.response?.status;
      if (status === 429 || status === 503) {
        console.warn('Question planner: model busy or quota exceeded, using fallback plan', error);
        // Fallback plan when quota exceeded
        return {
          topic: 'General',
          questionType: 'technical',
          depth: 'medium',
          goal: 'Explore candidate knowledge'
        };
      }
      console.error('Question planner error:', error);
      // Fallback plan
      return {
        topic: 'General',
        questionType: 'technical',
        depth: 'medium',
        goal: 'Explore candidate knowledge'
      };
    }
  }
}

