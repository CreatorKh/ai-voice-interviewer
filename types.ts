

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
export type ExperienceLevel = 'junior' | 'middle' | 'senior';

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
  hasLevels?: boolean; // If true, show level selection
  baseTitle?: string; // Base title without level (e.g., "Anti-Fraud Specialist")
  level?: ExperienceLevel; // Current selected level
  specializations?: string[]; // Optional list of specializations (e.g., SOC, DLP)
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
  selectedLevel?: ExperienceLevel; // Selected experience level for interview
  selectedSpecialization?: string; // Selected specialization (e.g., "SOC")
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
  | { name: 'hirerLanding' }
  | { name: 'profile' }
  | { name: 'earnings' }
  | { name: 'referrals' }
  | { name: 'domainExpert'; jobId: number; applicationData: ApplicationData; onComplete: (expertData: any) => void }
  | { name: 'settings' }
  | { name: 'admin' }
  // One Interview Model routes
  | { name: 'universalInterview' }           // Take the ONE interview
  | { name: 'opportunities' }                 // View matched jobs
  | { name: 'talentPool'; jobId?: number }   // Hirer: browse pre-vetted candidates
  | { name: 'candidateProfile'; id: string }; // View candidate's universal profile

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
    finalVerdict?: 'Hire' | 'No Hire' | 'Maybe';
    llmUsed?: boolean;
  } | null;
  transcript: TranscriptEntry[];
  recordingUrl: string;
  recordingBlob?: Blob; // Actual file for persistence
  antiCheatReport?: AntiCheatReport;
  level?: ExperienceLevel; // Level at which interview was conducted
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

// ============ ONE INTERVIEW MODEL ============

// Skill categories for universal assessment
export type SkillCategory = 
  | 'software_engineering'
  | 'data_science'
  | 'cybersecurity'
  | 'sales'
  | 'management'
  | 'communication'
  | 'problem_solving'
  | 'leadership';

// Universal candidate profile after ONE interview
export interface UniversalProfile {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  phone?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  
  // Interview results
  interviewDate: string;
  interviewLanguage: string;
  recordingUrl?: string;
  transcript?: TranscriptEntry[];
  
  // Universal scores (not job-specific)
  scores: {
    communication: number;      // How well they communicate
    problemSolving: number;     // Analytical thinking
    technicalDepth: number;     // Domain expertise
    adaptability: number;       // Learning ability
    professionalism: number;    // Work ethic, attitude
    overall: number;
  };
  
  // Detected skills from interview
  detectedSkills: {
    skill: string;
    confidence: number; // 0-100
    category: SkillCategory;
  }[];
  
  // Experience level assessment
  assessedLevel: ExperienceLevel;
  yearsOfExperience?: number;
  
  // AI-generated summary
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  
  // Anti-cheat
  antiCheatReport?: AntiCheatReport;
  
  // Matching data
  preferredRoles: string[];      // What roles they're interested in
  preferredSalary?: { min: number; max: number; currency: string };
  availability: 'immediately' | 'two_weeks' | 'one_month' | 'flexible';
  workType: ('remote' | 'hybrid' | 'onsite')[];
  
  // Status
  status: 'pending_review' | 'verified' | 'rejected';
  verifiedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Job match for a candidate
export interface JobMatch {
  jobId: number;
  jobTitle: string;
  companyName?: string;
  matchScore: number;        // 0-100 how well candidate matches
  matchReasons: string[];    // Why they match
  missingSkills?: string[];  // What they're missing
  salaryMatch: boolean;
  levelMatch: boolean;
  status: 'new' | 'viewed' | 'applied' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  matchedAt: string;
}

// Candidate's view of their opportunities
export interface CandidateOpportunities {
  profile: UniversalProfile;
  matches: JobMatch[];
  totalMatches: number;
  newMatches: number;
  appliedCount: number;
  interviewingCount: number;
}

// Hirer's view of talent pool
export interface TalentPoolCandidate {
  profile: UniversalProfile;
  matchScore: number;
  matchReasons: string[];
  stage: 'new' | 'reviewed' | 'shortlisted' | 'contacted' | 'interviewing' | 'offered' | 'hired' | 'passed';
  notes?: string;
  lastActivity?: string;
}

// Hirer's talent pool for a job
export interface TalentPool {
  jobId: number;
  jobTitle: string;
  candidates: TalentPoolCandidate[];
  totalCandidates: number;
  newCandidates: number;
  shortlistedCount: number;
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
