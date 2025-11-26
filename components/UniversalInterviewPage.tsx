import React, { useState, useEffect } from 'react';
import { AppRoute, ApplicationData, SkillCategory } from '../types';
import { useAuth } from './AuthContext';

interface UniversalInterviewPageProps {
  setRoute: (route: AppRoute) => void;
  onStartInterview: (data: ApplicationData) => void;
}

// Icons
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>;

// Skill categories with icons
const SKILL_CATEGORIES: { id: SkillCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'software_engineering', label: 'Разработка ПО', icon: <CodeIcon />, description: 'Backend, Frontend, Mobile, DevOps' },
  { id: 'data_science', label: 'Data Science', icon: <ChartIcon />, description: 'ML, Analytics, AI, Big Data' },
  { id: 'cybersecurity', label: 'Кибербезопасность', icon: <ShieldIcon />, description: 'Security, Pentesting, Anti-Fraud' },
  { id: 'sales', label: 'Продажи', icon: <UsersIcon />, description: 'Sales, BDM, Account Management' },
  { id: 'management', label: 'Менеджмент', icon: <BriefcaseIcon />, description: 'Product, Project, Team Lead' },
];

const LANGUAGES = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'uz', label: "O'zbek" },
];

const UniversalInterviewPage: React.FC<UniversalInterviewPageProps> = ({ setRoute, onStartInterview }) => {
  const { user, profileData } = useAuth();
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  
  // Form data
  const [selectedCategories, setSelectedCategories] = useState<SkillCategory[]>([]);
  const [language, setLanguage] = useState('ru');
  const [linkedIn, setLinkedIn] = useState(profileData?.linkedin || '');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [summary, setSummary] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fadeIn = (delay: number) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.6s ease-out ${delay}ms`,
  });

  const toggleCategory = (id: SkillCategory) => {
    setSelectedCategories(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const canProceed = () => {
    if (step === 1) return selectedCategories.length > 0;
    if (step === 2) return language !== '';
    if (step === 3) return agreedToTerms;
    return false;
  };

  const handleStart = () => {
    // Create application data for universal interview
    const applicationData: ApplicationData = {
      name: user?.name || profileData?.fullName || 'Candidate',
      email: user?.email || profileData?.email || '',
      language: LANGUAGES.find(l => l.code === language)?.label || 'Русский',
      linkedInUrl: linkedIn,
      githubUrl: github,
      portfolioUrl: portfolio,
      profileSummary: summary,
      parsedSkills: selectedCategories,
    };
    
    onStartInterview(applicationData);
  };

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : setRoute({ name: 'home' })}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon /> Назад
          </button>
          <span className="text-sm text-neutral-500">Шаг {step} из 3</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Step 1: Choose Categories */}
        {step === 1 && (
          <div style={fadeIn(0)} className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <SparklesIcon />
              </div>
              <h1 className="text-3xl font-bold mb-2">Выберите ваши направления</h1>
              <p className="text-neutral-400">
                AI адаптирует интервью под выбранные области. Можно выбрать несколько.
              </p>
            </div>

            <div className="grid gap-3">
              {SKILL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                      isSelected 
                        ? 'bg-cyan-500/20 border-cyan-500/50' 
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-cyan-500 text-white' : 'bg-white/10 text-neutral-400'
                    }`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{cat.label}</h3>
                      <p className="text-sm text-neutral-400">{cat.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-white/30'
                    }`}>
                      {isSelected && <CheckIcon />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Language & Profile */}
        {step === 2 && (
          <div style={fadeIn(0)} className="w-full max-w-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Настройте интервью</h1>
              <p className="text-neutral-400">
                Выберите язык и добавьте ссылки на профили
              </p>
            </div>

            <div className="space-y-6">
              {/* Language */}
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Язык интервью *</label>
                <div className="flex gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                        language === lang.code 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="text-sm text-neutral-400 block mb-2">LinkedIn (рекомендуется)</label>
                <input
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* GitHub */}
              <div>
                <label className="text-sm text-neutral-400 block mb-2">GitHub (для разработчиков)</label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Portfolio */}
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Портфолио / Сайт</label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Краткое описание (опционально)</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Расскажите о себе в 2-3 предложениях..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div style={fadeIn(0)} className="w-full max-w-xl text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <SparklesIcon />
              </div>
              <h1 className="text-3xl font-bold mb-2">Готовы начать?</h1>
              <p className="text-neutral-400">
                Интервью займёт 15-20 минут. Убедитесь, что у вас есть:
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-left mb-6">
              <ul className="space-y-3">
                {[
                  'Тихое место без отвлекающих факторов',
                  'Работающий микрофон и камера',
                  'Стабильное интернет-соединение',
                  '15-20 минут свободного времени',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                      <CheckIcon />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary of choices */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-left mb-6">
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">Ваши настройки:</h3>
              <p className="text-sm text-neutral-300">
                <span className="text-neutral-500">Направления:</span> {selectedCategories.map(c => SKILL_CATEGORIES.find(sc => sc.id === c)?.label).join(', ')}
              </p>
              <p className="text-sm text-neutral-300">
                <span className="text-neutral-500">Язык:</span> {LANGUAGES.find(l => l.code === language)?.label}
              </p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-neutral-400 text-left">
                Я согласен с тем, что запись интервью будет использована для оценки моих навыков и может быть показана потенциальным работодателям.
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Продолжить <ArrowRightIcon />
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={!canProceed()}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Начать интервью <ArrowRightIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default UniversalInterviewPage;

