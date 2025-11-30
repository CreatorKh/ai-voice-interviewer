// Scoring Engine: Evaluates candidate answers

import { GoogleGenerativeAI } from '@google/genai';
import { AnswerEvaluation, SkillUpdate, QuestionPlan } from './types';
import { TEXT_MODEL_ID } from '../../config/models';

export class ScoringEngine {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async evaluateAnswer(
    question: string,
    answer: string,
    questionPlan: QuestionPlan,
    conversationHistory: string[]
  ): Promise<AnswerEvaluation> {
    const model = this.genAI.getGenerativeModel({ model: TEXT_MODEL_ID });

    const historyContext = conversationHistory.length > 0
      ? `Previous conversation:\n${conversationHistory.slice(-3).join('\n')}\n`
      : '';

    const prompt = `You are an answer evaluation engine for technical interviews. Evaluate the candidate's answer.

${historyContext}

Question asked: "${question}"
Question type: ${questionPlan.questionType}
Question depth: ${questionPlan.depth}
Question goal: ${questionPlan.goal}

Candidate's answer: "${answer}"

Evaluate this answer and return JSON:
{
  "score": 0-100 (overall quality score),
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "skillUpdates": [
    {
      "skillName": "string",
      "newLevel": "beginner | intermediate | advanced | expert (only if changed)",
      "newEvidence": ["quote from answer"],
      "confidenceChange": 0.0-1.0
    }
  ],
  "quality": "excellent | good | average | poor",
  "detailedAnalysis": "string (2-3 sentences explaining the evaluation)"
}

Evaluation criteria:
- Technical accuracy
- Depth of understanding
- Clarity of explanation
- Relevance to the question
- Demonstration of expertise

Return ONLY valid JSON, no additional text.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().trim();

      // Extract JSON from response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      const finalJson = jsonMatch ? jsonMatch[0] : jsonText;

      const evaluation = JSON.parse(finalJson);

      return {
        score: Math.min(100, Math.max(0, evaluation.score || 50)),
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        skillUpdates: evaluation.skillUpdates || [],
        quality: evaluation.quality || 'average',
        detailedAnalysis: evaluation.detailedAnalysis || 'Answer evaluated'
      };
    } catch (error: any) {
      const status = error?.status || error?.cause?.status || error?.response?.status;
      if (status === 429 || status === 503) {
        console.warn('Scoring engine: model busy or quota exceeded, using fallback evaluation', error);
        // Fallback when quota exceeded
        return {
          score: 50,
          strengths: [],
          weaknesses: ['Not evaluated due to quota limits'],
          skillUpdates: [],
          quality: 'unknown',
          detailedAnalysis: 'Evaluation skipped due to API quota limits. Will be evaluated after interview.'
        };
      }
      console.error('Scoring engine error:', error);
      // Fallback evaluation
      return {
        score: 50,
        strengths: [],
        weaknesses: [],
        skillUpdates: [],
        quality: 'average',
        detailedAnalysis: 'Evaluation error occurred'
      };
    }
  }
}

