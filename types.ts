

export type TransactionStatus = 'Approved' | 'Declined' | 'Pending';

export interface Transaction {
  id: string;
  name: string;
  email: string;
  amount: number;
  status: TransactionStatus;
  date: string;
}

// FIX: Added missing type definitions.
export interface Job {
  id: number;
  title: string;
  contract_type: string;
  description: string;
  rate_min?: number;
  rate_max?: number;
  currency: string;
  hired_this_month: number;
  posted_days_ago: number;
}

export interface ApplicationData {
  name: string;
  email: string;
  language: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  kaggleUrl?: string;
  leetcodeUrl?: string;
  tryhackmeUrl?: string;
  codeforcesUrl?: string;
  profileSummary?: string;
  parsedSkills?: string[];
}

export type AppRoute =
  | { name: 'home' }
  | { name: 'explore' }
  | { name: 'job'; id: number }
  | { name: 'apply'; jobId: number }
  | { name: 'prep'; jobId: number; applicationData: ApplicationData }
  | { name: 'interviewLive'; jobId: number; applicationData: ApplicationData }
  | { name: 'interviewResult'; resultIndex: number }
  | { name: 'candidateDashboard' }
  | { name: 'hirerDashboard' }
  | { name: 'profile' }
  | { name: 'earnings' }
  | { name: 'referrals' }
  | { name: 'domainExpert'; jobId: number; applicationData: ApplicationData; onComplete: (expertData: any) => void }
  | { name: 'settings' }
  | { name: 'admin' };

export type SortKey = 'best' | 'trending' | 'newest' | 'pay';

export enum Speaker {
  USER = 'You',
  AI = 'Interviewer',
}

export interface TranscriptEntry {
  speaker: Speaker;
  text: string;
  isFinal: boolean;
}

export interface AntiCheatReport {
  riskScore: number;
  flags: string[];
  reason: string;
  verdict: "clean" | "suspicious" | "cheating" | "unknown";
  heuristicOnly: boolean;
};

export interface InterviewResult {
  job: Job;
  date: string; // or Date
  application: ApplicationData;
  evaluation: {
    scores: {
      comms: number;
      reasoning: number;
      domain: number;
      overall: number;
    };
    detailedFeedback: string;
    summary: string;
    shortSummary?: string;
    strengths: string[];
    areasForImprovement: string[];
  } | null;
  transcript: TranscriptEntry[];
  recordingUrl: string;
  antiCheatReport?: AntiCheatReport;
}

export interface Contract {
  id: number;
  resultIndex: number;
  status: 'Awaiting Funding' | 'Active' | 'Completed';
  hourlyRate: number;
  escrowAmount: number;
  hoursLogged: number;
}

export interface CandidateProfile {
  id: number;
  name: string;
  role: string;
  match: number;
  skills: string[];
  interviewResultId?: number;
}

export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface EducationData {
  school: string;
  degree: string;
  field: string;
  gpa: string;
}

export interface ExperienceData {
  company: string;
  role: string;
  startYear: string;
  endYear: string;
  city: string;
  country: string;
  description: string;
}

export interface OnboardingData {
  country: string;
  city: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  hasNoLinkedIn: boolean;
  portfolio: string;
  otherLinks: string[];
  otherProfiles: { type: string; value: string }[];
  resume: File | null;
  hasNoResume: boolean;
  education: EducationData[];
  experience: ExperienceData[];
}

export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedin: string;
  hasNoLinkedIn: boolean;
  resume: File | null;
  summary: string;
  education: EducationData[];
  experience: ExperienceData[];
  availability: string;
  preferredTimeCommitment: string;
  timezone: string;
  workingHours: {
    day: string;
    available: boolean;
    from: string;
    to: string;
  }[];
  domainInterests: string[];
  otherInterests: string;
  minExpectedCompensationFT: number;
  minExpectedCompensationPT: number;
  commChannels: { email: boolean; sms: boolean };
  opportunityTypes: { fullTime: boolean; partTime: boolean; referral: boolean };
  general: { jobOpportunities: boolean; productUpdates: boolean };
  unsubscribeAll: boolean;
  avatar: File | null;
  generativeProfilePictures: boolean;
}

export interface AdminSettings {
  interviewer: {
    provider: 'gemini'; // The live interview functionality is currently Gemini-only.
    systemPrompt: string;
  };
  evaluation: {
    provider: 'gemini' | 'openai';
    openAI: {
      apiKey: string;
      model: string;
    };
  };
}
