import React, { useState } from 'react';
import { Job, AppRoute, ApplicationData } from '../types';
import { safeGenerateJSON } from '../services/interviewPipeline/llmClient';
import { PIPELINE_CONFIG } from '../services/interviewPipeline/pipelineConfig';
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
  const [language, setLanguage] = useState("Russian");
  const [linkedInUrl, setLinkedInUrl] = useState(profileData?.linkedin || "");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Continue to Device Check");
  const [error, setError] = useState<string|null>(null);

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
    };

    if (applicationData.linkedInUrl || applicationData.githubUrl) {
      setLoadingMessage("Analyzing profiles…");
      try {
        const result = await safeGenerateJSON({
          model: PIPELINE_CONFIG.models.evaluator,
          systemPrompt: `You are an expert technical recruiter. Always respond with valid JSON only, no additional text.`,
          userPrompt: `As an expert technical recruiter, analyze the provided professional profile URLs. IMPORTANT: Do not attempt to access these URLs directly. Instead, based on the information present *in the URLs themselves* (like usernames or keywords) and your general knowledge of tech roles, infer a likely professional summary and key skills for this candidate. LinkedIn: ${applicationData.linkedInUrl || 'N/A'}, GitHub: ${applicationData.githubUrl || 'N/A'}. Provide your analysis in a clean JSON format with "profileSummary" (a brief one-paragraph summary) and "parsedSkills" (an array of 5-10 key technical or professional skills).`,
        });

        if (result.ok && result.fromLLM && result.data) {
          applicationData.profileSummary = result.data.profileSummary || "";
          applicationData.parsedSkills = result.data.parsedSkills || [];
        } else {
          // Fallback: используем базовые навыки из URL
          console.warn("LLM unavailable for profile analysis, using fallback");
          const skills: string[] = [];
          if (applicationData.githubUrl) {
            const githubMatch = applicationData.githubUrl.match(/github\.com\/([^\/]+)/);
            if (githubMatch) {
              skills.push("GitHub", "Version Control");
            }
          }
          if (applicationData.linkedInUrl) {
            skills.push("Professional Networking");
          }
          applicationData.parsedSkills = skills;
          applicationData.profileSummary = "Profile analysis unavailable. Please provide more details in your application.";
        }
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
          </section>
          
          <Button type="submit" disabled={loading} className="w-full md:w-auto">{loading ? loadingMessage : "Continue to Device Check"}</Button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;