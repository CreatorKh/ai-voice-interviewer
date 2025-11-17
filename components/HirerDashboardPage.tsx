import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TEXT_MODEL_ID } from '../config/models';
import { MOCK_CANDIDATES } from '../constants';
import { CandidateProfile, AppRoute, InterviewResult, Contract } from '../types';
import Button from './Button';
import Skeleton from './Skeleton';
import Badge from './Badge';
import LinkedInIcon from './icons/LinkedInIcon';
import GithubIcon from './icons/GithubIcon';
import GlobeIcon from './icons/GlobeIcon';

interface HirerDashboardPageProps {
  results: InterviewResult[];
  contracts: Contract[];
  setRoute: (r: AppRoute) => void;
  onHire: (resultIndex: number, hourlyRate: number) => void;
  onFund: (contractId: number, amount: number) => void;
  onRelease: (contractId: number) => void;
}

interface DisplayCandidate extends CandidateProfile {
  name: string;
  evaluation: InterviewResult['evaluation'];
  application: InterviewResult['application'];
}

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;

const CandidateCard: React.FC<{ candidate: DisplayCandidate; onViewSummary: () => void; onHire: () => void; isMock: boolean; isHired: boolean; }> = ({ candidate, onViewSummary, onHire, isMock, isHired }) => {
  const { application, evaluation } = candidate;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3 flex flex-col h-full">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{application.name}</h3>
          <p className="text-sm text-cyan-400">{candidate.role}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <p className="text-2xl font-bold text-green-400">{evaluation?.scores.overall || candidate.match}%</p>
          <p className="text-xs text-neutral-400">Match</p>
        </div>
      </div>
      
      <p className="text-sm text-neutral-300 flex-grow">{evaluation?.shortSummary || "A promising candidate with a strong background."}</p>

      <div className="flex flex-wrap gap-2">
        {(candidate.skills).slice(0, 3).map(skill => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>

       <div className="flex items-center gap-3 pt-2">
          {application.linkedInUrl && <a href={application.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white" title="LinkedIn Profile"><LinkedInIcon /></a>}
          {application.githubUrl && <a href={application.githubUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white" title="GitHub Profile"><GithubIcon /></a>}
          {application.portfolioUrl && <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white" title="Portfolio Website"><GlobeIcon /></a>}
       </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-auto">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onViewSummary}
          disabled={isMock}
        >
          {isMock ? "Summary (Mock)" : "View Full Details"}
        </Button>
        <Button 
          className="w-full"
          onClick={onHire}
          disabled={isMock || isHired}
        >
          {isHired ? "Hired" : "Hire Candidate"}
        </Button>
      </div>
    </div>
  );
};

const HirerDashboardPage: React.FC<HirerDashboardPageProps> = ({ results, contracts, setRoute, onHire, onFund, onRelease }) => {
  const [query, setQuery] = useState("antifraud specialist with KYC experience");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filteredIds, setFilteredIds] = useState<number[] | null>(null);

  const hiredResultIndices = useMemo(() => new Set(contracts.map(c => c.resultIndex)), [contracts]);

  const activeContracts = useMemo(() => {
    return contracts.map(contract => {
        const result = results[contract.resultIndex];
        if (!result) return null;
        return { ...contract, candidateName: result.application.name, jobTitle: result.job.title };
    }).filter(c => c && c.status !== 'Completed');
  }, [contracts, results]);

  const combinedCandidates = useMemo(() => {
    const userCandidates: DisplayCandidate[] = results.map((result, index) => ({
      id: 1000 + index,
      name: result.application.name,
      role: result.job.title,
      match: result.evaluation?.scores?.overall || 0,
      skills: result.evaluation?.strengths || result.application.parsedSkills || ['Evaluation pending...'],
      interviewResultId: index,
      evaluation: result.evaluation,
      application: result.application,
    }));
    
    const mockDisplayCandidates: DisplayCandidate[] = MOCK_CANDIDATES.map(c => ({
      ...c,
      name: c.name,
      evaluation: null,
      application: { name: c.name, email: 'mock@example.com', language: 'English' }
    }));

    return [...userCandidates, ...mockDisplayCandidates];
  }, [results]);

  const handleSmartSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
        setFilteredIds(null);
        return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
        const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
        const model = genAI.getGenerativeModel({ model: TEXT_MODEL_ID });
        
        const candidatesForAI = combinedCandidates.map(c => ({
            id: c.id,
            role: c.role,
            skills: c.skills,
            summary: c.evaluation?.summary || c.application.profileSummary || "No summary available."
        }));

        const prompt = `You are an AI hiring assistant. Always respond with valid JSON only, no additional text.

Your task is to filter a list of candidates based on a user's query.
The user's query is: "${searchQuery}"
Here is the list of candidates as a JSON array:
${JSON.stringify(candidatesForAI)}
Analyze the query and the candidate data (especially their role, skills, and interview summary).
Return a JSON object containing a single key "matchingIds", which is an array of the candidate IDs that best match the query, sorted from most to least relevant. Only include IDs from the provided list.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().trim() || '{"matchingIds": []}';
        
        // Try to extract JSON from response (in case there's extra text)
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        const finalJson = jsonMatch ? jsonMatch[0] : jsonText;
        
        const parsedResult = JSON.parse(finalJson);
        setFilteredIds(parsedResult.matchingIds || []);

    } catch (e) {
        console.error("Smart search failed:", e);
        setSearchError("AI search failed. Please try again.");
    } finally {
        setIsSearching(false);
    }
  }, [combinedCandidates]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleSmartSearch(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query, handleSmartSearch]);

  const filteredCandidates = useMemo(() => {
    if (filteredIds === null) {
        return combinedCandidates;
    }
    const idMap = new Map(combinedCandidates.map(c => [c.id, c]));
    return filteredIds.map(id => idMap.get(id)).filter(Boolean) as DisplayCandidate[];
  }, [filteredIds, combinedCandidates]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-3xl font-bold">Hirer Dashboard</h1>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <label htmlFor="smart-search" className="text-sm font-semibold opacity-80">Find best-matching candidates</label>
        <div className="mt-2 relative">
          <input 
            id="smart-search"
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="e.g., antifraud specialist with KYC experience"
            className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-3 pl-10 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-cyan-400/50"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <SearchIcon />
          </div>
        </div>
        {searchError && <p className="text-red-400 text-xs mt-2">{searchError}</p>}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Active Contracts</h2>
        {activeContracts.length > 0 ? (
           <div className="space-y-4">
              {activeContracts.map(contract => contract && (
                 <div key={contract.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-center">
                    <div>
                        <p className="font-semibold">{contract.candidateName}</p>
                        <p className="text-sm text-neutral-400">{contract.jobTitle} - ${contract.hourlyRate}/hr</p>
                        <div className="mt-2 text-xs flex flex-wrap gap-x-4 gap-y-1">
                            <span>Status: <span className="font-medium text-cyan-400">{contract.status}</span></span>
                            <span>Hours Logged: <span className="font-medium text-white">{contract.hoursLogged.toFixed(2)}</span></span>
                            <span>In Escrow: <span className="font-medium text-green-400">${contract.escrowAmount.toFixed(2)}</span></span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        {contract.status === 'Awaiting Funding' && (
                            <Button onClick={() => onFund(contract.id, contract.hourlyRate * 40)}>Fund Escrow (40h)</Button>
                        )}
                        {contract.status === 'Active' && (
                            <Button onClick={() => onRelease(contract.id)}>Release Payment</Button>
                        )}
                        <Button variant="outline">View Contract</Button>
                    </div>
                 </div>
              ))}
           </div>
        ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-neutral-400">
                No active contracts. Hire a candidate to get started.
            </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Top Candidates {query && `for "${query}"`}</h2>
        {isSearching ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-64"/>)}
          </div>
        ) : filteredCandidates.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.map(c => (
              <CandidateCard 
                key={c.id} 
                candidate={c} 
                onViewSummary={() => setRoute({ name: 'interviewResult', resultIndex: c.interviewResultId })}
                onHire={() => {
                  const result = results.find((_, i) => i === c.interviewResultId);
                  const jobRate = result?.job.rate_max || 100;
                  onHire(c.interviewResultId, jobRate);
                }}
                isMock={c.id < 1000}
                isHired={hiredResultIndices.has(c.interviewResultId)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-neutral-400">
            No candidates found for this search.
          </div>
        )}
      </section>
    </div>
  );
};

export default HirerDashboardPage;
