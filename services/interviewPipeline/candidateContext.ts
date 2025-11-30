// candidateContext.ts - Сервис для сбора и анализа данных о кандидате

import { ApplicationData, ExperienceLevel } from "../../types";

export interface CandidateProfile {
  // Базовая информация
  name: string;
  email: string;
  
  // Опыт работы (из резюме)
  experienceSummary: string;
  yearsOfExperience: number | null;
  companies: string[];
  roles: string[];
  
  // Навыки (из резюме + профилей)
  skills: string[];
  technologies: string[];
  
  // Профили платформ
  profiles: {
    linkedin?: LinkedInProfile;
    github?: GitHubProfile;
    leetcode?: LeetCodeProfile;
    codeforces?: CodeforcesProfile;
    tryhackme?: TryHackMeProfile;
    kaggle?: KaggleProfile;
  };
  
  // Общий уровень
  assessedLevel: ExperienceLevel;
  
  // Сильные стороны из профилей
  strengths: string[];
  
  // Флаги для интервьюера
  interviewerHints: string[];
}

export interface LinkedInProfile {
  url: string;
  headline?: string;
  currentPosition?: string;
  company?: string;
  connections?: string;
  experienceYears?: number;
}

export interface GitHubProfile {
  url: string;
  username?: string;
  repos?: number;
  stars?: number;
  contributions?: number;
  topLanguages?: string[];
  hasOpenSource?: boolean;
}

export interface LeetCodeProfile {
  url: string;
  username?: string;
  problemsSolved?: number;
  ranking?: number;
  contestRating?: number;
  easyCount?: number;
  mediumCount?: number;
  hardCount?: number;
  badges?: string[];
}

export interface CodeforcesProfile {
  url: string;
  handle?: string;
  rating?: number;
  maxRating?: number;
  rank?: string; // newbie, pupil, specialist, expert, etc.
  contestsParticipated?: number;
  problemsSolved?: number;
}

export interface TryHackMeProfile {
  url: string;
  username?: string;
  rank?: string;
  points?: number;
  roomsCompleted?: number;
  badges?: string[];
  streak?: number;
}

export interface KaggleProfile {
  url: string;
  username?: string;
  rank?: string;
  medals?: { gold: number; silver: number; bronze: number };
  competitions?: number;
  datasets?: number;
  notebooks?: number;
}

// ============ ПАРСИНГ ПРОФИЛЕЙ ============

export function extractUsernameFromUrl(url: string, platform: string): string | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    switch (platform) {
      case 'linkedin':
        // https://linkedin.com/in/username
        const linkedinMatch = path.match(/\/in\/([^\/]+)/);
        return linkedinMatch ? linkedinMatch[1] : null;
        
      case 'github':
        // https://github.com/username
        const githubMatch = path.match(/^\/([^\/]+)\/?$/);
        return githubMatch ? githubMatch[1] : null;
        
      case 'leetcode':
        // https://leetcode.com/username or https://leetcode.com/u/username
        const leetcodeMatch = path.match(/^\/(?:u\/)?([^\/]+)\/?$/);
        return leetcodeMatch ? leetcodeMatch[1] : null;
        
      case 'codeforces':
        // https://codeforces.com/profile/username
        const codeforcesMatch = path.match(/\/profile\/([^\/]+)/);
        return codeforcesMatch ? codeforcesMatch[1] : null;
        
      case 'tryhackme':
        // https://tryhackme.com/p/username
        const tryhackmeMatch = path.match(/\/p\/([^\/]+)/);
        return tryhackmeMatch ? tryhackmeMatch[1] : null;
        
      case 'kaggle':
        // https://kaggle.com/username
        const kaggleMatch = path.match(/^\/([^\/]+)\/?$/);
        return kaggleMatch ? kaggleMatch[1] : null;
        
      default:
        return null;
    }
  } catch {
    return null;
  }
}

// ============ ПОСТРОЕНИЕ КОНТЕКСТА ============

