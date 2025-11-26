import React, { useState, useMemo, useEffect } from 'react';
import { AppRoute, UniversalProfile, Job, TalentPoolCandidate } from '../types';
import { useAuth } from './AuthContext';

interface TalentPoolPageProps {
  setRoute: (route: AppRoute) => void;
  candidates: UniversalProfile[];
  jobs: Job[];
  selectedJobId?: number;
}

// Icons
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>;
const StarIcon = ({ filled = false }) => filled ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>;
const LinkedInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>;
const GithubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>;

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
};

const getScoreGradient = (score: number) => {
  if (score >= 80) return 'from-emerald-500 to-emerald-600';
  if (score >= 60) return 'from-amber-500 to-amber-600';
  return 'from-rose-500 to-rose-600';
};

const STAGES = [
  { id: 'new', label: 'Новые' },
  { id: 'reviewed', label: 'Просмотрено' },
  { id: 'shortlisted', label: 'Шортлист' },
  { id: 'contacted', label: 'Связались' },
  { id: 'interviewing', label: 'Интервью' },
  { id: 'offered', label: 'Оффер' },
  { id: 'hired', label: 'Нанят' },
  { id: 'passed', label: 'Отказ' },
];

const TalentPoolPage: React.FC<TalentPoolPageProps> = ({ setRoute, candidates, jobs, selectedJobId }) => {
  const { hirerData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<number | 'all'>(selectedJobId || 'all');
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<UniversalProfile | null>(null);
  
  // Candidate stages (persisted)
  const [candidateStages, setCandidateStages] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('talent_pool_stages');
    return saved ? JSON.parse(saved) : {};
  });

  // Shortlisted candidates
  const [shortlisted, setShortlisted] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('talent_pool_shortlisted');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Persist
  useEffect(() => {
    localStorage.setItem('talent_pool_stages', JSON.stringify(candidateStages));
  }, [candidateStages]);

  useEffect(() => {
    localStorage.setItem('talent_pool_shortlisted', JSON.stringify([...shortlisted]));
  }, [shortlisted]);

  // Calculate match scores for each candidate
  const candidatesWithMatch = useMemo(() => {
    return candidates.map(c => {
      // Simple matching algorithm
      let matchScore = c.scores.overall;
      const matchReasons: string[] = [];
      
      if (c.scores.communication >= 70) matchReasons.push('Отличная коммуникация');
      if (c.scores.problemSolving >= 70) matchReasons.push('Сильное решение проблем');
      if (c.scores.technicalDepth >= 70) matchReasons.push('Глубокие технические знания');
      if (c.status === 'verified') matchReasons.push('Верифицирован');
      
      return {
        ...c,
        matchScore,
        matchReasons,
      };
    });
  }, [candidates]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidatesWithMatch.filter(c => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = 
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.detectedSkills.some(s => s.skill.toLowerCase().includes(q));
        if (!match) return false;
      }
      
      // Min score
      if (c.matchScore < minScore) return false;
      
      return true;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [candidatesWithMatch, searchQuery, minScore]);

  // Stats
  const stats = useMemo(() => ({
    total: candidates.length,
    verified: candidates.filter(c => c.status === 'verified').length,
    shortlisted: shortlisted.size,
    avgScore: candidates.length > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.scores.overall, 0) / candidates.length)
      : 0,
  }), [candidates, shortlisted]);

  const toggleShortlist = (id: string) => {
    setShortlisted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateStage = (id: string, stage: string) => {
    setCandidateStages(prev => ({ ...prev, [id]: stage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Talent Pool
          </h1>
          <p className="text-neutral-400 mt-1">
            Пре-верифицированные кандидаты, готовые к работе
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-all flex items-center gap-2">
            <SparklesIcon /> AI-подбор
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <UsersIcon />, label: 'Всего кандидатов', value: stats.total, color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400' },
          { icon: <CheckBadgeIcon />, label: 'Верифицировано', value: stats.verified, color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400' },
          { icon: <StarIcon filled />, label: 'В шортлисте', value: stats.shortlisted, color: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400' },
          { icon: <SparklesIcon />, label: 'Средний балл', value: `${stats.avgScore}%`, color: 'from-pink-500/20 to-pink-500/5', iconColor: 'text-pink-400' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} border border-white/5`}>
            <div className={`${stat.iconColor} mb-2`}>{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
            <SearchIcon />
          </div>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, навыкам..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        <select
          value={selectedJob}
          onChange={e => setSelectedJob(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
        >
          <option value="all">Все вакансии</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all ${
            showFilters 
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
              : 'border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <FilterIcon /> Фильтры
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-neutral-500 block mb-2">Минимальный балл: {minScore}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Candidates Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCandidates.map((candidate) => {
          const isShortlisted = shortlisted.has(candidate.id);
          const stage = candidateStages[candidate.id] || 'new';
          
          return (
            <div
              key={candidate.id}
              className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                isShortlisted 
                  ? 'bg-amber-500/5 border-amber-500/30'
                  : 'bg-white/[0.02] border-white/10 hover:border-purple-500/30'
              }`}
              onClick={() => setSelectedCandidate(candidate)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{candidate.name}</h3>
                      {candidate.status === 'verified' && (
                        <CheckBadgeIcon />
                      )}
                    </div>
                    <p className="text-sm text-neutral-400">{candidate.assessedLevel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getScoreColor(candidate.matchScore)}`}>
                    {candidate.matchScore}
                  </p>
                  <p className="text-xs text-neutral-500">балл</p>
                </div>
              </div>

              {/* Score Bar */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreGradient(candidate.matchScore)} rounded-full`}
                  style={{ width: `${candidate.matchScore}%` }}
                />
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {candidate.detectedSkills.slice(0, 4).map((skill, i) => (
                  <span 
                    key={i}
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      skill.confidence >= 80 
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/10 text-neutral-300'
                    }`}
                  >
                    {skill.skill}
                  </span>
                ))}
                {candidate.detectedSkills.length > 4 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-neutral-500">
                    +{candidate.detectedSkills.length - 4}
                  </span>
                )}
              </div>

              {/* Match Reasons */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {candidate.matchReasons.slice(0, 2).map((reason, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 text-xs">
                    {reason}
                  </span>
                ))}
              </div>

              {/* Links & Stage */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {candidate.linkedIn && (
                    <a 
                      href={candidate.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-white/5 text-neutral-400 hover:text-blue-400 transition-colors"
                    >
                      <LinkedInIcon />
                    </a>
                  )}
                  {candidate.github && (
                    <a 
                      href={candidate.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-white/5 text-neutral-400 hover:text-white transition-colors"
                    >
                      <GithubIcon />
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleShortlist(candidate.id); }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isShortlisted 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'bg-white/5 text-neutral-400 hover:text-amber-400'
                    }`}
                  >
                    <StarIcon filled={isShortlisted} />
                  </button>
                  <select
                    value={stage}
                    onChange={(e) => { e.stopPropagation(); updateStage(candidate.id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    className="text-xs px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 border-0 cursor-pointer"
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
          <p className="text-neutral-400">Нет кандидатов</p>
          <p className="text-sm text-neutral-500 mt-1">Измените фильтры или дождитесь новых интервью</p>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          isShortlisted={shortlisted.has(selectedCandidate.id)}
          stage={candidateStages[selectedCandidate.id] || 'new'}
          onClose={() => setSelectedCandidate(null)}
          onToggleShortlist={() => toggleShortlist(selectedCandidate.id)}
          onUpdateStage={(stage) => updateStage(selectedCandidate.id, stage)}
        />
      )}
    </div>
  );
};

// Candidate Detail Modal
const CandidateModal: React.FC<{
  candidate: UniversalProfile;
  isShortlisted: boolean;
  stage: string;
  onClose: () => void;
  onToggleShortlist: () => void;
  onUpdateStage: (stage: string) => void;
}> = ({ candidate, isShortlisted, stage, onClose, onToggleShortlist, onUpdateStage }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-white/10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{candidate.name}</h2>
                  {candidate.status === 'verified' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1">
                      <CheckBadgeIcon /> Верифицирован
                    </span>
                  )}
                </div>
                <p className="text-neutral-400">{candidate.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scores */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Общий', value: candidate.scores.overall },
              { label: 'Коммуникация', value: candidate.scores.communication },
              { label: 'Проблемы', value: candidate.scores.problemSolving },
              { label: 'Технический', value: candidate.scores.technicalDepth },
              { label: 'Адаптивность', value: candidate.scores.adaptability },
            ].map((score, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.03] text-center">
                <p className={`text-2xl font-bold ${getScoreColor(score.value)}`}>{score.value}</p>
                <p className="text-xs text-neutral-500">{score.label}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-white/[0.03]">
            <h3 className="font-semibold text-sm text-neutral-400 mb-2">AI Резюме</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{candidate.summary}</p>
          </div>

          {/* Skills */}
          <div className="p-4 rounded-xl bg-white/[0.03]">
            <h3 className="font-semibold text-sm text-neutral-400 mb-3">Навыки</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.detectedSkills.map((skill, i) => (
                <span 
                  key={i}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    skill.confidence >= 80 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : skill.confidence >= 60
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/10 text-neutral-300 border border-white/10'
                  }`}
                >
                  {skill.skill} <span className="opacity-60">{skill.confidence}%</span>
                </span>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h3 className="font-semibold text-sm text-emerald-400 mb-2">Сильные стороны</h3>
              <ul className="space-y-1">
                {candidate.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                    <span className="text-emerald-400">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h3 className="font-semibold text-sm text-amber-400 mb-2">Зоны роста</h3>
              <ul className="space-y-1">
                {candidate.areasForImprovement.map((s, i) => (
                  <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                    <span className="text-amber-400">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Links */}
          <div className="p-4 rounded-xl bg-white/[0.03]">
            <h3 className="font-semibold text-sm text-neutral-400 mb-3">Контакты</h3>
            <div className="flex flex-wrap gap-3">
              <a 
                href={`mailto:${candidate.email}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-sm hover:bg-white/10 transition-all"
              >
                <MailIcon /> Email
              </a>
              {candidate.linkedIn && (
                <a 
                  href={candidate.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-all"
                >
                  <LinkedInIcon /> LinkedIn
                </a>
              )}
              {candidate.github && (
                <a 
                  href={candidate.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-sm hover:bg-white/10 transition-all"
                >
                  <GithubIcon /> GitHub
                </a>
              )}
              {candidate.recordingUrl && (
                <a 
                  href={candidate.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 text-sm hover:bg-purple-500/20 transition-all"
                >
                  <PlayIcon /> Запись интервью
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-900 border-t border-white/10 p-4 flex gap-3">
          <button
            onClick={onToggleShortlist}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              isShortlisted 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'border-white/10 hover:bg-white/5'
            }`}
          >
            <StarIcon filled={isShortlisted} />
            {isShortlisted ? 'В шортлисте' : 'В шортлист'}
          </button>
          <select
            value={stage}
            onChange={(e) => onUpdateStage(e.target.value)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium cursor-pointer border-0"
          >
            {STAGES.map(s => (
              <option key={s.id} value={s.id} className="text-black">{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TalentPoolPage;

