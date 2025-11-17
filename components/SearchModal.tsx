import React, { useState, useEffect, useMemo } from 'react';
import { Job, AppRoute, SortKey } from '../types';
import Button from './Button';
import Badge from './Badge';
import Skeleton from './Skeleton';
import XIcon from './icons/XIcon';

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

const formatRate = (min?: number, max?: number, cur: string = "USD") => {
  const f = (v?: number) => (v == null ? "?" : Intl.NumberFormat().format(v));
  return min === max ? `${f(min)} ${cur}` : `${f(min)}–${f(max)} ${cur}`;
}

const SortTabs: React.FC<{value: SortKey; onChange: (v: SortKey) => void}> = ({ value, onChange }) => {
  const tabs: {key: SortKey; label: string}[] = [
    {key: "best", label: "Best match"},
    {key: "trending", label: "Trending"},
    {key: "newest", label: "Newest"},
    {key: "pay", label: "Most pay"},
  ];
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} className={cn("px-3 py-1.5 text-sm rounded-lg transition", value === t.key ? "bg-cyan-400 text-black font-semibold" : "hover:bg-white/10")}>{t.label}</button>
      ))}
    </div>
  );
}

const SearchBar: React.FC<{value: string; onChange: (s: string) => void}> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <input autoFocus value={value} onChange={e => onChange(e.target.value)} placeholder="Search roles, keywords…" className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-cyan-400/50"/>
    </div>
  );
}

const JobCard: React.FC<{job: Job; open: (id: number) => void}> = ({ job, open }) => {
  return (
    <button onClick={() => open(job.id)} className="text-left w-full h-full flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition shadow-sm p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <Badge>{job.contract_type}</Badge>
      </div>
      <p className="mt-2 text-sm text-neutral-300 line-clamp-3 flex-grow">{job.description}</p>
      <div className="mt-3 text-sm"><span className="font-medium">{formatRate(job.rate_min, job.rate_max, job.currency)}</span> / hr</div>
      <div className="mt-1 text-xs text-neutral-400">Hired: {job.hired_this_month} • Posted {job.posted_days_ago}d ago</div>
    </button>
  );
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  setRoute: (r: AppRoute) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, jobs, setRoute }) => {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("best");

  useEffect(() => {
    if (!isOpen) {
        // Reset state when modal is closed
        setQuery("");
        setSort("best");
        return;
    };

    const filterAndSortJobs = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          const filtered = jobs.filter(j => (j.title + " " + j.description).toLowerCase().includes(query.toLowerCase()));
          const sorters: Record<SortKey, (a: Job, b: Job) => number> = {
            pay: (a, b) => (b.rate_max ?? 0) - (a.rate_max ?? 0),
            newest: (a, b) => a.posted_days_ago - b.posted_days_ago,
            trending: (a, b) => b.hired_this_month - a.hired_this_month,
            best: (a, b) => (b.hired_this_month - a.hired_this_month) || (a.posted_days_ago - b.posted_days_ago) || ((b.rate_max ?? 0) - (a.rate_max ?? 0)),
          };
          setFilteredJobs([...filtered].sort(sorters[sort]));
          setLoading(false);
        }, 300);
      };

    const handler = setTimeout(() => filterAndSortJobs(), 300);
    return () => clearTimeout(handler);
  }, [query, sort, jobs, isOpen]);
  
  const handleJobClick = (id: number) => {
      onClose();
      setRoute({ name: "job", id });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8" onClick={onClose}>
      <div 
        className="bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-4 border-b border-white/10 flex items-center gap-4">
            <SearchBar value={query} onChange={setQuery} />
            <SortTabs value={sort} onChange={setSort} />
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white">
                <XIcon />
            </button>
        </header>
        <main className="flex-grow overflow-y-auto p-6">
            {loading ? (
                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length:6}).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                        <Skeleton className="h-5 w-2/3"/><Skeleton className="h-3 w-full"/>
                        <Skeleton className="h-3 w-5/6"/><Skeleton className="h-4 w-40 mt-2"/>
                        </div>
                    ))}
                </div>
            ) : filteredJobs.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map(j => <JobCard key={j.id} job={j} open={handleJobClick}/>)}
                </div>
            ) : (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm">
                    <p>No results for <span className="font-semibold">“{query}”</span>.</p>
                    <button className="ml-2 underline decoration-cyan-400" onClick={() => setQuery("")}>Clear search</button>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default SearchModal;
