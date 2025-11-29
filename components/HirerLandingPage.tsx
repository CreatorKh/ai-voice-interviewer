import React, { useState, useEffect } from 'react';
import { AppRoute } from '../types';
import { useAuth } from './AuthContext';
import HirerLoginModal from './HirerLoginModal';
import { WindLogo, WindLogoCompact } from './icons/WindLogo';

// Icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

interface HirerLandingPageProps {
  setRoute: (route: AppRoute) => void;
}

const HirerLandingPage: React.FC<HirerLandingPageProps> = ({ setRoute }) => {
  const { openHirerLogin, isHirerLoginOpen, closeHirerLogin } = useAuth();
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

  const features = [
    {
      icon: <ClockIcon />,
      title: "Экономия 90% времени",
      description: "AI проводит первичные интервью автоматически. Вы получаете только отобранных кандидатов."
    },
    {
      icon: <UsersIcon />,
      title: "Масштабирование найма",
      description: "Интервьюируйте сотни кандидатов одновременно, 24/7, без увеличения штата HR."
    },
    {
      icon: <ChartIcon />,
      title: "Поиск скрытых талантов",
      description: "AI находит 'суперсилы' кандидата. Мы показываем не просто баллы, а реальные сильные стороны и потенциал."
    },
    {
      icon: <ShieldIcon />,
      title: "Антифрод система",
      description: "Встроенная проверка на списывание и использование подсказок во время интервью."
    },
  ];

  const benefits = [
    "Сокращение time-to-hire на 70%",
    "Снижение стоимости найма в 5 раз",
    "Стандартизированная оценка всех кандидатов",
    "Детальные отчёты по каждому интервью",
    "Интеграция с вашей ATS системой",
    "Кастомизация вопросов под вашу компанию",
  ];

  const steps = [
    { num: "01", title: "Создайте вакансию", desc: "Опишите требования и навыки, которые хотите проверить" },
    { num: "02", title: "Поделитесь ссылкой", desc: "Кандидаты проходят AI-интервью в удобное время" },
    { num: "03", title: "Получите отчёты", desc: "Смотрите оценки, записи и рекомендации по каждому кандидату" },
    { num: "04", title: "Нанимайте лучших", desc: "Фокусируйтесь только на топ-кандидатах" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setRoute({ name: 'home' })} className="flex items-center gap-2">
            <WindLogo size={40} variant="hirer" />
            <span className="text-xl font-bold">Wind AI</span>
            <span className="text-xs text-neutral-500 ml-1">for Hirers</span>
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setRoute({ name: 'home' })}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Для кандидатов
            </button>
            <button 
              onClick={openHirerLogin}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:opacity-90 transition-all text-sm"
            >
              Войти
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div style={fadeIn(0)}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              Для HR и рекрутеров
            </span>
          </div>
          
          <h1 style={fadeIn(100)} className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
            Нанимайте
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              в 10 раз быстрее
            </span>
          </h1>
          
          <p style={fadeIn(200)} className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            AI-интервьюер проводит технические собеседования за вас. 
            Вы получаете только лучших кандидатов с детальными отчётами.
          </p>
          
          <div style={fadeIn(300)} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={openHirerLogin}
              className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
            >
              Начать бесплатно
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <button className="px-8 py-4 border border-white/20 rounded-full text-neutral-300 hover:bg-white/5 transition-all flex items-center gap-3">
              <PlayIcon />
              Смотреть демо
            </button>
          </div>

          {/* Features */}
          <div style={fadeIn(400)} className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: "24/7", label: "Интервью" },
              { value: "15 мин", label: "На кандидата" },
              { value: "90%", label: "Экономия времени" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              Возможности
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">Почему Wind AI?</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Автоматизируйте рутину и фокусируйтесь на том, что важно</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              Как это работает
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">4 простых шага</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-purple-500/10 mb-4">{step.num}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-400">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">Что вы получаете</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <CheckIcon />
                </div>
                <span className="text-neutral-200">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Готовы начать?</h2>
            <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
              Автоматизируйте первичный скрининг кандидатов с помощью AI-интервьюера
            </p>
            <button 
              onClick={openHirerLogin}
              className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-neutral-200 transition-all"
            >
              Попробовать бесплатно
            </button>
            <p className="text-sm text-neutral-500 mt-4">Бесплатно до 10 интервью в месяц</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <WindLogoCompact size={32} variant="hirer" />
            <span className="font-bold">Wind AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <button onClick={() => setRoute({ name: 'home' })} className="hover:text-white transition-colors">Для кандидатов</button>
            <a href="#" className="hover:text-white transition-colors">Документация</a>
            <a href="#" className="hover:text-white transition-colors">Поддержка</a>
          </div>
          <p className="text-sm text-neutral-500">© 2025 Wind AI. Все права защищены.</p>
        </div>
      </footer>
      
      {/* Hirer Login Modal */}
      <HirerLoginModal isOpen={isHirerLoginOpen} onClose={closeHirerLogin} />
    </div>
  );
};

export default HirerLandingPage;