export function buildCandidateContext(application: ApplicationData): CandidateProfile {
  const profile: CandidateProfile = {
    name: application.name,
    email: application.email,
    experienceSummary: application.profileSummary || "",
    yearsOfExperience: null,
    companies: [],
    roles: [],
    skills: application.parsedSkills || [],
    technologies: [],
    profiles: {},
    assessedLevel: application.selectedLevel || "middle",
    strengths: [],
    interviewerHints: [],
  };
  
  // Парсим LinkedIn
  if (application.linkedInUrl) {
    const username = extractUsernameFromUrl(application.linkedInUrl, 'linkedin');
    profile.profiles.linkedin = {
      url: application.linkedInUrl,
      headline: username ? `LinkedIn: ${username}` : undefined,
    };
    profile.interviewerHints.push("Кандидат имеет LinkedIn профиль - можно спросить про опыт работы из профиля");
  }
  
  // Парсим GitHub
  if (application.githubUrl) {
    const username = extractUsernameFromUrl(application.githubUrl, 'github');
    profile.profiles.github = {
      url: application.githubUrl,
      username,
    };
    profile.interviewerHints.push("Кандидат имеет GitHub - можно спросить про open source проекты и код");
    profile.strengths.push("Активный GitHub профиль");
  }
  
  // Парсим LeetCode
  if (application.leetcodeUrl) {
    const username = extractUsernameFromUrl(application.leetcodeUrl, 'leetcode');
    profile.profiles.leetcode = {
      url: application.leetcodeUrl,
      username,
    };
    profile.interviewerHints.push("Кандидат практикует алгоритмы на LeetCode - можно задать алгоритмическую задачу");
    profile.strengths.push("Практикует алгоритмы на LeetCode");
  }
  
  // Парсим Codeforces
  if (application.codeforcesUrl) {
    const handle = extractUsernameFromUrl(application.codeforcesUrl, 'codeforces');
    profile.profiles.codeforces = {
      url: application.codeforcesUrl,
      handle,
    };
    profile.interviewerHints.push("Кандидат участвует в соревнованиях Codeforces - сильные алгоритмические навыки");
    profile.strengths.push("Участник Codeforces (competitive programming)");
  }
  
  // Парсим TryHackMe
  if (application.tryhackmeUrl) {
    const username = extractUsernameFromUrl(application.tryhackmeUrl, 'tryhackme');
    profile.profiles.tryhackme = {
      url: application.tryhackmeUrl,
      username,
    };
    profile.interviewerHints.push("Кандидат практикует кибербезопасность на TryHackMe - можно спросить про CTF опыт");
    profile.strengths.push("Практикует кибербезопасность на TryHackMe");
  }
  
  // Парсим Kaggle
  if (application.kaggleUrl) {
    const username = extractUsernameFromUrl(application.kaggleUrl, 'kaggle');
    profile.profiles.kaggle = {
      url: application.kaggleUrl,
      username,
    };
    profile.interviewerHints.push("Кандидат участвует в Kaggle - можно спросить про ML соревнования");
    profile.strengths.push("Активный Kaggle профиль (Data Science)");
  }
  
  // Извлекаем информацию из резюме
  if (application.profileSummary) {
    const summary = application.profileSummary.toLowerCase();
    
    // Оценка опыта
    const yearsMatch = summary.match(/(\d+)\+?\s*(years?|лет|года)/i);
    if (yearsMatch) {
      profile.yearsOfExperience = parseInt(yearsMatch[1]);
    }
    
    // Извлекаем компании (простая эвристика)
    const companyKeywords = ['работал в', 'worked at', 'at company', 'компания', 'employer'];
    // Можно расширить парсинг
    
    // Определяем уровень из опыта
    if (profile.yearsOfExperience !== null) {
      if (profile.yearsOfExperience < 2) {
        profile.assessedLevel = 'junior';
      } else if (profile.yearsOfExperience < 5) {
        profile.assessedLevel = 'middle';
      } else {
        profile.assessedLevel = 'senior';
      }
    }
  }
  
  return profile;
}

// ============ ГЕНЕРАЦИЯ ПРОМПТА ДЛЯ ИНТЕРВЬЮЕРА ============

