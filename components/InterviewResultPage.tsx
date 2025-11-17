import React, { useState, useEffect } from 'react';
import { InterviewResult, AppRoute, Speaker } from '../types';
import Button from './Button';

interface InterviewResultPageProps {
  result: InterviewResult | null;
  isLoading: boolean;
  setRoute: (r: AppRoute) => void;
}

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

const ThumbsUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM18.5 8.25a1.25 1.25 0 0 0-1.25-1.25h-6.14l.94-4.68a1.25 1.25 0 0 0-2.312-1.09l-4.5 7.5a1.25 1.25 0 0 0 0 1.25h11.19l-1.15 5.21a1.25 1.25 0 0 0 1.21 1.54h2.25a1.25 1.25 0 0 0 1.25-1.25v-6.25a1.25 1.25 0 0 0-1.25-1.25Z" /></svg>;
const ThumbsDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M19 11.75a1.25 1.25 0 1 1-2.5 0v-7.5a1.25 1.25 0 1 1 2.5 0v7.5ZM1.5 11.75a1.25 1.25 0 0 0 1.25 1.25h6.14l-.94 4.68a1.25 1.25 0 0 0 2.312 1.09l4.5-7.5a1.25 1.25 0 0 0 0-1.25H4.81l1.15-5.21a1.25 1.25 0 0 0-1.21-1.54H2.5A1.25 1.25 0 0 0 1.25 5v6.25a1.25 1.25 0 0 0 1.25 1.25Z" /></svg>;

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 h-[50vh]">
        <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-2xl font-bold mt-4">Analyzing Your Performance...</h2>
        <p className="text-neutral-400 mt-2">Our AI is generating detailed feedback on your interview.</p>
    </div>
);

const Score: React.FC<{label: string; value: number; max: number}> = ({label, value = 0, max = 10}) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-neutral-400 text-xs"><span>{label}</span><span>{value}/{max}</span></div>
      <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-cyan-400" style={{width: `${pct}%`}}/></div>
    </div>
  );
};

const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>

