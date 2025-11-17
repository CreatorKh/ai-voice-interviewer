import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TEXT_MODEL_ID } from './config/models';
import { generateFinalEvaluation } from './evaluation/evaluator';
import { PipelineState } from './services/interviewPipeline/types';

import { AppRoute, Job, InterviewResult, TranscriptEntry, Evaluation, ApplicationData, Contract } from './types';
import { MOCK_JOBS, EVALUATION_PROMPT_TEMPLATE } from './constants';

import { AuthProvider, useAuth } from './components/AuthContext';
import Shell from './components/Shell';
import ExplorePage from './components/ExplorePage';
import JobPage from './components/JobPage';
import ApplyPage from './components/ApplyPage';
import DeviceCheckPage from './components/DeviceCheckPage';
import InterviewScreen from './components/InterviewScreen';
import InterviewResultPage from './components/InterviewResultPage';
import CandidateDashboardPage from './components/CandidateDashboardPage';
import HirerDashboardPage from './components/HirerDashboardPage';
import OnboardingModal from './components/onboarding/OnboardingModal';
import LoginModal from './components/LoginModal';
import LoggedInLayout from './components/LoggedInLayout';
import ProfilePage from './components/ProfilePage';
import DomainExpertPage from './components/DomainExpertPage';
import HomePage from './components/HomePage';
import ReferralsPage from './components/ReferralsPage';
import EarningsPage from './components/EarningsPage';
import SearchModal from './components/SearchModal';

const PublicContent: React.FC<{
  route: AppRoute;
  setRoute: (r: AppRoute) => void;
  jobs: Job[];
  currentJob: Job | null;
  interviewResults: InterviewResult[];
  isEvaluating: boolean;
  handleInterviewComplete: (job: Job, transcript: TranscriptEntry[], recordingUrl: string, applicationData: ApplicationData) => void;
  handleApplicationSubmit: (job: Job, transcript: TranscriptEntry[], recordingUrl: string, applicationData: ApplicationData, pipelineState?: PipelineState) => Promise<void>;
  contracts: Contract[];
  handleHireCandidate: (resultIndex: number, hourlyRate: number) => void;
  handleFundEscrow: (contractId: number, amount: number) => void;
  handleReleasePayment: (contractId: number) => void;
}> = ({ route, setRoute, jobs, currentJob, interviewResults, isEvaluating, handleInterviewComplete, handleApplicationSubmit, contracts, handleHireCandidate, handleFundEscrow, handleReleasePayment }) => {

  const renderContent = () => {
    switch (route.name) {
      case 'explore':
        return <ExplorePage jobs={jobs} setRoute={setRoute} />;
      case 'job':
        return currentJob ? <JobPage job={currentJob} setRoute={setRoute} /> : <ExplorePage jobs={jobs} setRoute={setRoute} />;
      case 'apply':
        return currentJob ? <ApplyPage job={currentJob} setRoute={setRoute} /> : <ExplorePage jobs={jobs} setRoute={setRoute} />;
      case 'prep':
        return currentJob ? <DeviceCheckPage job={currentJob} setRoute={setRoute} applicationData={route.applicationData} /> : <ExplorePage jobs={jobs} setRoute={setRoute} />;
      case 'interviewLive':
        return currentJob ? <InterviewScreen job={currentJob} onEnd={(transcript, url, pipelineState) => handleInterviewComplete(currentJob, transcript, url, route.applicationData, pipelineState)} applicationData={route.applicationData} /> : <ExplorePage jobs={jobs} setRoute={setRoute} />;
      case 'domainExpert':
          const jobForExpert = jobs.find(j => j.id === route.jobId);
          if (!jobForExpert) return <ExplorePage jobs={jobs} setRoute={setRoute} />;
          return <DomainExpertPage
            job={jobForExpert}
            applicationData={route.applicationData}
            setRoute={setRoute}
            onComplete={(expertData) => {
              const finalApplicationData = { ...route.applicationData, ...expertData };
              handleApplicationSubmit(jobForExpert, route.transcript, route.recordingUrl, finalApplicationData, route.pipelineState);
            }}
          />;
      case 'interviewResult':
        const result = interviewResults[route.resultIndex];
        const isLoading = isEvaluating || (result && result.evaluation === null);
        return <InterviewResultPage result={result} isLoading={isLoading} setRoute={setRoute} />;
      case 'candidateDashboard': // Should be in logged in view, but keeping for now
        return <CandidateDashboardPage results={interviewResults} contracts={contracts} setRoute={setRoute} />;
      case 'hirerDashboard': // Should be in logged in view, but keeping for now
        return <HirerDashboardPage results={interviewResults} contracts={contracts} setRoute={setRoute} onHire={handleHireCandidate} onFund={handleFundEscrow} onRelease={handleReleasePayment} />;
      default:
        return <ExplorePage jobs={jobs} setRoute={setRoute} />;
    }
  };

  return (
    <div className="min-h-dvh">
      <Shell setRoute={setRoute} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {renderContent()}
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs opacity-60">
        © {new Date().getFullYear()} — AI Interview Platform Demo
      </footer>
    </div>
  );
};