export function generateInterviewerContextPrompt(profile: CandidateProfile, role: string): string {
  const sections: string[] = [];
  
  // Базовая информация
  sections.push(`CANDIDATE: ${profile.name}`);
  sections.push(`ROLE: ${role}`);
  sections.push(`ASSESSED LEVEL: ${profile.assessedLevel.toUpperCase()}`);
  
  if (profile.yearsOfExperience) {
    sections.push(`YEARS OF EXPERIENCE: ${profile.yearsOfExperience}`);
  }
  
  // Резюме
  if (profile.experienceSummary) {
    sections.push(`\n=== RESUME SUMMARY ===\n${profile.experienceSummary.slice(0, 1000)}...`);
  }
  
  // Навыки
  if (profile.skills.length > 0) {
    sections.push(`\n=== SKILLS FROM APPLICATION ===\n${profile.skills.join(', ')}`);
  }
  
  // Профили платформ
  const platformInfo: string[] = [];
  
  if (profile.profiles.linkedin) {
    platformInfo.push(`- LinkedIn: ${profile.profiles.linkedin.url}`);
  }
  if (profile.profiles.github) {
    platformInfo.push(`- GitHub: ${profile.profiles.github.url} (username: ${profile.profiles.github.username || 'unknown'})`);
  }
  if (profile.profiles.leetcode) {
    platformInfo.push(`- LeetCode: ${profile.profiles.leetcode.url} - практикует алгоритмы`);
  }
  if (profile.profiles.codeforces) {
    platformInfo.push(`- Codeforces: ${profile.profiles.codeforces.url} - competitive programmer`);
  }
  if (profile.profiles.tryhackme) {
    platformInfo.push(`- TryHackMe: ${profile.profiles.tryhackme.url} - практикует кибербезопасность`);
  }
  if (profile.profiles.kaggle) {
    platformInfo.push(`- Kaggle: ${profile.profiles.kaggle.url} - участник ML соревнований`);
  }
  
  if (platformInfo.length > 0) {
    sections.push(`\n=== ONLINE PROFILES ===\n${platformInfo.join('\n')}`);
  }
  
  // Сильные стороны
  if (profile.strengths.length > 0) {
    sections.push(`\n=== DETECTED STRENGTHS ===\n${profile.strengths.map(s => `- ${s}`).join('\n')}`);
  }
  
  // Подсказки для интервьюера
  if (profile.interviewerHints.length > 0) {
    sections.push(`\n=== INTERVIEWER HINTS ===\n${profile.interviewerHints.map(h => `- ${h}`).join('\n')}`);
  }
  
  return sections.join('\n');
}

// ============ ГЕНЕРАЦИЯ ПРОМПТА ДЛЯ ОЦЕНКИ ============

export function generateEvaluatorContextPrompt(profile: CandidateProfile, role: string): string {
  const sections: string[] = [];
  
  sections.push(`=== CANDIDATE CONTEXT FOR EVALUATION ===`);
  sections.push(`Name: ${profile.name}`);
  sections.push(`Role: ${role}`);
  sections.push(`Assessed Level: ${profile.assessedLevel}`);
  
  if (profile.yearsOfExperience) {
    sections.push(`Claimed Experience: ${profile.yearsOfExperience} years`);
  }
  
  // Резюме - важно для проверки соответствия ответов опыту
  if (profile.experienceSummary) {
    sections.push(`\n--- RESUME/CV SUMMARY ---`);
    sections.push(profile.experienceSummary.slice(0, 1500));
    sections.push(`--- END RESUME ---`);
  }
  
  // Навыки из заявки
  if (profile.skills.length > 0) {
    sections.push(`\nClaimed Skills: ${profile.skills.join(', ')}`);
  }
  
  // Профили - важны для оценки уровня
  const profileContext: string[] = [];
  
  if (profile.profiles.leetcode) {
    profileContext.push(`LeetCode profile (algorithmic skills)`);
  }
  if (profile.profiles.codeforces) {
    profileContext.push(`Codeforces profile (competitive programming)`);
  }
  if (profile.profiles.github) {
    profileContext.push(`GitHub profile (open source activity)`);
  }
  if (profile.profiles.tryhackme) {
    profileContext.push(`TryHackMe profile (cybersecurity practice)`);
  }
  if (profile.profiles.kaggle) {
    profileContext.push(`Kaggle profile (data science competitions)`);
  }
  
  if (profileContext.length > 0) {
    sections.push(`\nVerified Profiles: ${profileContext.join(', ')}`);
  }
  
  // Инструкции для evaluator
  sections.push(`\n=== EVALUATION INSTRUCTIONS ===`);
  sections.push(`1. Compare answers against claimed experience in resume`);
  sections.push(`2. If candidate claims ${profile.yearsOfExperience || 'N/A'} years of experience, expect appropriate depth`);
  sections.push(`3. Online profiles suggest: ${profile.strengths.join(', ') || 'No additional signals'}`);
  sections.push(`4. Be MORE critical if answers don't match claimed experience level`);
  sections.push(`5. Give BONUS points if candidate demonstrates skills consistent with their profiles`);
  
  return sections.join('\n');
}

// ============ ЭКСПОРТ УТИЛИТ ============

export function hasAnyProfile(application: ApplicationData): boolean {
  return !!(
    application.linkedInUrl ||
    application.githubUrl ||
    application.leetcodeUrl ||
    application.codeforcesUrl ||
    application.tryhackmeUrl ||
    application.kaggleUrl ||
    application.profileSummary
  );
}

export function getProfileCount(application: ApplicationData): number {
  let count = 0;
  if (application.linkedInUrl) count++;
  if (application.githubUrl) count++;
  if (application.leetcodeUrl) count++;
  if (application.codeforcesUrl) count++;
  if (application.tryhackmeUrl) count++;
  if (application.kaggleUrl) count++;
  return count;
}