const InterviewResultPage: React.FC<InterviewResultPageProps> = ({ result, isLoading, setRoute }) => {
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);

  // Load feedback from localStorage when the component mounts or the result changes.
  useEffect(() => {
    if (!result) return;
    // Create a unique key for this specific interview result to store feedback.
    const key = `feedback_${result.job.id}_${result.date}`;
    const storedFeedback = localStorage.getItem(key);
    if (storedFeedback === 'helpful' || storedFeedback === 'unhelpful') {
      setFeedback(storedFeedback as 'helpful' | 'unhelpful');
    } else {
      setFeedback(null); // Reset for new/different results
    }
  }, [result]);

  // Handle user feedback submission.
  const handleFeedback = (feedbackType: 'helpful' | 'unhelpful') => {
    if (!result || feedback) return; // Prevent re-submission if feedback is already given.
    
    // Use the same unique key to save the feedback.
    const key = `feedback_${result.job.id}_${result.date}`;
    localStorage.setItem(key, feedbackType);
    setFeedback(feedbackType); // Update the UI immediately.
  };

  if (isLoading) return <LoadingSpinner />;
  if (!result) return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">An error occurred.</h2>
        <p className="text-neutral-500 mt-2">We couldn't load your interview summary.</p>
        <Button onClick={() => setRoute({name: 'explore'})} className="mt-4">Return Home</Button>
      </div>
  );

  const hasLinks = result.application.githubUrl || result.application.linkedInUrl || result.application.portfolioUrl;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">Interview Results</h1>
          <p className="text-neutral-400">For {result.job.title} on {new Date(result.date).toLocaleDateString()}</p>
        </div>
        <Button onClick={() => setRoute({name: 'candidateDashboard'})}>View All Applications</Button>
      </div>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold mb-3">Scores</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {result.evaluation?.scores ? (
                        <>
                            <Score label="Communication" value={Math.round(result.evaluation.scores.comms / 10)} max={10}/>
                            <Score label="Reasoning" value={Math.round(result.evaluation.scores.reasoning / 10)} max={10}/>
                            <Score label="Domain Knowledge" value={Math.round(result.evaluation.scores.domain / 10)} max={10}/>
                            <Score label="Overall" value={result.evaluation.scores.overall} max={100}/>
                        </>
                    ) : <p className="text-sm text-neutral-400 col-span-2">Scores could not be generated.</p>}
                </div>
                  {(result.evaluation?.detailedFeedback?.includes('quota limits') || 
                    result.evaluation?.detailedFeedback?.includes('heuristic') ||
                    result.evaluation?.detailedFeedback?.includes('LLM')) && (
                    <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-xs text-yellow-400 font-medium mb-1">
                        ⚠ Оценка основана на локальных признаках
                      </p>
                      <p className="text-xs text-yellow-300/80">
                        Подробная оценка ответов была пропущена из-за ограничений квоты API. Ниже – базовый скоринг по поверхностным признакам (длина ответа, технические ключевые слова, токсичность). Для полного анализа требуется доступ к LLM.
                      </p>
                    </div>
                  )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold mb-2">Detailed Feedback</h2>
                <p className="text-sm text-neutral-300 whitespace-pre-wrap">{result.evaluation?.detailedFeedback || 'No detailed feedback available.'}</p>
                
                {/* Parse JSON evaluation if available */}
                {result.evaluation?.detailedFeedback && (() => {
                  try {
                    const parsed = JSON.parse(result.evaluation.detailedFeedback);
                    if (parsed.verdict || parsed.overall_score !== undefined) {
                      return (
                        <div className="mt-4 space-y-4 pt-4 border-t border-white/10">
                          {parsed.verdict && (
                            <div>
                              <h3 className="text-sm font-semibold mb-2">Verdict</h3>
                              <p className={`text-base font-bold ${
                                parsed.verdict === 'Strong hire' ? 'text-green-400' :
                                parsed.verdict === 'Hire' ? 'text-green-300' :
                                parsed.verdict === 'Borderline' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {parsed.verdict}
                              </p>
                              {parsed.verdict_reasoning && Array.isArray(parsed.verdict_reasoning) && (
                                <ul className="mt-2 space-y-1 text-sm text-neutral-300">
                                  {parsed.verdict_reasoning.map((reason: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="text-cyan-400 mt-1">•</span>
                                      <span>{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                          
                          {parsed.skill_scores && Array.isArray(parsed.skill_scores) && parsed.skill_scores.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold mb-2">Skill Scores</h3>
                              <div className="space-y-2">
                                {parsed.skill_scores.map((skill: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-300">{skill.name}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                                        <div 
                                          className="h-full bg-cyan-400" 
                                          style={{width: `${skill.score}%`}}
                                        />
                                      </div>
                                      <span className="text-cyan-400 font-medium w-12 text-right">{skill.score}/100</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {parsed.anti_cheat && (
                            <div>
                              <h3 className="text-sm font-semibold mb-2">Anti-Cheat Analysis</h3>
                              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                                parsed.anti_cheat.suspicion_level === 'high' ? 'bg-red-500/20 text-red-400' :
                                parsed.anti_cheat.suspicion_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                Risk Level: {parsed.anti_cheat.suspicion_level?.toUpperCase() || 'LOW'}
                              </div>
                              {parsed.anti_cheat.summary && (
                                <p className="text-sm text-neutral-300 mt-2">{parsed.anti_cheat.summary}</p>
                              )}
                              {parsed.anti_cheat.signals && Array.isArray(parsed.anti_cheat.signals) && parsed.anti_cheat.signals.length > 0 && (
                                <ul className="mt-2 space-y-1 text-sm text-neutral-400">
                                  {parsed.anti_cheat.signals.map((signal: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="text-yellow-400 mt-1">⚠</span>
                                      <span>{signal}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                          
                          {parsed.role_fit && (
                            <div>
                              <h3 className="text-sm font-semibold mb-2">Role Fit</h3>
                              {parsed.role_fit.best_fit_roles && Array.isArray(parsed.role_fit.best_fit_roles) && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {parsed.role_fit.best_fit_roles.map((role: string, i: number) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
                                      {role}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {parsed.role_fit.notes && (
                                <p className="text-sm text-neutral-300">{parsed.role_fit.notes}</p>
                              )}
                            </div>
                          )}
                          
                          {parsed.next_steps && (
                            <div>
                              <h3 className="text-sm font-semibold mb-2">Next Steps</h3>
                              {parsed.next_steps.recommended_rounds && Array.isArray(parsed.next_steps.recommended_rounds) && (
                                <div className="mb-2">
                                  <p className="text-xs text-neutral-400 mb-1">Recommended Rounds:</p>
                                  <ul className="text-sm text-neutral-300 space-y-1">
                                    {parsed.next_steps.recommended_rounds.map((round: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-cyan-400 mt-1">→</span>
                                        <span>{round}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {parsed.next_steps.focus_points && Array.isArray(parsed.next_steps.focus_points) && (
                                <div>
                                  <p className="text-xs text-neutral-400 mb-1">Focus Points:</p>
                                  <ul className="text-sm text-neutral-300 space-y-1">
                                    {parsed.next_steps.focus_points.map((point: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-cyan-400 mt-1">•</span>
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  } catch {
                    // Not JSON, return nothing
                  }
                  return null;
                })()}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold mb-2">Transcript</h2>
                <div className="bg-black/20 p-4 rounded-lg h-80 overflow-y-auto space-y-4">
                {result.transcript.map((entry, index) => (
                    <div key={index} className={`flex items-start gap-3 text-sm ${entry.speaker === Speaker.USER ? 'justify-end' : ''}`}>
                        <div className={`max-w-xl p-3 rounded-lg ${entry.speaker === Speaker.AI ? 'bg-neutral-800' : 'bg-cyan-800'}`}>
                            <p className="font-bold text-xs mb-1 opacity-70">{entry.speaker}</p>
                            <p>{entry.text}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold mb-3">Candidate Details</h2>
                <div className="space-y-2 text-sm">
                    <div>
                        <p className="text-xs text-neutral-400">Name</p>
                        <p>{result.application.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400">Email</p>
                        <p>{result.application.email}</p>
                    </div>
                    {hasLinks && (
                        <div>
                            <p className="text-xs text-neutral-400 mb-1">Links</p>
                            <div className="flex flex-wrap gap-2">
                                {result.application.linkedInUrl && <a href={result.application.linkedInUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"><LinkIcon/>LinkedIn</a>}
                                {result.application.githubUrl && <a href={result.application.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"><LinkIcon/>GitHub</a>}
                                {result.application.portfolioUrl && <a href={result.application.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"><LinkIcon/>Portfolio</a>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {result.application.profileSummary && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 className="text-lg font-semibold mb-2">AI-Inferred Profile Summary</h2>
                    <p className="text-sm text-neutral-300 whitespace-pre-wrap">{result.application.profileSummary}</p>
                    {result.application.parsedSkills && result.application.parsedSkills.length > 0 && (
                        <>
                            <h3 className="text-sm font-semibold mt-4 mb-2">Inferred Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.application.parsedSkills.map((skill, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/10">{skill}</span>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
             <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold mb-2">Interview Recording</h2>
                <video src={result.recordingUrl} controls className="w-full rounded-lg bg-black aspect-video"></video>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold mb-2">AI Summary</h2>
                <p className="text-sm text-neutral-300">{result.evaluation?.summary || 'No summary available.'}</p>
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-neutral-400">
                            {feedback ? 'Thank you for your feedback!' : 'Was this summary helpful?'}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleFeedback('helpful')}
                                disabled={!!feedback}
                                aria-pressed={feedback === 'helpful'}
                                className={cn(
                                    "p-1.5 rounded-full transition",
                                    !feedback && "hover:bg-white/10 text-neutral-400 hover:text-white",
                                    feedback === 'helpful' && "bg-green-500/20 text-green-400",
                                    feedback && feedback !== 'helpful' && "opacity-40",
                                    feedback && "cursor-default"
                                )}
                                aria-label="Helpful"
                            >
                                <ThumbsUpIcon />
                            </button>
                            <button
                                onClick={() => handleFeedback('unhelpful')}
                                disabled={!!feedback}
                                aria-pressed={feedback === 'unhelpful'}
                                className={cn(
                                    "p-1.5 rounded-full transition",
                                    !feedback && "hover:bg-white/10 text-neutral-400 hover:text-white",
                                    feedback === 'unhelpful' && "bg-red-500/20 text-red-400",
                                    feedback && feedback !== 'unhelpful' && "opacity-40",
                                    feedback && "cursor-default"
                                )}
                                aria-label="Not helpful"
                            >
                                <ThumbsDownIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold mb-3">Strengths</h2>
                <ul className="list-disc list-inside space-y-2 text-sm text-neutral-300">
                    {result.evaluation?.strengths?.length ? result.evaluation.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>No strengths identified.</li>}
                </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold mb-3">Areas for Improvement</h2>
                <ul className="list-disc list-inside space-y-2 text-sm text-neutral-300">
                    {result.evaluation?.areasForImprovement?.length ? result.evaluation.areasForImprovement.map((a, i) => <li key={i}>{a}</li>) : <li>No areas for improvement identified.</li>}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultPage;