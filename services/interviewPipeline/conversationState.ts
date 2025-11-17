// Conversation state management

import { ConversationState, SkillProfile, Skill, AntiCheatFlags } from './types';

export class ConversationStateManager {
  private state: ConversationState;

  constructor(initialSkills?: string[]) {
    this.state = {
      coveredTopics: [],
      discoveredStrengths: [],
      questionsAsked: 0,
      totalQuestions: 20, // Default 20-minute interview
      interviewPhase: 'opening',
      skillProfile: {
        skills: initialSkills?.map(skill => ({
          name: skill,
          level: 'intermediate',
          evidence: [],
          confidence: 0.3
        })) || [],
        confidence: 0.3,
        lastUpdated: Date.now()
      },
      antiCheatFlags: {
        suspiciousPatterns: [],
        riskScore: 0,
        warnings: []
      }
    };
  }

  getState(): ConversationState {
    return { ...this.state };
  }

  addCoveredTopic(topic: string) {
    if (!this.state.coveredTopics.includes(topic)) {
      this.state.coveredTopics.push(topic);
    }
  }

  addDiscoveredStrength(strength: string) {
    if (!this.state.discoveredStrengths.includes(strength)) {
      this.state.discoveredStrengths.push(strength);
    }
  }

  incrementQuestionsAsked() {
    this.state.questionsAsked++;
    this.updateInterviewPhase();
  }

  private updateInterviewPhase() {
    const progress = this.state.questionsAsked / this.state.totalQuestions;
    if (progress < 0.1) {
      this.state.interviewPhase = 'opening';
    } else if (progress < 0.7) {
      this.state.interviewPhase = 'exploration';
    } else if (progress < 0.9) {
      this.state.interviewPhase = 'deep-dive';
    } else {
      this.state.interviewPhase = 'closing';
    }
  }

  updateSkillProfile(updates: Array<{ skillName: string; level?: Skill['level']; evidence: string[]; confidence: number }>) {
    updates.forEach(update => {
      const existingSkill = this.state.skillProfile.skills.find(s => s.name === update.skillName);
      if (existingSkill) {
        if (update.level) existingSkill.level = update.level;
        existingSkill.evidence.push(...update.evidence);
        existingSkill.confidence = Math.min(1, existingSkill.confidence + update.confidence);
      } else {
        this.state.skillProfile.skills.push({
          name: update.skillName,
          level: update.level || 'intermediate',
          evidence: update.evidence,
          confidence: update.confidence
        });
      }
    });
    this.state.skillProfile.lastUpdated = Date.now();
    this.state.skillProfile.confidence = this.calculateOverallConfidence();
  }

  private calculateOverallConfidence(): number {
    if (this.state.skillProfile.skills.length === 0) return 0;
    const avgConfidence = this.state.skillProfile.skills.reduce((sum, s) => sum + s.confidence, 0) / this.state.skillProfile.skills.length;
    const evidenceCount = this.state.skillProfile.skills.reduce((sum, s) => sum + s.evidence.length, 0);
    // More evidence = higher confidence
    const evidenceBonus = Math.min(0.3, evidenceCount * 0.05);
    return Math.min(1, avgConfidence + evidenceBonus);
  }

  addAntiCheatFlag(pattern: AntiCheatFlags['suspiciousPatterns'][0]) {
    this.state.antiCheatFlags.suspiciousPatterns.push(pattern);
    this.recalculateRiskScore();
  }

  private recalculateRiskScore() {
    const patterns = this.state.antiCheatFlags.suspiciousPatterns;
    let score = 0;
    
    patterns.forEach(pattern => {
      const severityWeight = pattern.severity === 'high' ? 30 : pattern.severity === 'medium' ? 15 : 5;
      score += severityWeight;
    });
    
    // Recent patterns weigh more
    const recentPatterns = patterns.filter(p => Date.now() - p.timestamp < 60000); // Last minute
    score += recentPatterns.length * 10;
    
    this.state.antiCheatFlags.riskScore = Math.min(100, score);
    
    // Generate warnings
    this.state.antiCheatFlags.warnings = [];
    if (this.state.antiCheatFlags.riskScore > 50) {
      this.state.antiCheatFlags.warnings.push('Multiple suspicious patterns detected');
    }
    if (patterns.some(p => p.type === 'copy-paste' && p.severity === 'high')) {
      this.state.antiCheatFlags.warnings.push('Possible copy-paste detected');
    }
  }

  setCurrentTopic(topic: string) {
    this.state.currentTopic = topic;
  }

  getRemainingQuestions(): number {
    return Math.max(0, this.state.totalQuestions - this.state.questionsAsked);
  }

  getProgress(): number {
    return this.state.questionsAsked / this.state.totalQuestions;
  }
}