const AppContent: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>({ name: 'explore' });
  const [interviewResults, setInterviewResults] = useState<InterviewResult[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const { user, isOnboardingOpen, closeOnboarding, isLoginChoiceOpen, closeLoginChoice } = useAuth();

  useEffect(() => {
    if (user && route.name === 'explore') {
      setRoute({ name: 'home' });
    }
  }, [user, route.name]);

  const jobs = useMemo(() => MOCK_JOBS, []);

  const currentJob = useMemo(() => {
    if (route.name === 'job' || route.name === 'apply' || route.name === 'prep' || route.name === 'interviewLive') {
      const jobId = 'jobId' in route ? route.jobId : ('id' in route ? route.id : null);
      return jobs.find(j => j.id === jobId) || null;
    }
    return null;
  }, [route, jobs]);
  
  // Convert FinalEvaluation to legacy Evaluation format for compatibility
  const convertToLegacyEvaluation = (finalEval: any): Evaluation => {
    const avgScore = finalEval.turnEvaluations.length > 0
      ? Math.round(finalEval.turnEvaluations.reduce((sum: number, t: any) => sum + t.score, 0) / finalEval.turnEvaluations.length)
      : finalEval.overallScore;

    const allStrengths = finalEval.turnEvaluations.flatMap((t: any) => t.strengths);
    const allWeaknesses = finalEval.turnEvaluations.flatMap((t: any) => t.weaknesses);

    // Calculate domain score from skills
    const domainScore = finalEval.skills.length > 0
      ? Math.round(finalEval.skills.reduce((sum: number, s: any) => sum + s.score, 0) / finalEval.skills.length)
      : avgScore;

    return {
      shortSummary: finalEval.summaryForRecruiter.split('.')[0] || 'Interview completed.',
      summary: finalEval.summaryForRecruiter,
      strengths: [...new Set(allStrengths)].slice(0, 5),
      areasForImprovement: [...new Set(allWeaknesses)].slice(0, 3),
      detailedFeedback: finalEval.summaryForRecruiter + 
        (finalEval.antiCheat.overallRisk !== 'low' 
          ? `\n\nAnti-cheat risk: ${finalEval.antiCheat.overallRisk}. ${finalEval.antiCheat.commentForRecruiter}`
          : ''),
      scores: {
        comms: avgScore, // Communication score
        reasoning: avgScore, // Problem solving
        domain: domainScore, // Technical skills
        overall: finalEval.overallScore,
      },
    };
  };

  const handleApplicationSubmit = useCallback(async (job: Job, transcript: TranscriptEntry[], recordingUrl: string, applicationData: ApplicationData, pipelineState?: PipelineState) => {
    setIsEvaluating(true);
    const result: InterviewResult = {
      job,
      date: new Date().toISOString(),
      transcript,
      recordingUrl,
      evaluation: null,
      application: applicationData,
    };
    
    const newResultIndex = interviewResults.length;
    setInterviewResults(prev => [...prev, result]);
    
    setRoute({ name: 'interviewResult', resultIndex: newResultIndex });

    try {
      // Use new powerful evaluation with pipeline state if available
      let evaluation: Evaluation;
      
      // Use generateFinalEvaluation (single LLM call, with pipeline state if available)
      const finalEvaluation = await generateFinalEvaluation(
        transcript,
        recordingUrl,
        job,
        applicationData,
        pipelineState // Pass pipeline state for better evaluation
      );
      
      // Convert to legacy format for compatibility with existing UI
      evaluation = convertToLegacyEvaluation(finalEvaluation);
      
      setInterviewResults(prev => {
        const updated = [...prev];
        if(updated[newResultIndex]) {
          updated[newResultIndex] = { ...updated[newResultIndex], evaluation };
        }
        return updated;
      });
    } catch (error) {
      console.error('Error generating evaluation:', error);
      // Set a fallback evaluation
      const fallbackEvaluation: Evaluation = {
        shortSummary: 'Evaluation unavailable',
        summary: 'An error occurred while generating the evaluation. Please review the transcript manually.',
        strengths: [],
        areasForImprovement: [],
        detailedFeedback: 'Evaluation generation failed.',
        scores: {
          comms: 0,
          reasoning: 0,
          domain: 0,
          overall: 0,
        },
      };
      setInterviewResults(prev => {
        const updated = [...prev];
        if(updated[newResultIndex]) {
          updated[newResultIndex] = { ...updated[newResultIndex], evaluation: fallbackEvaluation };
        }
        return updated;
      });
    } finally {
      setIsEvaluating(false);
    }
  }, [interviewResults]);

  const handleInterviewComplete = useCallback((job: Job, transcript: TranscriptEntry[], recordingUrl: string, applicationData: ApplicationData, pipelineState?: PipelineState) => {
    setRoute({
      name: 'domainExpert',
      jobId: job.id,
      applicationData,
      transcript,
      recordingUrl,
      pipelineState, // Pass pipeline state to domain expert page
    });
  }, []);

  const handleHireCandidate = useCallback((resultIndex: number, hourlyRate: number) => {
    if (contracts.some(c => c.resultIndex === resultIndex)) return;
    const newContract: Contract = {
      id: resultIndex,
      resultIndex,
      hourlyRate,
      hoursLogged: 0,
      escrowAmount: 0,
      status: 'Awaiting Funding',
    };
    setContracts(prev => [...prev, newContract]);
  }, [contracts]);

  const handleFundEscrow = useCallback((contractId: number, amount: number) => {
    setContracts(prev => prev.map(c => 
      c.id === contractId && c.status === 'Awaiting Funding'
        ? { ...c, escrowAmount: c.escrowAmount + amount, status: 'Active', hoursLogged: 12.5 }
        : c
    ));
  }, []);
  
  const handleReleasePayment = useCallback((contractId: number) => {
    setContracts(prev => prev.map(c => 
      c.id === contractId && c.status === 'Active'
        ? { ...c, escrowAmount: 0, hoursLogged: 0, status: 'Completed' }
        : c
    ));
  }, []);

  const renderLoggedInContent = () => {
    switch (route.name) {
      case 'home':
        return <HomePage setRoute={setRoute} />;
      case 'referrals':
        return <ReferralsPage setRoute={setRoute} />;
      case 'earnings':
        return <EarningsPage setRoute={setRoute} />;
      case 'explore':
        return <ExplorePage jobs={jobs} setRoute={setRoute} />;
      case 'profile':
        return <ProfilePage />;
      case 'job':
        return currentJob ? <JobPage job={currentJob} setRoute={setRoute} /> : <HomePage setRoute={setRoute} />;
      case 'apply':
        return currentJob ? <ApplyPage job={currentJob} setRoute={setRoute} /> : <HomePage setRoute={setRoute} />;
       case 'prep':
        return currentJob ? <DeviceCheckPage job={currentJob} setRoute={setRoute} applicationData={route.applicationData} /> : <HomePage setRoute={setRoute} />;
      case 'interviewLive':
        return currentJob ? <InterviewScreen job={currentJob} onEnd={(transcript, url) => handleInterviewComplete(currentJob, transcript, url, route.applicationData)} applicationData={route.applicationData} /> : <HomePage setRoute={setRoute} />;
      case 'domainExpert':
          const jobForExpert = jobs.find(j => j.id === route.jobId);
          if (!jobForExpert) return <HomePage setRoute={setRoute} />;
          return <DomainExpertPage
            job={jobForExpert}
            applicationData={route.applicationData}
            setRoute={setRoute}
            onComplete={(expertData) => {
              const finalApplicationData = { ...route.applicationData, ...expertData };
              handleApplicationSubmit(jobForExpert, route.transcript, route.recordingUrl, finalApplicationData, route.pipelineState);
            }}
          />;
       case 'interviewResult':
         const result = interviewResults[route.resultIndex];
         const isLoading = isEvaluating || (result && result.evaluation === null);
         return <InterviewResultPage result={result} isLoading={isLoading} setRoute={setRoute} />;
      default:
        return <HomePage setRoute={setRoute} />;
    }
  };

  return (
    <>
      {user ? (
        <LoggedInLayout setRoute={setRoute} openSearchModal={() => setIsSearchModalOpen(true)}>
            {renderLoggedInContent()}
        </LoggedInLayout>
      ) : (
        <PublicContent
          route={route}
          setRoute={setRoute}
          jobs={jobs}
          currentJob={currentJob}
          interviewResults={interviewResults}
          isEvaluating={isEvaluating}
          handleInterviewComplete={handleInterviewComplete}
          handleApplicationSubmit={handleApplicationSubmit}
          contracts={contracts}
          handleHireCandidate={handleHireCandidate}
          handleFundEscrow={handleFundEscrow}
          handleReleasePayment={handleReleasePayment}
        />
      )}
      <LoginModal isOpen={isLoginChoiceOpen} onClose={closeLoginChoice} />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={closeOnboarding} />
      <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        jobs={jobs}
        setRoute={setRoute}
      />
    </>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;