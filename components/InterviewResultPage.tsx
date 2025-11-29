
import React, { useState, useEffect, useRef } from 'react';
import { InterviewResult, AppRoute, Speaker, AntiCheatReport } from '../types';
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

const Score: React.FC<{ label: string; value: number; max: number }> = ({ label, value = 0, max = 10 }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-neutral-400 text-xs"><span>{label}</span><span>{value}/{max}</span></div>
      <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-cyan-400" style={{ width: `${pct}%` }} /></div>
    </div>
  );
};

const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>

const AntiCheatCard: React.FC<{ report: AntiCheatReport }> = ({ report }) => {
  const getVerdictColor = (verdict: AntiCheatReport['verdict']) => {
    switch (verdict) {
      case 'clean': return 'text-green-400';
      case 'suspicious': return 'text-yellow-400';
      case 'cheating': return 'text-red-400';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold mb-3">Integrity Check</h2>
      <div className="flex justify-between items-baseline">
        <div>
          <p className="text-xs text-neutral-400">Verdict</p>
          <p className={`text-xl font-bold capitalize ${getVerdictColor(report.verdict)}`}>{report.verdict}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">Risk Score</p>
          <p className="text-2xl font-bold">{report.riskScore}</p>
        </div>
      </div>
      {report.flags.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <h3 className="text-sm font-semibold mb-2">Flags Raised</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-neutral-300">
            {report.flags.map((flag, i) => <li key={i}>{flag}</li>)}
          </ul>
        </div>
      )}
      <p className="text-xs text-neutral-500 mt-3">{report.reason}</p>
    </div>
  );
};

const InterviewResultPage: React.FC<InterviewResultPageProps> = ({ result, isLoading, setRoute }) => {
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);
  const [videoUrl, setVideoUrl] = useState(result?.recordingUrl || "");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);

  // Restore video URL from Blob if available (persistent)
  useEffect(() => {
    if (result?.recordingBlob) {
      const url = URL.createObjectURL(result.recordingBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (result?.recordingUrl) {
      setVideoUrl(result.recordingUrl);
    }
  }, [result]);


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

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setVolume(video.volume * 100);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [videoUrl]);

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
      <Button onClick={() => setRoute({ name: 'explore' })} className="mt-4">Return Home</Button>
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
        <Button onClick={() => setRoute({ name: 'candidateDashboard' })}>View All Applications</Button>
      </div>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold mb-3">Scores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {result.evaluation?.scores ? (
                <>
                  <Score label="Communication" value={result.evaluation.scores.comms} max={10} />
                  <Score label="Reasoning" value={result.evaluation.scores.reasoning} max={10} />
                  <Score label="Domain Knowledge" value={result.evaluation.scores.domain} max={10} />
                  <Score label="Overall" value={result.evaluation.scores.overall} max={100} />
                </>
              ) : <p className="text-sm text-neutral-400 col-span-2">Scores could not be generated.</p>}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold mb-2">Detailed Feedback</h2>
            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{result.evaluation?.detailedFeedback || 'No detailed feedback available.'}</p>
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
                    {result.application.linkedInUrl && <a href={result.application.linkedInUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"><LinkIcon />LinkedIn</a>}
                    {result.application.githubUrl && <a href={result.application.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"><LinkIcon />GitHub</a>}
                    {result.application.portfolioUrl && <a href={result.application.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"><LinkIcon />Portfolio</a>}
                  </div>
                </div>
              )}
            </div>
          </div>
          {result.antiCheatReport && <AntiCheatCard report={result.antiCheatReport} />}
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
            <h2 className="text-lg font-semibold mb-4">Interview Recording</h2>
            <div className="space-y-3">
              {/* Custom Video Player */}
              <div className="relative bg-black rounded-lg overflow-hidden shadow-lg shadow-cyan-900/20">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full aspect-video"
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.paused) videoRef.current.play();
                      else videoRef.current.pause();
                    }
                  }}
                />

                {/* Custom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  {/* Progress Bar */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    className="w-full h-1 mb-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
                    }}
                    onChange={(e) => {
                      if (videoRef.current) {
                        const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
                        videoRef.current.currentTime = time;
                      }
                    }}
                  />

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause */}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) videoRef.current.pause();
                            else videoRef.current.play();
                          }
                        }}
                        className="hover:text-cyan-400 transition"
                      >
                        {isPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      {/* Time Display */}
                      <span className="text-sm font-mono">
                        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /
                        {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                          <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                        </svg>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                          onChange={(e) => {
                            if (videoRef.current) {
                              videoRef.current.volume = parseFloat(e.target.value) / 100;
                            }
                          }}
                        />
                      </div>

                      {/* Fullscreen */}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (videoRef.current.requestFullscreen) {
                              videoRef.current.requestFullscreen();
                            }
                          }
                        }}
                        className="hover:text-cyan-400 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97h-2.69a.75.75 0 01-.75-.75zm-12 0A.75.75 0 013.75 3h4.5a.75.75 0 010 1.5H5.56l3.97 3.97a.75.75 0 01-1.06 1.06L4.5 5.56v2.69a.75.75 0 01-1.5 0v-4.5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download button */}
              {videoUrl && (
                <a
                  href={videoUrl}
                  download={`interview_${new Date(result.date).toISOString().split('T')[0]}.${result.recordingBlob?.type.includes('mp4') ? 'mp4' : 'webm'}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                  </svg>
                  Скачать интервью ({result.recordingBlob?.type.includes('mp4') ? 'MP4' : 'WebM'})
                </a>
              )}
            </div>
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

          {/* Transcript Section */}
          {result.transcript && result.transcript.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 col-span-1 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Interview Transcript</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {result.transcript.map((entry, i) => (
                  <div key={i} className={`flex flex-col ${entry.speaker === Speaker.USER ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${entry.speaker === Speaker.USER
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 rounded-tr-sm'
                      : 'bg-white/5 border border-white/10 text-neutral-300 rounded-tl-sm'
                      }`}>
                      <p className="text-xs opacity-50 mb-1 font-semibold">{entry.speaker}</p>
                      <p>{entry.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewResultPage;
