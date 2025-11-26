import React, { useState, useMemo } from 'react';
import Button from './Button';
import { AdminSettings, InterviewResult, Job } from '../types';
import { JOBS } from '../constants';

interface AdminPageProps {
  settings: AdminSettings;
  onSave: (settings: AdminSettings) => void;
  results?: InterviewResult[];
}

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

// Icons
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;

const AdminPage: React.FC<AdminPageProps> = ({ settings, onSave, results = [] }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'interviews' | 'settings'>('overview');
  const [localSettings, setLocalSettings] = useState(settings);
  const [jobs, setJobs] = useState<Job[]>(JOBS);

  // Analytics
  const analytics = useMemo(() => {
    const totalInterviews = results.length;
    const avgScore = results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.evaluation?.scores?.overall || 0), 0) / results.length)
      : 0;
    const hireCount = results.filter(r => r.evaluation?.finalVerdict === 'Hire').length;
    const hireRate = results.length > 0 ? Math.round((hireCount / results.length) * 100) : 0;
    
    // By role
    const byRole = results.reduce((acc, r) => {
      const role = r.job.title;
      if (!acc[role]) acc[role] = { count: 0, hired: 0, avgScore: 0, scores: [] };
      acc[role].count++;
      acc[role].scores.push(r.evaluation?.scores?.overall || 0);
      if (r.evaluation?.finalVerdict === 'Hire') acc[role].hired++;
      return acc;
    }, {} as Record<string, { count: number; hired: number; avgScore: number; scores: number[] }>);

    Object.keys(byRole).forEach(role => {
      byRole[role].avgScore = Math.round(byRole[role].scores.reduce((a, b) => a + b, 0) / byRole[role].scores.length);
    });

    // Recent interviews
    const recentInterviews = results.slice(-10).reverse();

    return { totalInterviews, avgScore, hireCount, hireRate, byRole, recentInterviews };
  }, [results]);

  const handleSave = () => {
    onSave(localSettings);
  };

  const clearAllData = () => {
    if (confirm('Вы уверены, что хотите удалить все данные интервью? Это действие нельзя отменить.')) {
      localStorage.removeItem('interviewResults');
      localStorage.removeItem('shortlisted_candidates');
      localStorage.removeItem('rejected_candidates');
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      interviews: results,
      exportDate: new Date().toISOString(),
      totalCount: results.length,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wind-ai-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const tabs = [
    { id: 'overview' as const, label: 'Обзор', icon: <ChartIcon /> },
    { id: 'jobs' as const, label: 'Вакансии', icon: <BriefcaseIcon /> },
    { id: 'interviews' as const, label: 'Интервью', icon: <UsersIcon /> },
    { id: 'settings' as const, label: 'Настройки', icon: <CogIcon /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Админ-панель</h1>
          <p className="text-sm text-neutral-400 mt-1">Управление платформой Wind AI</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData} className="text-sm">
            <DownloadIcon /> Экспорт
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-cyan-500 text-black" 
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <p className="text-sm text-neutral-400">Всего интервью</p>
              <p className="text-4xl font-bold mt-2">{analytics.totalInterviews}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <p className="text-sm text-neutral-400">Средний балл</p>
              <p className={`text-4xl font-bold mt-2 ${analytics.avgScore >= 70 ? 'text-green-400' : analytics.avgScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {analytics.avgScore}%
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <p className="text-sm text-neutral-400">Рекомендовано</p>
              <p className="text-4xl font-bold mt-2 text-green-400">{analytics.hireCount}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <p className="text-sm text-neutral-400">Hire Rate</p>
              <p className="text-4xl font-bold mt-2 text-cyan-400">{analytics.hireRate}%</p>
            </div>
          </div>

          {/* By Role */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="font-semibold mb-4">Статистика по вакансиям</h3>
            {Object.keys(analytics.byRole).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(analytics.byRole).map(([role, data]) => (
                  <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                    <div>
                      <p className="font-medium">{role}</p>
                      <p className="text-xs text-neutral-400">{data.count} интервью • {data.hired} рекомендовано</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${data.avgScore >= 70 ? 'text-green-400' : data.avgScore >= 50 ? 'text-yellow-400' : 'text-neutral-400'}`}>
                        {data.avgScore}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-8">Нет данных. Проведите первое интервью.</p>
            )}
          </div>

          {/* Recent Interviews */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="font-semibold mb-4">Последние интервью</h3>
            {analytics.recentInterviews.length > 0 ? (
              <div className="space-y-2">
                {analytics.recentInterviews.map((interview, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                        {interview.application.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{interview.application.name}</p>
                        <p className="text-xs text-neutral-400">{interview.job.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-bold ${(interview.evaluation?.scores?.overall || 0) >= 70 ? 'text-green-400' : 'text-neutral-400'}`}>
                        {interview.evaluation?.scores?.overall || 0}%
                      </span>
                      {interview.evaluation?.finalVerdict && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          interview.evaluation.finalVerdict === 'Hire' ? 'bg-green-500/20 text-green-400' :
                          interview.evaluation.finalVerdict === 'Maybe' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {interview.evaluation.finalVerdict}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-8">Нет интервью</p>
            )}
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Активные вакансии ({jobs.length})</h3>
            <Button className="text-sm">
              <PlusIcon /> Добавить вакансию
            </Button>
          </div>

          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{job.title}</p>
                    {job.hasLevels && (
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">Уровни</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-400 mt-1">{job.contract_type} • ${job.rate_min}-{job.rate_max}/hr</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">
                    {results.filter(r => r.job.id === job.id).length} интервью
                  </span>
                  <Button variant="outline" size="sm">Редактировать</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === 'interviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Все интервью ({results.length})</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportData} className="text-sm">
                <DownloadIcon /> Экспорт CSV
              </Button>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/[0.02]">
                  <tr className="text-left text-sm text-neutral-400">
                    <th className="p-4">Кандидат</th>
                    <th className="p-4">Вакансия</th>
                    <th className="p-4">Дата</th>
                    <th className="p-4">Балл</th>
                    <th className="p-4">Вердикт</th>
                    <th className="p-4">Риск</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((interview, i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                            {interview.application.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{interview.application.name}</p>
                            <p className="text-xs text-neutral-500">{interview.application.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{interview.job.title}</td>
                      <td className="p-4 text-sm text-neutral-400">
                        {interview.date ? new Date(interview.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${(interview.evaluation?.scores?.overall || 0) >= 70 ? 'text-green-400' : (interview.evaluation?.scores?.overall || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {interview.evaluation?.scores?.overall || 0}%
                        </span>
                      </td>
                      <td className="p-4">
                        {interview.evaluation?.finalVerdict ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            interview.evaluation.finalVerdict === 'Hire' ? 'bg-green-500/20 text-green-400' :
                            interview.evaluation.finalVerdict === 'Maybe' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {interview.evaluation.finalVerdict}
                          </span>
                        ) : <span className="text-neutral-500 text-sm">—</span>}
                      </td>
                      <td className="p-4">
                        <span className={`text-sm ${(interview.antiCheatReport?.riskScore || 0) > 50 ? 'text-red-400' : 'text-green-400'}`}>
                          {interview.antiCheatReport?.riskScore || 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-xl bg-white/[0.02] border border-white/10 text-center">
              <p className="text-neutral-400">Нет интервью</p>
              <p className="text-sm text-neutral-500 mt-1">Проведите первое интервью, чтобы увидеть данные здесь</p>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          {/* Evaluation Provider */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="font-semibold mb-4">Провайдер оценки</h3>
            <p className="text-sm text-neutral-400 mb-4">Выберите AI-модель для оценки кандидатов</p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-cyan-500/30 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={localSettings.evaluation.provider === 'gemini'}
                  onChange={() => setLocalSettings({
                    ...localSettings,
                    evaluation: { ...localSettings.evaluation, provider: 'gemini' }
                  })}
                  className="w-4 h-4 text-cyan-500"
                />
                <div>
                  <p className="font-medium">Google Gemini</p>
                  <p className="text-xs text-neutral-400">Рекомендуется. Быстрый и точный.</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-cyan-500/30 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value="openai"
                  checked={localSettings.evaluation.provider === 'openai'}
                  onChange={() => setLocalSettings({
                    ...localSettings,
                    evaluation: { ...localSettings.evaluation, provider: 'openai' }
                  })}
                  className="w-4 h-4 text-cyan-500"
                />
                <div>
                  <p className="font-medium">OpenAI GPT-4</p>
                  <p className="text-xs text-neutral-400">Требует API ключ. Более детальный анализ.</p>
                </div>
              </label>
            </div>

            {localSettings.evaluation.provider === 'openai' && (
              <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">OpenAI API Key</label>
                  <input
                    type="password"
                    value={localSettings.evaluation.openAI.apiKey}
                    onChange={e => setLocalSettings({
                      ...localSettings,
                      evaluation: { ...localSettings.evaluation, openAI: { ...localSettings.evaluation.openAI, apiKey: e.target.value }}
                    })}
                    placeholder="sk-..."
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">Модель</label>
                  <select
                    value={localSettings.evaluation.openAI.model}
                    onChange={e => setLocalSettings({
                      ...localSettings,
                      evaluation: { ...localSettings.evaluation, openAI: { ...localSettings.evaluation.openAI, model: e.target.value }}
                    })}
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm"
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
            <h3 className="font-semibold text-red-400 mb-2">Опасная зона</h3>
            <p className="text-sm text-neutral-400 mb-4">Эти действия нельзя отменить</p>
            <Button 
              variant="outline" 
              onClick={clearAllData}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <TrashIcon /> Удалить все данные
            </Button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setLocalSettings(settings)}>Сбросить</Button>
            <Button onClick={handleSave}>Сохранить изменения</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
