import React from 'react';
import { Job, AppRoute } from '../types';
import Button from './Button';
import Badge from './Badge';

interface JobPageProps {
  job: Job;
  setRoute: (r: AppRoute) => void;
}

const formatRate = (min?: number, max?: number, cur: string = "USD") => {
  const f = (v?: number) => (v == null ? "?" : Intl.NumberFormat().format(v));
  return min === max ? `${f(min)} ${cur}` : `${f(min)}–${f(max)} ${cur}`;
}

const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008h-.008v-.008Z" /></svg>;

const JobPage: React.FC<JobPageProps> = ({ job, setRoute }) => {
  return (
    <div className="grid lg:grid-cols-[1fr,360px] gap-8">
      <div className="space-y-4">
        <button onClick={() => setRoute({name: "explore"})} className="text-sm text-cyan-300 hover:underline">← Back to all jobs</button>
        <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
        <div className="text-sm text-neutral-300 flex items-center gap-2">
          <Badge>{job.contract_type}</Badge><span>•</span>
          <span className="font-medium">{formatRate(job.rate_min, job.rate_max, job.currency)}</span> / hr
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold opacity-80">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-neutral-200">{job.description}</p>
          <div className="mt-4 text-xs text-neutral-400">Hired this month: {job.hired_this_month} • Posted {job.posted_days_ago}d ago</div>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 text-sm text-green-400 mb-3">
            <ShieldCheckIcon />
            <span>Secure Escrow Payments</span>
          </div>
          <div className="grid gap-2">
            <Button onClick={() => setRoute({name: "apply", jobId: job.id})} className="w-full">Apply Now</Button>
            <Button variant="outline" onClick={() => setRoute({name: "explore"})} className="w-full">Save for later</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-sm font-semibold opacity-80">Perks</h3>
          <ul className="mt-2 text-sm text-neutral-300 list-disc pl-4 space-y-1">
            <li>Remote option</li><li>Flexible hours</li><li>Growth opportunities</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default JobPage;