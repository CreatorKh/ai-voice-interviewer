import React, { useMemo } from 'react';
import { InterviewResult, AppRoute, Contract } from '../types';
import Button from './Button';

interface CandidateDashboardPageProps {
  results: InterviewResult[];
  contracts: Contract[];
  setRoute: (r: AppRoute) => void;
}

// Icons
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-2.927 0" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ArrowTrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>;
const LightBulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>;

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

const getVerdictInfo = (verdict?: string) => {
  switch (verdict) {
    case 'Hire': return { icon: <CheckCircleIcon />, color: 'text-green-400 bg-green-500/10 border-green-500/30', label: 'Рекомендован' };
    case 'Maybe': return { icon: <ClockIcon />, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', label: 'На рассмотрении' };
    case 'No Hire': return { icon: <XCircleIcon />, color: 'text-red-400 bg-red-500/10 border-red-500/30', label: 'Не рекомендован' };
    default: return { icon: <ClockIcon />, color: 'text-neutral-400 bg-neutral-500/10 border-neutral-500/30', label: 'Ожидание' };
  }
};

const CandidateDashboardPage: React.FC<CandidateDashboardPageProps> = ({ results, contracts, setRoute }) => {
  const contractsMap = useMemo(() => new Map(contracts.map(c => [c.resultIndex, c])), [contracts]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = results.length;
    const avgScore = total > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.evaluation?.scores?.overall || 0), 0) / total)
      : 0;
    const bestScore = total > 0 
      ? Math.max(...results.map(r => r.evaluation?.scores?.overall || 0))
      : 0;
    const hireCount = results.filter(r => r.evaluation?.finalVerdict === 'Hire').length;
    const activeContracts = contracts.filter(c => c.status === 'Active').length;
    
    // Skills analysis
    const allStrengths = results.flatMap(r => r.evaluation?.strengths || []);
    const allWeaknesses = results.flatMap(r => r.evaluation?.areasForImprovement || []);
    
    return { total, avgScore, bestScore, hireCount, activeContracts, allStrengths, allWeaknesses };
  }, [results, contracts]);

  // Get improvement tips based on scores
  const improvementTips = useMemo(() => {
    const tips: string[] = [];
    const avgComms = results.reduce((sum, r) => sum + (r.evaluation?.scores?.comms || 0), 0) / Math.max(results.length, 1);
    const avgReasoning = results.reduce((sum, r) => sum + (r.evaluation?.scores?.reasoning || 0), 0) / Math.max(results.length, 1);
    const avgDomain = results.reduce((sum, r) => sum + (r.evaluation?.scores?.domain || 0), 0) / Math.max(results.length, 1);
    
    if (avgComms < 70) tips.push('Поработайте над структурой ответов — используйте метод STAR');
    if (avgReasoning < 70) tips.push('Практикуйте решение задач вслух, объясняя ход мыслей');
    if (avgDomain < 70) tips.push('Углубите знания в предметной области через практику');
    if (tips.length === 0) tips.push('Отличные результаты! Продолжайте в том же духе');
    
    return tips;
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Мои интервью</h1>
          <p className="text-sm text-neutral-400 mt-1">Отслеживайте прогресс и улучшайте навыки</p>
        </div>
        <Button onClick={() => setRoute({ name: 'explore' })} className="md:w-auto">
          <BriefcaseIcon /> Найти вакансии
        </Button>
      </div>

      {results.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <BriefcaseIcon />
          </div>
          <h2 className="text-xl font-semibold mb-2">Пока нет интервью</h2>
          <p className="text-neutral-400 mb-6 max-w-md mx-auto">
            Пройдите AI-интервью, чтобы получить оценку ваших навыков и рекомендации по улучшению
          </p>
          <Button onClick={() => setRoute({ name: 'explore' })}>
            Начать первое интервью
          </Button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <BriefcaseIcon />
                <span className="text-xs">Всего интервью</span>
              </div>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <ChartIcon />
                <span className="text-xs">Средний балл</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}%</p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <TrophyIcon />
                <span className="text-xs">Лучший результат</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(stats.bestScore)}`}>{stats.bestScore}%</p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircleIcon />
                <span className="text-xs">Рекомендовано</span>
              </div>
              <p className="text-3xl font-bold text-green-400">{stats.hireCount}</p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <ArrowTrendingUpIcon />
                <span className="text-xs">Активные контракты</span>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{stats.activeContracts}</p>
            </div>
          </div>

          {/* Skills Progress */}
          {results.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Score Breakdown */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ChartIcon /> Анализ навыков
                </h3>
                <div className="space-y-4">
                  {[
                    { 
                      label: 'Коммуникация', 
                      value: Math.round(results.reduce((sum, r) => sum + (r.evaluation?.scores?.comms || 0), 0) / results.length),
                      desc: 'Ясность, структура, убедительность'
                    },
                    { 
                      label: 'Логика и решение задач', 
                      value: Math.round(results.reduce((sum, r) => sum + (r.evaluation?.scores?.reasoning || 0), 0) / results.length),
                      desc: 'Аналитическое мышление, подход'
                    },
                    { 
                      label: 'Предметные знания', 
                      value: Math.round(results.reduce((sum, r) => sum + (r.evaluation?.scores?.domain || 0), 0) / results.length),
                      desc: 'Глубина экспертизы в области'
                    },
                  ].map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="text-sm font-medium">{skill.label}</span>
                          <p className="text-xs text-neutral-500">{skill.desc}</p>
                        </div>
                        <span className={`text-lg font-bold ${getScoreColor(skill.value)}`}>{skill.value}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreBg(skill.value)} rounded-full transition-all`} 
                          style={{ width: `${skill.value}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Tips */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-cyan-500/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-cyan-400">
                  <LightBulbIcon /> Рекомендации
                </h3>
                <div className="space-y-3">
                  {improvementTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03]">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-neutral-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interview History */}
          <div>
            <h3 className="font-semibold mb-4">История интервью</h3>
            <div className="space-y-3">
              {results.map((result, index) => {
                const contract = contractsMap.get(index);
                const verdictInfo = getVerdictInfo(result.evaluation?.finalVerdict);
                const score = result.evaluation?.scores?.overall || 0;
                
                return (
                  <div 
                    key={index} 
                    className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{result.job.title}</h4>
                          {result.level && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              result.level === 'junior' ? 'bg-green-500/20 text-green-400' :
                              result.level === 'middle' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {result.level.charAt(0).toUpperCase() + result.level.slice(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">
                          {result.date ? new Date(result.date).toLocaleDateString('ru-RU', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          }) : 'Дата не указана'}
                        </p>
                      </div>

                      {/* Scores */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                          {[
                            { label: 'Комм.', value: result.evaluation?.scores?.comms || 0 },
                            { label: 'Логика', value: result.evaluation?.scores?.reasoning || 0 },
                            { label: 'Домен', value: result.evaluation?.scores?.domain || 0 },
                          ].map((s, i) => (
                            <div key={i} className="text-center">
                              <p className={`text-lg font-bold ${getScoreColor(s.value)}`}>{s.value}</p>
                              <p className="text-xs text-neutral-500">{s.label}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="w-px h-10 bg-white/10" />
                        
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</p>
                          <p className="text-xs text-neutral-500">Общий</p>
                        </div>
                      </div>

                      {/* Verdict & Actions */}
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${verdictInfo.color}`}>
                          {verdictInfo.icon}
                          <span className="text-sm font-medium">{verdictInfo.label}</span>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => setRoute({ name: 'interviewResult', resultIndex: index })}
                          className="flex items-center gap-1"
                        >
                          <PlayIcon /> Детали
                        </Button>
                      </div>
                    </div>

                    {/* Contract Info */}
                    {contract && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-neutral-400">Контракт:</span>
                          <span className={`font-medium ${
                            contract.status === 'Active' ? 'text-green-400' :
                            contract.status === 'Awaiting Funding' ? 'text-yellow-400' :
                            'text-neutral-400'
                          }`}>
                            {contract.status === 'Active' ? 'Активен' : 
                             contract.status === 'Awaiting Funding' ? 'Ожидает финансирования' : 
                             'Завершён'}
                          </span>
                          <span className="text-neutral-500">•</span>
                          <span className="text-white font-medium">${contract.hourlyRate}/hr</span>
                          {contract.status === 'Active' && (
                            <>
                              <span className="text-neutral-500">•</span>
                              <span className="text-green-400">Escrow: ${contract.escrowAmount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Strengths Preview */}
                    {result.evaluation?.strengths && result.evaluation.strengths.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs text-neutral-500 mb-2">Сильные стороны:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.evaluation.strengths.slice(0, 3).map((s, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs">
                              {s.length > 40 ? s.slice(0, 40) + '...' : s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateDashboardPage;
