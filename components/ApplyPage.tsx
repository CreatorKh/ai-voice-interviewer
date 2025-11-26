
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Job, AppRoute, ApplicationData, ExperienceLevel } from '../types';
import Button from './Button';
import Stepper from './Stepper';
import { useAuth } from './AuthContext';

interface ApplyPageProps {
  job: Job;
  setRoute: (r: AppRoute) => void;
}

const ApplyPage: React.FC<ApplyPageProps> = ({ job, setRoute }) => {
  const { user, profileData } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  // Default to English explicitly to ensure STT works correctly for English speakers
  const [language, setLanguage] = useState("English"); 
  const [linkedInUrl, setLinkedInUrl] = useState(profileData?.linkedin || "");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [kaggleUrl, setKaggleUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [tryhackmeUrl, setTryhackmeUrl] = useState("");
  const [codeforcesUrl, setCodeforcesUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Continue to Device Check");
  const [error, setError] = useState<string|null>(null);
  
  // Get selected level from localStorage (set in JobPage)
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | undefined>(() => {
    const saved = localStorage.getItem('selectedLevel');
    return saved ? saved as ExperienceLevel : undefined;
  });

  // Clear the level from localStorage after reading
  useEffect(() => {
    localStorage.removeItem('selectedLevel');
  }, []);

  const languages = ["English", "Russian"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setLoadingMessage("Submitting…");

    const applicationData: ApplicationData = { 
      name, 
      email, 
      language, 
      linkedInUrl: linkedInUrl || undefined,
      githubUrl: githubUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      kaggleUrl: kaggleUrl || undefined,
      leetcodeUrl: leetcodeUrl || undefined,
      tryhackmeUrl: tryhackmeUrl || undefined,
      codeforcesUrl: codeforcesUrl || undefined,
      selectedLevel: selectedLevel,
    };

    if (applicationData.linkedInUrl || applicationData.githubUrl || applicationData.kaggleUrl || applicationData.leetcodeUrl || applicationData.tryhackmeUrl || applicationData.codeforcesUrl) {
      setLoadingMessage("Analyzing profiles…");
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `As an expert technical recruiter, analyze the provided professional profile URLs. IMPORTANT: Do not attempt to access these URLs directly. Instead, based on the information present *in the URLs themselves* (like usernames or keywords) and your general knowledge of tech roles, infer a likely professional summary and key skills for this candidate. 
        
        URLs:
        - LinkedIn: ${applicationData.linkedInUrl || 'N/A'}
        - GitHub: ${applicationData.githubUrl || 'N/A'}
        - Kaggle: ${applicationData.kaggleUrl || 'N/A'}
        - LeetCode: ${applicationData.leetcodeUrl || 'N/A'}
        - TryHackMe: ${applicationData.tryhackmeUrl || 'N/A'}
        - CodeForces: ${applicationData.codeforcesUrl || 'N/A'}
        
        Provide your analysis in a clean JSON format.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                profileSummary: { 
                  type: Type.STRING,
                  description: "A brief, one-paragraph summary of the candidate's likely professional background and expertise."
                },
                parsedSkills: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "A list of 5-10 key technical or professional skills."
                },
              },
              required: ['profileSummary', 'parsedSkills']
            }
          }
        });
        
        const parsedResult = JSON.parse(response.text.trim());
        applicationData.profileSummary = parsedResult.profileSummary;
        applicationData.parsedSkills = parsedResult.parsedSkills;
        
      } catch (err) {
        console.error("Error parsing social profiles:", err);
        // Do not block submission, just log the error and proceed.
      }
    }

    setLoading(false);
    setRoute({name: "prep", jobId: job.id, applicationData});
  }

  return (
    <div className="grid lg:grid-cols-[320px,1fr] gap-8">
      <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold opacity-80 mb-3">Application Progress</h3>
        <Stepper current={1}/>
        <ul className="mt-4 text-sm space-y-2 text-neutral-300">
          <li className="font-semibold text-white">1. Basic Information</li>
          <li className="opacity-60">2. Device Check</li>
          <li className="opacity-60">3. AI Interview</li>
        </ul>
        
        {selectedLevel && (
          <div className="mt-6 p-3 rounded-lg bg-white/[0.03] border border-white/10">
            <p className="text-xs text-neutral-400">Selected Level</p>
            <p className={`font-semibold mt-1 ${
              selectedLevel === 'junior' ? 'text-green-400' :
              selectedLevel === 'middle' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {selectedLevel === 'junior' ? 'Junior' : selectedLevel === 'middle' ? 'Middle' : 'Senior'}
            </p>
          </div>
        )}
      </aside>
      <div>
        <button onClick={() => setRoute({ name: 'job', id: job.id })} className="text-sm text-cyan-300 hover:underline mb-4">← Back to job details</button>
        <h1 className="text-2xl font-bold mb-1">Apply for {job.title}</h1>
        <p className="text-neutral-400 mb-6">{user ? "We've pre-filled your information. Please add any relevant links below." : "Let's start with the basics."}</p>
        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <h2 className="font-semibold">Contact Info</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs opacity-80">Full name *</label>
                <input className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3 disabled:bg-neutral-800 disabled:opacity-70" required value={name} onChange={e => setName(e.target.value)} disabled={!!user} />
              </div>
              <div className="grid gap-1">
                <label className="text-xs opacity-80">Email *</label>
                <input className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3 disabled:bg-neutral-800 disabled:opacity-70" required type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!!user} />
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs opacity-80">Interview Language *</label>
              <select className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3" required value={language} onChange={e => setLanguage(e.target.value)}>
                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <h2 className="font-semibold">Professional Links (Optional)</h2>
             <div className="grid gap-1">
                <label className="text-xs opacity-80">LinkedIn Profile URL</label>
                <input className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3" type="url" placeholder="https://linkedin.com/in/..." value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)}/>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="text-xs opacity-80">GitHub Profile URL</label>
                  <input className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3" type="url" placeholder="https://github.com/..." value={githubUrl} onChange={e => setGithubUrl(e.target.value)}/>
                </div>
                <div className="grid gap-1">
                  <label className="text-xs opacity-80">Portfolio/Website URL</label>
                  <input className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3" type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)}/>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="grid gap-1">
                  <label className="text-xs opacity-80">Kaggle Profile URL</label>
                  <input className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3" type="url" placeholder="https://kaggle.com/..." value={kaggleUrl} onChange={e => setKaggleUrl(e.target.value)}/>
                </div>
                <div className="grid gap-1">
                  <label className="text-xs opacity-80">LeetCode Profile URL</label>
                  <input className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3" type="url" placeholder="https://leetcode.com/..." value={leetcodeUrl} onChange={e => setLeetcodeUrl(e.target.value)}/>
                </div>
              </div>

               <div className="grid md:grid-cols-2 gap-4">
                 <div className="grid gap-1">
                  <label className="text-xs opacity-80">TryHackMe Profile URL</label>
                  <input className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3" type="url" placeholder="https://tryhackme.com/p/..." value={tryhackmeUrl} onChange={e => setTryhackmeUrl(e.target.value)}/>
                </div>
                <div className="grid gap-1">
                  <label className="text-xs opacity-80">CodeForces Profile URL</label>
                  <input className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3" type="url" placeholder="https://codeforces.com/profile/..." value={codeforcesUrl} onChange={e => setCodeforcesUrl(e.target.value)}/>
                </div>
              </div>
          </section>
          
          <Button type="submit" disabled={loading} className="w-full md:w-auto">{loading ? loadingMessage : "Continue to Device Check"}</Button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;
