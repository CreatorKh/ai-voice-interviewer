import React, { useState, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AppRoute, InterviewResult, Contract, ExperienceLevel } from '../types';
import Button from './Button';

interface HirerDashboardPageProps {
  results: InterviewResult[];
  contracts: Contract[];
  setRoute: (r: AppRoute) => void;
  onHire: (resultIndex: number, hourlyRate: number) => void;
  onFund: (contractId: number, amount: number) => void;
  onRelease: (contractId: number) => void;
}

// Icons
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>;
const StarIcon = ({ filled = false }) => filled ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
const LinkedInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>;
const GithubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;

const levelLabels: Record<ExperienceLevel, { label: string; color: string }> = {
  junior: { label: 'Junior', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  middle: { label: 'Middle', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  senior: { label: 'Senior', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

type ViewMode = 'cards' | 'table' | 'compare';
type SortOption = 'score' | 'date' | 'name';

const HirerDashboardPage: React.FC<HirerDashboardPageProps> = ({ results, contracts, setRoute, onHire }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [filterJob, setFilterJob] = useState<string>('all');
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Selection for comparison/bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [shortlisted, setShortlisted] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('shortlisted_candidates');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Persist shortlist
  React.useEffect(() => {
    localStorage.setItem('shortlisted_candidates', JSON.stringify([...shortlisted]));
  }, [shortlisted]);

  // Get unique jobs for filter
  const uniqueJobs = useMemo(() => {
    const jobs = new Set(results.map(r => r.job.title));
    return Array.from(jobs);
  }, [results]);

  // Filter and sort candidates
  const filteredResults = useMemo(() => {
    let filtered = results.filter(r => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = r.application.name.toLowerCase().includes(q);
        const matchJob = r.job.title.toLowerCase().includes(q);
        const matchSkills = r.application.parsedSkills?.some(s => s.toLowerCase().includes(q));
        const matchSummary = r.evaluation?.summary?.toLowerCase().includes(q);
        if (!matchName && !matchJob && !matchSkills && !matchSummary) return false;
      }
      
      // Verdict filter
      if (filterVerdict !== 'all' && r.evaluation?.finalVerdict !== filterVerdict) return false;
      
      // Job filter
      if (filterJob !== 'all' && r.job.title !== filterJob) return false;
      
      // Min score
      if ((r.evaluation?.scores?.overall || 0) < minScore) return false;
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.evaluation?.scores?.overall || 0) - (a.evaluation?.scores?.overall || 0);
        case 'date':
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case 'name':
          return a.application.name.localeCompare(b.application.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [results, searchQuery, filterVerdict, filterJob, minScore, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: results.length,
    shortlisted: shortlisted.size,
    hireRecommended: results.filter(r => r.evaluation?.finalVerdict === 'Hire').length,
    avgScore: results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.evaluation?.scores?.overall || 0), 0) / results.length)
      : 0,
  }), [results, shortlisted]);

  const toggleSelect = (index: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleShortlist = (index: number) => {
    setShortlisted(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResults.map((_, i) => results.indexOf(filteredResults[i]))));
    }
  };

  const bulkShortlist = () => {
    setShortlisted(prev => {
      const next = new Set(prev);
      selectedIds.forEach(id => next.add(id));
      return next;
    });
    setSelectedIds(new Set());
  };

  const exportCSV = () => {
    const data = filteredResults.map(r => ({
      name: r.application.name,
      email: r.application.email,
      job: r.job.title,
      level: r.level || 'N/A',
      score: r.evaluation?.scores?.overall || 0,
      comms: r.evaluation?.scores?.comms || 0,
      reasoning: r.evaluation?.scores?.reasoning || 0,
      domain: r.evaluation?.scores?.domain || 0,
      verdict: r.evaluation?.finalVerdict || 'N/A',
      risk: r.antiCheatReport?.riskScore || 0,
      date: r.date || 'N/A',
      linkedin: r.application.linkedInUrl || '',
      github: r.application.githubUrl || '',
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

  const sendBulkEmail = () => {
    const emails = [...selectedIds].map(i => results[i]?.application.email).filter(Boolean);
    if (emails.length > 0) {
      window.location.href = `mailto:${emails.join(',')}?subject=Wind AI - Interview Results`;
    }
  };

  // Comparison view
  const comparisonCandidates = useMemo(() => {
    return [...selectedIds].map(i => results[i]).filter(Boolean);
  }, [selectedIds, results]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Кандидаты</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {filteredResults.length} из {results.length} кандидатов
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-3">
          {[
            { label: 'Всего', value: stats.total, color: 'text-white' },
            { label: 'В шортлисте', value: stats.shortlisted, color: 'text-cyan-400' },
            { label: 'К найму', value: stats.hireRecommended, color: 'text-green-400' },
            { label: 'Ср. балл', value: `${stats.avgScore}%`, color: getScoreColor(stats.avgScore) },
          ].map((stat, i) => (
            <div key={i} className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10">
              <p className="text-xs text-neutral-500">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <SearchIcon />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, навыкам, вакансии..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <SearchIcon />
          </div>
        </div>

        {/* View Mode */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-lg border border-white/10">
          {[
            { id: 'cards' as ViewMode, label: 'Карточки' },
            { id: 'table' as ViewMode, label: 'Таблица' },
            { id: 'compare' as ViewMode, label: `Сравнить (${selectedIds.size})` },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              disabled={mode.id === 'compare' && selectedIds.size < 2}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === mode.id
                  ? 'bg-cyan-500 text-black font-medium'
                  : 'text-neutral-400 hover:text-white disabled:opacity-30'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
            showFilters ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <FilterIcon />
          Фильтры
        </button>

        {/* Export */}
        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white flex items-center gap-2 transition-all"
        >
          <DownloadIcon />
          CSV
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Сортировка</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-sm"
            >
              <option value="score">По баллу</option>
              <option value="date">По дате</option>
              <option value="name">По имени</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Вердикт</label>
            <select
              value={filterVerdict}
              onChange={e => setFilterVerdict(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-sm"
            >
              <option value="all">Все</option>
              <option value="Hire">Hire</option>
              <option value="Maybe">Maybe</option>
              <option value="No Hire">No Hire</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Вакансия</label>
            <select
              value={filterJob}
              onChange={e => setFilterJob(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-sm"
            >
              <option value="all">Все вакансии</option>
              {uniqueJobs.map(job => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Мин. балл: {minScore}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && viewMode !== 'compare' && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <span className="text-sm text-cyan-400 font-medium">Выбрано: {selectedIds.size}</span>
          <div className="flex-1" />
          <button onClick={bulkShortlist} className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-all flex items-center gap-1">
            <StarIcon filled /> В шортлист
          </button>
          <button onClick={sendBulkEmail} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all flex items-center gap-1">
            <MailIcon /> Email
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 rounded-lg text-neutral-400 text-sm hover:text-white transition-all">
            Отменить
          </button>
        </div>
      )}

      {/* Content */}
      {filteredResults.length === 0 ? (
        <div className="p-12 rounded-xl bg-white/[0.02] border border-white/10 text-center">
          <p className="text-neutral-400">Нет кандидатов</p>
          <p className="text-sm text-neutral-500 mt-1">Измените фильтры или дождитесь новых интервью</p>
        </div>
      ) : viewMode === 'compare' ? (
        /* Comparison View */
        <ComparisonView candidates={comparisonCandidates} />
      ) : viewMode === 'table' ? (
        /* Table View */
        <TableView 
          results={filteredResults} 
          allResults={results}
          selectedIds={selectedIds}
          shortlisted={shortlisted}
          onToggleSelect={toggleSelect}
          onToggleShortlist={toggleShortlist}
          onSelectAll={selectAll}
          onViewDetails={(i) => setRoute({ name: 'interviewResult', resultIndex: results.indexOf(filteredResults[i]) })}
        />
      ) : (
        /* Cards View */
        <CardsView
          results={filteredResults}
          allResults={results}
          selectedIds={selectedIds}
          shortlisted={shortlisted}
          onToggleSelect={toggleSelect}
          onToggleShortlist={toggleShortlist}
          onViewDetails={(i) => setRoute({ name: 'interviewResult', resultIndex: results.indexOf(filteredResults[i]) })}
          onHire={(i) => {
            const idx = results.indexOf(filteredResults[i]);
            onHire(idx, filteredResults[i].job.rate_max || 100);
          }}
        />
      )}
    </div>
  );
};

// Cards View Component
const CardsView: React.FC<{
  results: InterviewResult[];
  allResults: InterviewResult[];
  selectedIds: Set<number>;
  shortlisted: Set<number>;
  onToggleSelect: (i: number) => void;
  onToggleShortlist: (i: number) => void;
  onViewDetails: (i: number) => void;
  onHire: (i: number) => void;
}> = ({ results, allResults, selectedIds, shortlisted, onToggleSelect, onToggleShortlist, onViewDetails, onHire }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {results.map((r, i) => {
      const globalIndex = allResults.indexOf(r);
      const isSelected = selectedIds.has(globalIndex);
      const isShortlisted = shortlisted.has(globalIndex);
      const score = r.evaluation?.scores?.overall || 0;
      
      return (
        <div
          key={i}
          className={`p-5 rounded-2xl border transition-all ${
            isSelected 
              ? 'bg-cyan-500/10 border-cyan-500/50' 
              : isShortlisted 
                ? 'bg-yellow-500/5 border-yellow-500/30'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleSelect(globalIndex)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-white/30 hover:border-white/50'
                }`}
              >
                {isSelected && <CheckIcon />}
              </button>
              <div>
                <h3 className="font-semibold">{r.application.name}</h3>
                <p className="text-sm text-neutral-400">{r.job.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</p>
              {r.evaluation?.finalVerdict && (
                <span className={`text-xs px-2 py-0.5 rounded ${
                  r.evaluation.finalVerdict === 'Hire' ? 'bg-green-500/20 text-green-400' :
                  r.evaluation.finalVerdict === 'Maybe' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {r.evaluation.finalVerdict}
                </span>
              )}
            </div>
          </div>

          {/* Score Bars */}
          <div className="space-y-2 mb-4">
            {[
              { label: 'Коммуникация', value: r.evaluation?.scores?.comms || 0 },
              { label: 'Логика', value: r.evaluation?.scores?.reasoning || 0 },
              { label: 'Домен', value: r.evaluation?.scores?.domain || 0 },
            ].map((s, j) => (
              <div key={j} className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 w-24">{s.label}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${getScoreBg(s.value)} rounded-full`} style={{ width: `${s.value}%` }} />
                </div>
                <span className="text-xs text-neutral-400 w-8">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Level & Risk */}
          <div className="flex items-center gap-2 mb-4">
            {r.level && (
              <span className={`px-2 py-0.5 rounded text-xs border ${levelLabels[r.level].color}`}>
                {levelLabels[r.level].label}
              </span>
            )}
            {r.antiCheatReport && (
              <span className={`text-xs ${r.antiCheatReport.riskScore > 50 ? 'text-red-400' : 'text-green-400'}`}>
                Risk: {r.antiCheatReport.riskScore}%
              </span>
            )}
          </div>

          {/* Links */}
          <div className="flex items-center gap-2 mb-4">
            {r.application.linkedInUrl && (
              <a href={r.application.linkedInUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-neutral-400 hover:text-white transition-colors">
                <LinkedInIcon />
              </a>
            )}
            {r.application.githubUrl && (
              <a href={r.application.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-neutral-400 hover:text-white transition-colors">
                <GithubIcon />
              </a>
            )}
            <span className="text-xs text-neutral-500 ml-auto">
              {r.date ? new Date(r.date).toLocaleDateString() : ''}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onToggleShortlist(globalIndex)}
              className={`p-2 rounded-lg border transition-all ${
                isShortlisted 
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' 
                  : 'border-white/10 text-neutral-400 hover:text-yellow-400 hover:border-yellow-500/30'
              }`}
            >
              <StarIcon filled={isShortlisted} />
            </button>
            <button
              onClick={() => onViewDetails(i)}
              className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-neutral-300 hover:bg-white/5 transition-all flex items-center justify-center gap-1"
            >
              <PlayIcon /> Детали
            </button>
            <button
              onClick={() => onHire(i)}
              className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/30 transition-all"
            >
              Hire
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

// Table View Component
const TableView: React.FC<{
  results: InterviewResult[];
  allResults: InterviewResult[];
  selectedIds: Set<number>;
  shortlisted: Set<number>;
  onToggleSelect: (i: number) => void;
  onToggleShortlist: (i: number) => void;
  onSelectAll: () => void;
  onViewDetails: (i: number) => void;
}> = ({ results, allResults, selectedIds, shortlisted, onToggleSelect, onToggleShortlist, onSelectAll, onViewDetails }) => (
  <div className="rounded-xl border border-white/10 overflow-hidden">
    <table className="w-full">
      <thead className="bg-white/[0.03]">
        <tr className="text-left text-sm text-neutral-400">
          <th className="p-4 w-12">
            <button onClick={onSelectAll} className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedIds.size === results.length ? 'bg-cyan-500 border-cyan-500' : 'border-white/30'}`}>
              {selectedIds.size === results.length && <CheckIcon />}
            </button>
          </th>
          <th className="p-4">Кандидат</th>
          <th className="p-4">Вакансия</th>
          <th className="p-4 text-center">Балл</th>
          <th className="p-4 text-center">Комм.</th>
          <th className="p-4 text-center">Логика</th>
          <th className="p-4 text-center">Домен</th>
          <th className="p-4 text-center">Вердикт</th>
          <th className="p-4 text-center">Risk</th>
          <th className="p-4 w-20"></th>
        </tr>
      </thead>
      <tbody>
        {results.map((r, i) => {
          const globalIndex = allResults.indexOf(r);
          const isSelected = selectedIds.has(globalIndex);
          const isShortlisted = shortlisted.has(globalIndex);
          
          return (
            <tr key={i} className={`border-t border-white/5 hover:bg-white/[0.02] ${isSelected ? 'bg-cyan-500/5' : ''}`}>
              <td className="p-4">
                <button onClick={() => onToggleSelect(globalIndex)} className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-white/30'}`}>
                  {isSelected && <CheckIcon />}
                </button>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                    {r.application.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-1">
                      {r.application.name}
                      {isShortlisted && <StarIcon filled />}
                    </p>
                    <p className="text-xs text-neutral-500">{r.application.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="text-sm">{r.job.title}</span>
                {r.level && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${levelLabels[r.level].color}`}>{levelLabels[r.level].label}</span>}
              </td>
              <td className="p-4 text-center">
                <span className={`text-lg font-bold ${getScoreColor(r.evaluation?.scores?.overall || 0)}`}>
                  {r.evaluation?.scores?.overall || 0}
                </span>
              </td>
              <td className="p-4 text-center text-sm text-neutral-300">{r.evaluation?.scores?.comms || 0}</td>
              <td className="p-4 text-center text-sm text-neutral-300">{r.evaluation?.scores?.reasoning || 0}</td>
              <td className="p-4 text-center text-sm text-neutral-300">{r.evaluation?.scores?.domain || 0}</td>
              <td className="p-4 text-center">
                {r.evaluation?.finalVerdict && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    r.evaluation.finalVerdict === 'Hire' ? 'bg-green-500/20 text-green-400' :
                    r.evaluation.finalVerdict === 'Maybe' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {r.evaluation.finalVerdict}
                  </span>
                )}
              </td>
              <td className="p-4 text-center">
                <span className={`text-sm ${(r.antiCheatReport?.riskScore || 0) > 50 ? 'text-red-400' : 'text-green-400'}`}>
                  {r.antiCheatReport?.riskScore || 0}%
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-1">
                  <button onClick={() => onToggleShortlist(globalIndex)} className={`p-1.5 rounded ${isShortlisted ? 'text-yellow-400' : 'text-neutral-500 hover:text-yellow-400'}`}>
                    <StarIcon filled={isShortlisted} />
                  </button>
                  <button onClick={() => onViewDetails(i)} className="p-1.5 rounded text-neutral-500 hover:text-white">
                    <PlayIcon />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// Comparison View Component
const ComparisonView: React.FC<{ candidates: InterviewResult[] }> = ({ candidates }) => {
  if (candidates.length < 2) {
    return (
      <div className="p-12 rounded-xl bg-white/[0.02] border border-white/10 text-center">
        <p className="text-neutral-400">Выберите минимум 2 кандидата для сравнения</p>
      </div>
    );
  }

  const metrics = [
    { key: 'overall', label: 'Общий балл', getValue: (r: InterviewResult) => r.evaluation?.scores?.overall || 0 },
    { key: 'comms', label: 'Коммуникация', getValue: (r: InterviewResult) => r.evaluation?.scores?.comms || 0 },
    { key: 'reasoning', label: 'Логика', getValue: (r: InterviewResult) => r.evaluation?.scores?.reasoning || 0 },
    { key: 'domain', label: 'Домен', getValue: (r: InterviewResult) => r.evaluation?.scores?.domain || 0 },
    { key: 'risk', label: 'Risk Score', getValue: (r: InterviewResult) => r.antiCheatReport?.riskScore || 0, inverse: true },
  ];

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/[0.03]">
          <tr>
            <th className="p-4 text-left text-sm text-neutral-400">Метрика</th>
            {candidates.map((c, i) => (
              <th key={i} className="p-4 text-center">
                <div className="font-semibold">{c.application.name}</div>
                <div className="text-xs text-neutral-500">{c.job.title}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, i) => {
            const values = candidates.map(c => metric.getValue(c));
            const best = metric.inverse ? Math.min(...values) : Math.max(...values);
            
            return (
              <tr key={i} className="border-t border-white/5">
                <td className="p-4 text-sm text-neutral-400">{metric.label}</td>
                {candidates.map((c, j) => {
                  const value = metric.getValue(c);
                  const isBest = value === best;
                  
                  return (
                    <td key={j} className="p-4 text-center">
                      <span className={`text-lg font-bold ${
                        isBest 
                          ? (metric.inverse ? 'text-green-400' : getScoreColor(value))
                          : 'text-neutral-400'
                      }`}>
                        {value}{metric.key !== 'risk' ? '%' : '%'}
                      </span>
                      {isBest && <span className="ml-2 text-xs text-green-400">★</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr className="border-t border-white/5">
            <td className="p-4 text-sm text-neutral-400">Вердикт</td>
            {candidates.map((c, i) => (
              <td key={i} className="p-4 text-center">
                {c.evaluation?.finalVerdict && (
                  <span className={`px-3 py-1 rounded ${
                    c.evaluation.finalVerdict === 'Hire' ? 'bg-green-500/20 text-green-400' :
                    c.evaluation.finalVerdict === 'Maybe' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {c.evaluation.finalVerdict}
                  </span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default HirerDashboardPage;
