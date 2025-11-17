export enum Speaker {
  USER = 'You',
  AI = 'Interviewer',
}

export interface TranscriptEntry {
  speaker: Speaker;
  text: string;
  isFinal: boolean;
}

export interface Evaluation {
  shortSummary: string;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
  scores: {
    comms: number;
    reasoning: number;
    domain: number;
    overall: number;
  };
}

export interface Job {
  id: number;
  title: string;
  rate_min?: number;
  rate_max?: number;
  currency: string;
  contract_type: string;
  posted_days_ago: number;
  hired_this_month: number;
  description: string;
};

export interface ApplicationData {
  name: string;
  email: string;
  language: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  parsedSkills?: string[];
  profileSummary?: string;
}

export interface InterviewResult {
  job: Job;
  date: string;
  transcript: TranscriptEntry[];
  recordingUrl: string;
  evaluation: Evaluation | null;
  application: ApplicationData;
}

export interface CandidateProfile {
  id: number;
  name: string;
  role: string;
  match: number;
  skills: string[];
  interviewResultId: number;
}

export type ContractStatus = 'Awaiting Funding' | 'Active' | 'Completed';

export interface Contract {
  id: number; // Use result index as a unique ID for the contract
  resultIndex: number;
  hourlyRate: number;
  hoursLogged: number;
  escrowAmount: number;
  status: ContractStatus;
}

export interface User {
  name: string;
  email: string;
  picture: string;
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
  education: { school: string; degree: string; field: string; gpa: string }[];
  experience: { company: string; role: string; startYear: string; endYear: string; city: string; country: string; description: string }[];
}


export interface ProfileData {
  // Resume Tab
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedin: string;
  hasNoLinkedIn: boolean;
  resume: File | null;
  summary: string;
  education: { school: string; degree: string; field: string; gpa: string }[];
  experience: { company: string; role: string; startYear: string; endYear: string; city: string; country: string; description: string }[];
  // Availability Tab
  availability: string;
  preferredTimeCommitment: string;
  timezone: string;
  workingHours: { day: string; available: boolean; from: string; to: string }[];
  // Work Preferences Tab
  domainInterests: string[];
  otherInterests: string;
  minExpectedCompensationFT: number;
  minExpectedCompensationPT: number;
  // Communications Tab
  commChannels: { email: boolean; sms: boolean };
  opportunityTypes: { fullTime: boolean; partTime: boolean; referral: boolean };
  general: { jobOpportunities: boolean; productUpdates: boolean };
  unsubscribeAll: boolean;
  // Account Tab
  avatar: File | null;
  generativeProfilePictures: boolean;
}


export type AppRoute =
  | { name: "explore" }
  | { name: "home" }
  | { name: "referrals" }
  | { name: "earnings" }
  | { name: "job"; id: number }
  | { name: "apply"; jobId: number }
  | { name: "prep"; jobId: number; applicationData: ApplicationData }
  | { name: "interviewLive"; jobId: number; applicationData: ApplicationData }
  | { 
      name: "domainExpert"; 
      jobId: number; 
      applicationData: ApplicationData; 
      transcript: TranscriptEntry[]; 
      recordingUrl: string;
      pipelineState?: any; // PipelineState from interview
    }
  | { name: "interviewResult"; resultIndex: number }
  | { name: "candidateDashboard" }
  | { name: "hirerDashboard" }
  | { name: "profile" };

export type SortKey = "best" | "trending" | "newest" | "pay";