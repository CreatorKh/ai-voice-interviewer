import React, { useMemo } from 'react';
import { InterviewResult, AppRoute, Contract } from '../types';
import Button from './Button';

interface CandidateDashboardPageProps {
  results: InterviewResult[];
  contracts: Contract[];
  setRoute: (r: AppRoute) => void;
}

const getStatusStyles = (status: Contract['status']) => {
  switch (status) {
    case 'Awaiting Funding': return { text: 'Awaiting Funding', color: 'text-yellow-400' };
    case 'Active': return { text: 'Active - In Progress', color: 'text-green-400' };
    case 'Completed': return { text: 'Payments Complete', color: 'text-neutral-400' };
    default: return { text: status, color: 'text-white' };
  }
}

const CandidateDashboardPage: React.FC<CandidateDashboardPageProps> = ({ results, contracts, setRoute }) => {
  const contractsMap = useMemo(() => new Map(contracts.map(c => [c.resultIndex, c])), [contracts]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Applications</h1>
      {results.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-neutral-400">You haven't completed any interviews yet.</p>
          <Button onClick={() => setRoute({ name: 'explore' })} className="mt-4">Explore Open Roles</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => {
            const contract = contractsMap.get(index);
            const statusInfo = contract ? getStatusStyles(contract.status) : null;
            return (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{result.job.title}</h2>
                  <p className="text-sm text-neutral-400">Interviewed on: {new Date(result.date).toLocaleDateString()}</p>
                  {contract && statusInfo && (
                      <div className="mt-2 text-xs space-y-1 border-t border-white/10 pt-2">
                          <p>Contract Status: <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</span></p>
                          <p>Hourly Rate: <span className="font-semibold text-white">${contract.hourlyRate.toFixed(2)}</span></p>
                          {contract.status === 'Active' && <p>Amount in Escrow: <span className="font-semibold text-green-400">${contract.escrowAmount.toFixed(2)}</span></p>}
                      </div>
                  )}
                </div>
                <Button onClick={() => setRoute({ name: 'interviewResult', resultIndex: index })}>View Results</Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateDashboardPage;