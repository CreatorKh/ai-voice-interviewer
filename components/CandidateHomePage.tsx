import React, { useState, useEffect, useMemo } from 'react';
import { AppRoute, UniversalProfile, JobMatch, Job } from '../types';
import { useAuth } from './AuthContext';

interface CandidateHomePageProps {
  setRoute: (route: AppRoute) => void;
  universalProfile: UniversalProfile | null;
  jobMatches: JobMatch[];
  jobs: Job[];
}

// Icons
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>;
const RocketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>;

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
};

const CandidateHomePage: React.FC<CandidateHomePageProps> = ({ 
  setRoute, 
  universalProfile, 
  jobMatches,
  jobs 
}) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fadeIn = (delay: number) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.6s ease-out ${delay}ms`,
  });

  // Stats
  const stats = useMemo(() => ({
    totalMatches: jobMatches.length,
    newMatches: jobMatches.filter(m => m.status === 'new').length,
    applied: jobMatches.filter(m => m.status === 'applied').length,
    interviewing: jobMatches.filter(m => m.status === 'interviewing').length,
  }), [jobMatches]);

  // If no profile yet, show the "Take Interview" CTA
  if (!universalProfile) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        {/* Hero for new candidates */}
        <div style={fadeIn(0)} className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
            <SparklesIcon />
            <SparklesIcon />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Одно интервью.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Сотни возможностей.
            </span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Пройдите одно AI-интервью и получите универсальный профиль для всех вакансий. 
            Никаких повторных собеседований — ваш профиль работает на вас.
          </p>
        </div>

        {/* How it works */}
        <div style={fadeIn(200)} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {[
            { icon: <PlayIcon />, title: '1. Пройдите интервью', desc: '15-20 минут с AI-интервьюером. Покажите свои навыки.' },
            { icon: <CheckBadgeIcon />, title: '2. Получите профиль', desc: 'AI оценит ваши компетенции и создаст универсальный профиль.' },
            { icon: <RocketIcon />, title: '3. Получайте офферы', desc: 'Работодатели видят ваш профиль. Вы выбираете предложения.' },
          ].map((step, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-left">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-400">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={fadeIn(400)}>
          <button
            onClick={() => setRoute({ name: 'universalInterview' })}
            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl text-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-3"
          >
            Начать интервью
            <ArrowRightIcon />
          </button>
          <p className="text-sm text-neutral-500 mt-4">
            Бесплатно • 15-20 минут • Результаты сразу
          </p>
        </div>

        {/* Features */}
        <div style={fadeIn(600)} className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[
            { value: '15 мин', label: 'Интервью' },
            { value: '24/7', label: 'Доступность' },
            { value: 'AI', label: 'Оценка' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Has profile - show dashboard
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div style={fadeIn(0)} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Привет, {user?.name?.split(' ')[0] || 'Кандидат'}! 👋
          </h1>
          <p className="text-neutral-400 mt-1">
            Ваш профиль активен. Компании уже ищут таких как вы.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
            <CheckBadgeIcon /> Профиль верифицирован
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={fadeIn(100)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <BriefcaseIcon />, label: 'Подходящих вакансий', value: stats.totalMatches, color: 'from-cyan-500/20 to-cyan-500/5', iconColor: 'text-cyan-400' },
          { icon: <SparklesIcon />, label: 'Новых матчей', value: stats.newMatches, color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400' },
          { icon: <ClockIcon />, label: 'Откликов', value: stats.applied, color: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400' },
          { icon: <ChartIcon />, label: 'На интервью', value: stats.interviewing, color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} border border-white/5`}>
            <div className={`${stat.iconColor} mb-2`}>{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Your Profile Summary */}
      <div style={fadeIn(200)} className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">Ваш профиль</h2>
          <button className="text-sm text-cyan-400 hover:underline">Редактировать</button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Scores */}
          <div className="space-y-3">
            <h3 className="text-sm text-neutral-400 mb-2">Оценки AI</h3>
            {[
              { label: 'Коммуникация', value: universalProfile.scores.communication },
              { label: 'Решение проблем', value: universalProfile.scores.problemSolving },
              { label: 'Технические навыки', value: universalProfile.scores.technicalDepth },
              { label: 'Общий балл', value: universalProfile.scores.overall, highlight: true },
            ].map((score, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`text-sm ${score.highlight ? 'font-semibold' : 'text-neutral-400'} w-32`}>{score.label}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${score.value >= 80 ? 'bg-emerald-500' : score.value >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${score.value}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-10 ${getScoreColor(score.value)}`}>{score.value}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm text-neutral-400 mb-2">Обнаруженные навыки</h3>
            <div className="flex flex-wrap gap-2">
              {universalProfile.detectedSkills.slice(0, 8).map((skill, i) => (
                <span 
                  key={i}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    skill.confidence >= 80 
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : skill.confidence >= 60
                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                        : 'bg-white/5 border-white/10 text-neutral-300'
                  }`}
                >
                  {skill.skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Job Matches */}
      <div style={fadeIn(300)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Подходящие вакансии</h2>
          <button 
            onClick={() => setRoute({ name: 'opportunities' })}
            className="text-sm text-cyan-400 hover:underline flex items-center gap-1"
          >
            Все вакансии <ArrowRightIcon />
          </button>
        </div>

        <div className="grid gap-4">
          {jobMatches.slice(0, 5).map((match, i) => {
            const job = jobs.find(j => j.id === match.jobId);
            if (!job) return null;

            return (
              <div 
                key={i}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
                onClick={() => setRoute({ name: 'job', id: match.jobId })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400">
                      <BuildingIcon />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-cyan-400 transition-colors">{job.title}</h3>
                      <p className="text-sm text-neutral-400">{match.companyName || 'Wind AI'}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                        <span className="flex items-center gap-1"><GlobeIcon /> Remote</span>
                        <span>${job.rate_min}-{job.rate_max}/hr</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(match.matchScore)}`}>
                      {match.matchScore}%
                    </div>
                    <p className="text-xs text-neutral-500">совпадение</p>
                  </div>
                </div>

                {/* Match reasons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.matchReasons.slice(0, 3).map((reason, j) => (
                    <span key={j} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs">
                      {reason}
                    </span>
                  ))}
                  {match.missingSkills && match.missingSkills.length > 0 && (
                    <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs">
                      -{match.missingSkills[0]}
                    </span>
                  )}
                </div>

                {/* Status */}
                {match.status !== 'new' && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      match.status === 'applied' ? 'bg-blue-500/20 text-blue-400' :
                      match.status === 'interviewing' ? 'bg-purple-500/20 text-purple-400' :
                      match.status === 'offered' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-white/10 text-neutral-400'
                    }`}>
                      {match.status === 'applied' && 'Отклик отправлен'}
                      {match.status === 'interviewing' && 'На интервью'}
                      {match.status === 'offered' && 'Оффер'}
                      {match.status === 'viewed' && 'Просмотрено'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {jobMatches.length === 0 && (
            <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              <p className="text-neutral-400">Пока нет подходящих вакансий</p>
              <p className="text-sm text-neutral-500 mt-1">Мы ищем для вас лучшие предложения</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div style={fadeIn(400)} className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <SparklesIcon /> Советы для повышения шансов
        </h3>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            Заполните LinkedIn профиль — это повышает доверие компаний
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            Добавьте портфолио или GitHub — покажите свои проекты
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            Укажите предпочтения по зарплате — мы подберём релевантные вакансии
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CandidateHomePage;

