import React, { useState, useMemo, useEffect } from 'react';
import { AppRoute, InterviewResult, Contract, ExperienceLevel } from '../types';
import { useAuth } from './AuthContext';

interface HirerDashboardPageProps {
  results: InterviewResult[];
  contracts: Contract[];
  setRoute: (r: AppRoute) => void;
  onHire: (resultIndex: number, hourlyRate: number) => void;
  onFund: (contractId: number, amount: number) => void;
  onRelease: (contractId: number) => void;
}

// ============ ICONS ============
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>;
const StarIcon = ({ filled = false, className = "w-5 h-5" }) => filled ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>;
const LinkedInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>;
const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>;

// ============ CONSTANTS ============
const levelLabels: Record<ExperienceLevel, { label: string; color: string }> = {
  junior: { label: 'Junior', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  middle: { label: 'Middle', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  senior: { label: 'Senior', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
};

const PIPELINE_STAGES = [
  { id: 'new', label: 'Новые', color: 'from-purple-500 to-purple-600' },
  { id: 'reviewed', label: 'Просмотрено', color: 'from-blue-500 to-blue-600' },
  { id: 'shortlisted', label: 'Шортлист', color: 'from-amber-500 to-amber-600' },
  { id: 'interview', label: 'На интервью', color: 'from-cyan-500 to-cyan-600' },
  { id: 'offer', label: 'Оффер', color: 'from-emerald-500 to-emerald-600' },
  { id: 'hired', label: 'Нанят', color: 'from-green-500 to-green-600' },
  { id: 'rejected', label: 'Отказ', color: 'from-neutral-500 to-neutral-600' },
];

type PipelineStage = typeof PIPELINE_STAGES[number]['id'];
type ViewMode = 'pipeline' | 'list' | 'analytics';

// ============ HELPER FUNCTIONS ============
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-rose-400';
};

const getScoreGradient = (score: number) => {
  if (score >= 80) return 'from-emerald-500 to-emerald-600';
  if (score >= 60) return 'from-amber-500 to-amber-600';
  if (score >= 40) return 'from-orange-500 to-orange-600';
  return 'from-rose-500 to-rose-600';
};

const getVerdictStyle = (verdict: string) => {
  switch (verdict) {
    case 'Hire': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Maybe': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  }
};

// ============ MAIN COMPONENT ============
const HirerDashboardPage: React.FC<HirerDashboardPageProps> = ({ results, contracts, setRoute, onHire }) => {
  const { hirerData } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJob, setFilterJob] = useState<string>('all');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<InterviewResult | null>(null);
  
  // Pipeline stages for candidates
  const [candidateStages, setCandidateStages] = useState<Record<number, PipelineStage>>(() => {
    const saved = localStorage.getItem('candidate_stages');
    return saved ? JSON.parse(saved) : {};
  });

  // Notes for candidates
  const [candidateNotes, setCandidateNotes] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('candidate_notes');
    return saved ? JSON.parse(saved) : {};
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem('candidate_stages', JSON.stringify(candidateStages));
  }, [candidateStages]);

  useEffect(() => {
    localStorage.setItem('candidate_notes', JSON.stringify(candidateNotes));
  }, [candidateNotes]);

  // Get unique jobs
  const uniqueJobs = useMemo(() => {
    return Array.from(new Set(results.map(r => r.job.title)));
  }, [results]);

  // Filter results
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = 
          r.application.name.toLowerCase().includes(q) ||
          r.job.title.toLowerCase().includes(q) ||
          r.application.email?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterJob !== 'all' && r.job.title !== filterJob) return false;
      if (filterVerdict !== 'all' && r.evaluation?.finalVerdict !== filterVerdict) return false;
      return true;
    });
  }, [results, searchQuery, filterJob, filterVerdict]);

  // Group by pipeline stage
  const pipelineData = useMemo(() => {
    const groups: Record<PipelineStage, InterviewResult[]> = {
      new: [], reviewed: [], shortlisted: [], interview: [], offer: [], hired: [], rejected: []
    };
    
    filteredResults.forEach((r, i) => {
      const stage = candidateStages[i] || 'new';
      groups[stage].push(r);
    });
    
    return groups;
  }, [filteredResults, candidateStages]);

  // Stats
  const stats = useMemo(() => {
    const total = results.length;
    const thisWeek = results.filter(r => {
      const date = new Date(r.date || 0);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length;
    const hired = Object.values(candidateStages).filter(s => s === 'hired').length;
    const avgScore = total > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.evaluation?.scores?.overall || 0), 0) / total)
      : 0;
    const hireRate = total > 0 ? Math.round((results.filter(r => r.evaluation?.finalVerdict === 'Hire').length / total) * 100) : 0;
    
    return { total, thisWeek, hired, avgScore, hireRate };
  }, [results, candidateStages]);

  const moveCandidate = (index: number, stage: PipelineStage) => {
    setCandidateStages(prev => ({ ...prev, [index]: stage }));
  };

  const updateNote = (index: number, note: string) => {
    setCandidateNotes(prev => ({ ...prev, [index]: note }));
  };

  const exportCSV = () => {
    const data = filteredResults.map((r, i) => ({
      name: r.application.name,
      email: r.application.email,
      phone: r.application.phone || '',
      job: r.job.title,
      level: r.level || 'N/A',
      score: r.evaluation?.scores?.overall || 0,
      verdict: r.evaluation?.finalVerdict || 'N/A',
      stage: candidateStages[i] || 'new',
      date: r.date || 'N/A',
    }));
    
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(d => Object.values(d).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Добро пожаловать, {hirerData?.companyName || 'HR'}
            </h1>
            <p className="text-neutral-400 mt-1">Управляйте кандидатами и процессом найма</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportCSV}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <DownloadIcon /> Экспорт
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-all flex items-center gap-2">
              <SparklesIcon /> AI-поиск
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: <UsersIcon />, label: 'Всего кандидатов', value: stats.total, color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400' },
            { icon: <ClockIcon />, label: 'За неделю', value: `+${stats.thisWeek}`, color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400' },
            { icon: <BriefcaseIcon />, label: 'Нанято', value: stats.hired, color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400' },
            { icon: <ChartIcon />, label: 'Средний балл', value: `${stats.avgScore}%`, color: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400' },
            { icon: <StarIcon filled className="w-6 h-6" />, label: 'Hire Rate', value: `${stats.hireRate}%`, color: 'from-pink-500/20 to-pink-500/5', iconColor: 'text-pink-400' },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} border border-white/5`}>
              <div className={`${stat.iconColor} mb-2`}>{stat.icon}</div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
            <SearchIcon />
          </div>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, email, вакансии..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {/* View Switcher */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {[
            { id: 'pipeline' as ViewMode, label: 'Пайплайн' },
            { id: 'list' as ViewMode, label: 'Список' },
            { id: 'analytics' as ViewMode, label: 'Аналитика' },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                viewMode === mode.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
            showFilters 
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
              : 'border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
          }`}
        >
          <FilterIcon />
          Фильтры
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-neutral-500 block mb-2">Вакансия</label>
            <select
              value={filterJob}
              onChange={e => setFilterJob(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Все вакансии</option>
              {uniqueJobs.map(job => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-2">Вердикт AI</label>
            <select
              value={filterVerdict}
              onChange={e => setFilterVerdict(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Все</option>
              <option value="Hire">Hire</option>
              <option value="Maybe">Maybe</option>
              <option value="No Hire">No Hire</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'pipeline' ? (
        <PipelineView 
          stages={PIPELINE_STAGES}
          data={pipelineData}
          allResults={results}
          onMove={moveCandidate}
          onSelect={setSelectedCandidate}
          candidateStages={candidateStages}
        />
      ) : viewMode === 'list' ? (
        <ListView 
          results={filteredResults}
          allResults={results}
          candidateStages={candidateStages}
          onMove={moveCandidate}
          onSelect={setSelectedCandidate}
          onViewDetails={(i) => setRoute({ name: 'interviewResult', resultIndex: results.indexOf(filteredResults[i]) })}
        />
      ) : (
        <AnalyticsView results={results} candidateStages={candidateStages} />
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          index={results.indexOf(selectedCandidate)}
          stage={candidateStages[results.indexOf(selectedCandidate)] || 'new'}
          note={candidateNotes[results.indexOf(selectedCandidate)] || ''}
          onClose={() => setSelectedCandidate(null)}
          onMove={(stage) => moveCandidate(results.indexOf(selectedCandidate), stage)}
          onUpdateNote={(note) => updateNote(results.indexOf(selectedCandidate), note)}
          onViewFull={() => {
            setRoute({ name: 'interviewResult', resultIndex: results.indexOf(selectedCandidate) });
            setSelectedCandidate(null);
          }}
          onHire={() => {
            onHire(results.indexOf(selectedCandidate), selectedCandidate.job.rate_max || 100);
            moveCandidate(results.indexOf(selectedCandidate), 'hired');
          }}
        />
      )}
    </div>
  );
};

// ============ PIPELINE VIEW ============
const PipelineView: React.FC<{
  stages: typeof PIPELINE_STAGES;
  data: Record<PipelineStage, InterviewResult[]>;
  allResults: InterviewResult[];
  candidateStages: Record<number, PipelineStage>;
  onMove: (index: number, stage: PipelineStage) => void;
  onSelect: (candidate: InterviewResult) => void;
}> = ({ stages, data, allResults, onMove, onSelect }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map(stage => (
        <div key={stage.id} className="flex-shrink-0 w-72">
          {/* Stage Header */}
          <div className={`p-3 rounded-t-xl bg-gradient-to-r ${stage.color}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{stage.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                {data[stage.id as PipelineStage].length}
              </span>
            </div>
          </div>
          
          {/* Stage Content */}
          <div className="bg-white/[0.02] border border-white/10 border-t-0 rounded-b-xl p-2 min-h-[400px] space-y-2">
            {data[stage.id as PipelineStage].map((candidate, i) => {
              const globalIndex = allResults.indexOf(candidate);
              const score = candidate.evaluation?.scores?.overall || 0;
              
              return (
                <div
                  key={i}
                  onClick={() => onSelect(candidate)}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {candidate.application.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{candidate.application.name}</p>
                        <p className="text-xs text-neutral-500">{candidate.job.title}</p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                      {score}
                    </div>
                  </div>
                  
                  {/* Score Bar */}
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full bg-gradient-to-r ${getScoreGradient(score)} rounded-full`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {candidate.evaluation?.finalVerdict && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getVerdictStyle(candidate.evaluation.finalVerdict)}`}>
                        {candidate.evaluation.finalVerdict}
                      </span>
                    )}
                    {candidate.level && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${levelLabels[candidate.level].color}`}>
                        {levelLabels[candidate.level].label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {data[stage.id as PipelineStage].length === 0 && (
              <div className="h-32 flex items-center justify-center text-neutral-600 text-sm">
                Пусто
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============ LIST VIEW ============
const ListView: React.FC<{
  results: InterviewResult[];
  allResults: InterviewResult[];
  candidateStages: Record<number, PipelineStage>;
  onMove: (index: number, stage: PipelineStage) => void;
  onSelect: (candidate: InterviewResult) => void;
  onViewDetails: (index: number) => void;
}> = ({ results, allResults, candidateStages, onMove, onSelect, onViewDetails }) => {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/[0.03]">
          <tr className="text-left text-sm text-neutral-400">
            <th className="p-4">Кандидат</th>
            <th className="p-4">Вакансия</th>
            <th className="p-4 text-center">Балл</th>
            <th className="p-4 text-center">Вердикт</th>
            <th className="p-4 text-center">Этап</th>
            <th className="p-4 text-center">Дата</th>
            <th className="p-4 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const globalIndex = allResults.indexOf(r);
            const stage = candidateStages[globalIndex] || 'new';
            const stageInfo = PIPELINE_STAGES.find(s => s.id === stage);
            const score = r.evaluation?.scores?.overall || 0;
            
            return (
              <tr 
                key={i} 
                className="border-t border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                onClick={() => onSelect(r)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {r.application.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{r.application.name}</p>
                      <p className="text-xs text-neutral-500">{r.application.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm">{r.job.title}</span>
                  {r.level && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${levelLabels[r.level].color}`}>
                      {levelLabels[r.level].label}
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <span className={`text-xl font-bold ${getScoreColor(score)}`}>{score}</span>
                </td>
                <td className="p-4 text-center">
                  {r.evaluation?.finalVerdict && (
                    <span className={`text-xs px-3 py-1 rounded-full border ${getVerdictStyle(r.evaluation.finalVerdict)}`}>
                      {r.evaluation.finalVerdict}
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <select
                    value={stage}
                    onChange={(e) => {
                      e.stopPropagation();
                      onMove(globalIndex, e.target.value as PipelineStage);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r ${stageInfo?.color} text-white border-0 cursor-pointer`}
                  >
                    {PIPELINE_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-center text-sm text-neutral-400">
                  {r.date ? new Date(r.date).toLocaleDateString('ru-RU') : '—'}
                </td>
                <td className="p-4">
                  <div className="flex gap-1 justify-end">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onViewDetails(i); }}
                      className="p-2 rounded-lg text-neutral-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                    >
                      <PlayIcon />
                    </button>
                    {r.application.linkedInUrl && (
                      <a 
                        href={r.application.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      >
                        <LinkedInIcon />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {results.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-neutral-400">Нет кандидатов</p>
          <p className="text-sm text-neutral-500 mt-1">Измените фильтры или дождитесь новых интервью</p>
        </div>
      )}
    </div>
  );
};

// ============ ANALYTICS VIEW ============
const AnalyticsView: React.FC<{
  results: InterviewResult[];
  candidateStages: Record<number, PipelineStage>;
}> = ({ results, candidateStages }) => {
  // Calculate analytics
  const analytics = useMemo(() => {
    // By job
    const byJob: Record<string, { total: number; avgScore: number; hired: number }> = {};
    results.forEach((r, i) => {
      const job = r.job.title;
      if (!byJob[job]) byJob[job] = { total: 0, avgScore: 0, hired: 0 };
      byJob[job].total++;
      byJob[job].avgScore += r.evaluation?.scores?.overall || 0;
      if (candidateStages[i] === 'hired') byJob[job].hired++;
    });
    Object.keys(byJob).forEach(job => {
      byJob[job].avgScore = Math.round(byJob[job].avgScore / byJob[job].total);
    });

    // By stage
    const byStage: Record<string, number> = {};
    PIPELINE_STAGES.forEach(s => byStage[s.id] = 0);
    results.forEach((_, i) => {
      const stage = candidateStages[i] || 'new';
      byStage[stage]++;
    });

    // Score distribution
    const scoreDistribution = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
    results.forEach(r => {
      const score = r.evaluation?.scores?.overall || 0;
      const bucket = Math.min(4, Math.floor(score / 20));
      scoreDistribution[bucket]++;
    });

    // Weekly trend
    const weeklyData: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toDateString();
      const count = results.filter(r => new Date(r.date || 0).toDateString() === dayStr).length;
      weeklyData.push(count);
    }

    return { byJob, byStage, scoreDistribution, weeklyData };
  }, [results, candidateStages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pipeline Funnel */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Воронка найма</h3>
        <div className="space-y-3">
          {PIPELINE_STAGES.map(stage => {
            const count = analytics.byStage[stage.id];
            const maxCount = Math.max(...Object.values(analytics.byStage));
            const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={stage.id} className="flex items-center gap-3">
                <span className="w-24 text-sm text-neutral-400">{stage.label}</span>
                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stage.color} flex items-center justify-end pr-3 transition-all`}
                    style={{ width: `${Math.max(width, 10)}%` }}
                  >
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Distribution */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Распределение баллов</h3>
        <div className="flex items-end gap-2 h-40">
          {['0-20', '21-40', '41-60', '61-80', '81-100'].map((label, i) => {
            const count = analytics.scoreDistribution[i];
            const maxCount = Math.max(...analytics.scoreDistribution);
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const colors = ['from-rose-500', 'from-orange-500', 'from-amber-500', 'from-emerald-500', 'from-green-500'];
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                  <div 
                    className={`w-full bg-gradient-to-t ${colors[i]} to-transparent rounded-t-lg transition-all`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500">{label}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* By Job */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
        <h3 className="text-lg font-semibold mb-4">По вакансиям</h3>
        <div className="space-y-3">
          {Object.entries(analytics.byJob).map(([job, data]) => (
            <div key={job} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
              <div>
                <p className="font-medium">{job}</p>
                <p className="text-xs text-neutral-500">{data.total} кандидатов</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getScoreColor(data.avgScore)}`}>{data.avgScore}%</p>
                <p className="text-xs text-emerald-400">{data.hired} нанято</p>
              </div>
            </div>
          ))}
          {Object.keys(analytics.byJob).length === 0 && (
            <p className="text-neutral-500 text-sm text-center py-4">Нет данных</p>
          )}
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Интервью за неделю</h3>
        <div className="flex items-end gap-2 h-40">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => {
            const count = analytics.weeklyData[i];
            const maxCount = Math.max(...analytics.weeklyData);
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                  <div 
                    className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500">{day}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============ CANDIDATE DETAIL MODAL ============
const CandidateDetailModal: React.FC<{
  candidate: InterviewResult;
  index: number;
  stage: PipelineStage;
  note: string;
  onClose: () => void;
  onMove: (stage: PipelineStage) => void;
  onUpdateNote: (note: string) => void;
  onViewFull: () => void;
  onHire: () => void;
}> = ({ candidate, index, stage, note, onClose, onMove, onUpdateNote, onViewFull, onHire }) => {
  const [localNote, setLocalNote] = useState(note);
  const score = candidate.evaluation?.scores?.overall || 0;
  const stageInfo = PIPELINE_STAGES.find(s => s.id === stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-white/10 p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
              {candidate.application.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{candidate.application.name}</h2>
              <p className="text-neutral-400">{candidate.job.title}</p>
              {candidate.level && (
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${levelLabels[candidate.level].color}`}>
                  {levelLabels[candidate.level].label}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
            <XMarkIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] text-center">
              <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</p>
              <p className="text-xs text-neutral-500 mt-1">Общий балл</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] text-center">
              <p className="text-2xl font-bold text-blue-400">{candidate.evaluation?.scores?.comms || 0}</p>
              <p className="text-xs text-neutral-500 mt-1">Коммуникация</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] text-center">
              <p className="text-2xl font-bold text-purple-400">{candidate.evaluation?.scores?.reasoning || 0}</p>
              <p className="text-xs text-neutral-500 mt-1">Логика</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] text-center">
              <p className="text-2xl font-bold text-amber-400">{candidate.evaluation?.scores?.domain || 0}</p>
              <p className="text-xs text-neutral-500 mt-1">Домен</p>
            </div>
          </div>

          {/* Verdict & Stage */}
          <div className="flex items-center gap-4">
            {candidate.evaluation?.finalVerdict && (
              <div className={`flex-1 p-4 rounded-xl border ${getVerdictStyle(candidate.evaluation.finalVerdict)}`}>
                <p className="text-xs opacity-70 mb-1">AI Вердикт</p>
                <p className="text-lg font-bold">{candidate.evaluation.finalVerdict}</p>
              </div>
            )}
            <div className={`flex-1 p-4 rounded-xl bg-gradient-to-r ${stageInfo?.color}`}>
              <p className="text-xs text-white/70 mb-1">Текущий этап</p>
              <select
                value={stage}
                onChange={(e) => onMove(e.target.value as PipelineStage)}
                className="text-lg font-bold bg-transparent text-white border-0 cursor-pointer w-full"
              >
                {PIPELINE_STAGES.map(s => (
                  <option key={s.id} value={s.id} className="text-black">{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-4 rounded-xl bg-white/[0.03] space-y-3">
            <h3 className="font-semibold text-sm text-neutral-400">Контакты</h3>
            <div className="flex flex-wrap gap-3">
              {candidate.application.email && (
                <a 
                  href={`mailto:${candidate.application.email}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-all"
                >
                  <MailIcon /> {candidate.application.email}
                </a>
              )}
              {candidate.application.phone && (
                <a 
                  href={`tel:${candidate.application.phone}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-all"
                >
                  <PhoneIcon /> {candidate.application.phone}
                </a>
              )}
              {candidate.application.linkedInUrl && (
                <a 
                  href={candidate.application.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-all"
                >
                  <LinkedInIcon /> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Summary */}
          {candidate.evaluation?.summary && (
            <div className="p-4 rounded-xl bg-white/[0.03]">
              <h3 className="font-semibold text-sm text-neutral-400 mb-2">AI Резюме</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{candidate.evaluation.summary}</p>
            </div>
          )}

          {/* Anti-cheat */}
          {candidate.antiCheatReport && (
            <div className={`p-4 rounded-xl ${candidate.antiCheatReport.riskScore > 50 ? 'bg-rose-500/10 border border-rose-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Anti-Cheat</h3>
                <span className={`text-lg font-bold ${candidate.antiCheatReport.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {candidate.antiCheatReport.riskScore}% риск
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="p-4 rounded-xl bg-white/[0.03]">
            <h3 className="font-semibold text-sm text-neutral-400 mb-2">Заметки</h3>
            <textarea
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              onBlur={() => onUpdateNote(localNote)}
              placeholder="Добавьте заметку о кандидате..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-900 border-t border-white/10 p-4 flex gap-3">
          <button
            onClick={onViewFull}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <EyeIcon /> Полный отчёт
          </button>
          <button
            onClick={onHire}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <CheckIcon /> Нанять
          </button>
        </div>
      </div>
    </div>
  );
};

export default HirerDashboardPage;
