import React, { useState, useEffect, useRef } from 'react';
import { AppRoute } from '../types';
import { WindLogo, WindLogoCompact } from './icons/WindLogo';

// --- Inline Icons ---
const ArrowRightIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const SparklesIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const RocketIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const CodeIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const LightBulbIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const MapIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
  </svg>
);

const LinkedInIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
  </svg>
);

// 3D Tilt Card Component
const TiltCard = ({ children, className = "", intensity = 10 }: { children: React.ReactNode; className?: string; intensity?: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transformStyle: 'preserve-3d' }}
    >
      {children}
      <div 
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-200"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 50%)`,
        }}
      />
    </div>
  );
};

// Floating 3D Element
const Float3D = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <div 
    className="animate-float"
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

interface LandingPageProps {
  setRoute: (route: AppRoute) => void;
}

// Helper to generate avatar URL from UI Avatars service
const getAvatarUrl = (name: string, size = 200) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=10b981&color=000&bold=true&format=svg`;
};

const TEAM_MEMBERS = [
  {
    name: "Хуршид Хусанбоев",
    role: "Founder & CEO",
    company: "Ipak Yuli Bank",
    position: "Team Lead Antifraud",
    skills: ["Fraud Detection", "Risk Analysis", "Team Management", "Banking Systems"],
    linkedin: "https://linkedin.com/in/khurshid-khusanboev",
    avatar: "https://media.licdn.com/dms/image/v2/D4D03AQEZLCxNSxLe4A/profile-displayphoto-shrink_400_400/B4DZP5fe8HG0Ak-/0/1735057601957?e=1766016000&v=beta&t=LtX26cHs1dZXBBk1G7ZRK5Ad87XTX_LPIhD0JGluZCc",
  },
  {
    name: "Жамшид Хусанбаев",
    role: "Co-Founder & Business Development",
    company: "Wildberries",
    position: "Seller Development Manager",
    skills: ["E-commerce", "Business Strategy", "Partner Relations", "Growth"],
    linkedin: "https://linkedin.com/in/jamshid-khusanbaev",
    avatar: "https://media.licdn.com/dms/image/v2/D4D03AQHrQm8iTROwXg/profile-displayphoto-scale_400_400/B4DZneMJYOHsAk-/0/1760369352202?e=1766016000&v=beta&t=ShNKINP--ouw5bog0O1DpefNH51bIOE6hmrlMvuucJg",
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ setRoute }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fadeIn = (delay: number) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  });

  const SectionTitle = ({ icon, badge, title, subtitle }: { icon: React.ReactNode; badge: string; title: string; subtitle?: string }) => (
    <div className="text-center mb-12 md:mb-16">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
        {icon}
        {badge}
      </div>
      <h2 className="text-3xl md:text-5xl font-bold mb-4">{title}</h2>
      {subtitle && <p className="text-neutral-400 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-emerald-500/30 selection:text-white">
      
      {/* Global 3D cursor glow effect */}
      <div 
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 transition-transform duration-100"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          left: mousePos.x - 250,
          top: mousePos.y - 250,
        }}
      />

      {/* ===== NAVIGATION ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WindLogo size={40} className="shadow-lg shadow-emerald-500/20" />
            <span className="text-xl font-bold tracking-tight">Wind AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
            <a href="#problem" className="hover:text-white transition-colors">Проблема</a>
            <a href="#team" className="hover:text-white transition-colors">Команда</a>
            <a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a>
            <a href="#tech" className="hover:text-white transition-colors">Технологии</a>
            <button 
              onClick={() => setRoute({ name: 'hirerLanding' })}
              className="hover:text-white transition-colors"
            >
              Для HR
            </button>
          </div>
          <button 
            onClick={() => setRoute({ name: 'explore' })}
            className="px-5 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-neutral-200 transition-all text-sm shadow-lg shadow-white/10"
          >
            Попробовать
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-24 overflow-hidden">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <Float3D delay={0}>
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[150px]" />
          </Float3D>
          <Float3D delay={500}>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
          </Float3D>
          <Float3D delay={1000}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[200px]" />
          </Float3D>
        </div>

        {/* 3D Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div style={fadeIn(0)}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Новая эпоха найма
            </span>
          </div>
          
          <h1 style={fadeIn(100)} className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8">
            Одно интервью.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[size:200%] animate-gradient">
              Сотни возможностей.
            </span>
          </h1>
          
          <p style={fadeIn(200)} className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Пройдите одно AI-интервью и получите универсальный профиль для всех вакансий. 
            <span className="text-white font-semibold">Без повторных собеседований</span> — ваш профиль работает на вас.
          </p>
          
          <div style={fadeIn(300)} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <TiltCard intensity={5}>
              <button 
                onClick={() => setRoute({ name: 'explore' })}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                Попробовать демо
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </TiltCard>
            <a href="#problem" className="px-8 py-4 text-neutral-300 hover:text-white font-medium rounded-full transition-colors">
              Узнать больше
            </a>
          </div>

          {/* 3D Stats Cards */}
          <div style={fadeIn(400)} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { value: '15 мин', label: 'Одно интервью' },
              { value: '24/7', label: 'Доступность' },
              { value: '90%', label: 'Экономия времени' },
              { value: 'AI', label: 'Объективная оценка' },
            ].map((stat, i) => (
              <TiltCard key={i} intensity={8}>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
                  <div className="text-sm text-neutral-500">{stat.label}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Floating 3D shapes */}
        <Float3D delay={200}>
          <div className="absolute top-32 right-20 w-20 h-20 border border-emerald-500/20 rounded-2xl rotate-12 hidden lg:block" />
        </Float3D>
        <Float3D delay={400}>
          <div className="absolute bottom-40 left-20 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-xl -rotate-12 hidden lg:block" />
        </Float3D>
        <Float3D delay={600}>
          <div className="absolute top-1/2 right-32 w-3 h-3 bg-emerald-400 rounded-full hidden lg:block" />
        </Float3D>
      </section>

      {/* ===== 1. ПРОБЛЕМА И РЕШЕНИЕ ===== */}
      <section id="problem" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/50 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionTitle 
            icon={<LightBulbIcon className="w-4 h-4" />}
            badge="Раздел 1"
            title="Проблема и Решение"
            subtitle="Сфера: Рекрутинг и HR-Tech"
          />

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Problem */}
            <TiltCard intensity={5}>
              <div className="h-full p-8 md:p-10 rounded-3xl bg-gradient-to-br from-red-950/30 to-red-950/10 border border-red-500/20 backdrop-blur-sm">
                <h3 className="text-red-400 font-semibold text-sm mb-4">ПРОБЛЕМА</h3>
                <h4 className="text-2xl md:text-3xl font-bold mb-6">Найм занимает слишком много времени и денег</h4>
                <ul className="space-y-4 text-neutral-300">
                  <li className="flex gap-3">
                    <span className="text-red-400 shrink-0">•</span>
                    <span><strong>45+ дней</strong> — средний срок закрытия технической вакансии</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-400 shrink-0">•</span>
                    <span><strong>$4,000+</strong> — стоимость одного найма</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-400 shrink-0">•</span>
                    <span><strong>80%</strong> кандидатов отсеиваются на первичном скрининге</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-400 shrink-0">•</span>
                    <span><strong>Субъективность:</strong> разные интервьюеры — разные оценки</span>
                  </li>
                </ul>
              </div>
            </TiltCard>

            {/* Solution */}
            <TiltCard intensity={5}>
              <div className="h-full p-8 md:p-10 rounded-3xl bg-gradient-to-br from-emerald-950/30 to-emerald-950/10 border border-emerald-500/20 backdrop-blur-sm">
                <h3 className="text-emerald-400 font-semibold text-sm mb-4">РЕШЕНИЕ</h3>
                <h4 className="text-2xl md:text-3xl font-bold mb-6">Wind AI — AI-интервьюер нового поколения</h4>
                <ul className="space-y-4 text-neutral-300">
                  <li className="flex gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Голосовые интервью 24/7</strong> — кандидат выбирает удобное время</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Структурированная оценка</strong> — одинаковые критерии для всех кандидатов</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Мгновенный фидбек</strong> — детальный отчёт сразу после интервью</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Антифрод-система</strong> — анализ видео, голоса и поведения</span>
                  </li>
                </ul>
              </div>
            </TiltCard>
          </div>

          {/* Expected Impact */}
          <TiltCard intensity={3} className="mt-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm">
              <p className="text-lg text-neutral-300">
                <strong className="text-white">Ожидаемый эффект:</strong> сокращение времени найма с 45 дней до 5, 
                снижение нагрузки на HR-команду на 70%, объективная оценка всех кандидатов.
              </p>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ===== 2. КОМАНДА ===== */}
      <section id="team" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionTitle 
            icon={<UserIcon className="w-4 h-4" />}
            badge="Раздел 2"
            title="Команда"
            subtitle="Основатели Wind AI"
          />

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TEAM_MEMBERS.map((member, i) => (
              <TiltCard key={i} intensity={8}>
                <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm h-full">
                  <div className="flex items-start gap-5 mb-6">
                    {/* Avatar - uses custom photo or UI Avatars service */}
                    <img 
                      src={member.avatar || getAvatarUrl(member.name, 200)} 
                      alt={member.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-lg shadow-emerald-500/20 border-2 border-emerald-500/30"
                      onError={(e) => {
                        // Fallback to UI Avatars if custom image fails
                        const target = e.target as HTMLImageElement;
                        target.src = getAvatarUrl(member.name, 200);
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-xl">{member.name}</h4>
                      <p className="text-emerald-400 font-medium">{member.role}</p>
                      <p className="text-neutral-500 text-sm mt-1">{member.position}</p>
                      <p className="text-neutral-600 text-sm">{member.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-5">
                    {member.skills.map((skill, j) => (
                      <span key={j} className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-neutral-400 border border-white/5">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {member.linkedin && (
                    <a 
                      href={member.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      <LinkedInIcon className="w-4 h-4" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. ПОЧЕМУ МЫ ===== */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/50 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionTitle 
            icon={<SparklesIcon className="w-4 h-4" />}
            badge="Раздел 3"
            title="Почему именно наша команда?"
          />

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Экспертиза в антифроде',
                desc: 'Опыт работы в банковской сфере с системами выявления мошенничества. Понимаем, как строить надёжные системы верификации и оценки.',
              },
              {
                title: 'Бизнес-экспертиза',
                desc: 'Опыт работы с крупными e-commerce платформами. Понимаем потребности бизнеса в масштабировании и оптимизации процессов.',
              },
              {
                title: 'Рабочий прототип',
                desc: 'У нас уже есть функционирующий MVP: голосовые интервью, транскрипция, оценка ответов, антифрод-модуль. Не просто идея — работающий продукт.',
              },
              {
                title: 'Скорость исполнения',
                desc: 'Agile-подход к разработке. Мы умеем быстро итерировать, тестировать гипотезы и доводить до результата.',
              },
            ].map((item, i) => (
              <TiltCard key={i} intensity={6}>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm h-full">
                  <h4 className="font-bold text-lg mb-3">{item.title}</h4>
                  <p className="text-neutral-400">{item.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. ROADMAP ===== */}
      <section id="roadmap" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionTitle 
            icon={<MapIcon className="w-4 h-4" />}
            badge="Раздел 4"
            title="Дорожная карта"
          />

          {/* Current Stage Badge */}
          <div className="text-center mb-12">
            <TiltCard intensity={5} className="inline-block">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold">
                <RocketIcon className="w-5 h-5" />
                Текущий этап: MVP / Прототип
              </span>
            </TiltCard>
          </div>

          {/* Timeline */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500 via-emerald-500/50 to-transparent" />
            
            {[
              { 
                date: 'Ноябрь 2024', 
                title: 'Идея и Исследование', 
                desc: 'Анализ рынка, изучение конкурентов, определение MVP-функций',
                status: 'done'
              },
              { 
                date: 'Ноябрь 2024', 
                title: 'Прототип', 
                desc: 'Голосовые интервью через Live API, базовая оценка ответов, UI',
                status: 'done'
              },
              { 
                date: 'Декабрь 2024', 
                title: 'MVP', 
                desc: 'Антифрод-модуль, банк вопросов по ролям, дашборд для HR',
                status: 'current'
              },
              { 
                date: 'Q1 2025', 
                title: 'Beta', 
                desc: 'Интеграции с ATS, multi-language support, мобильное приложение',
                status: 'future'
              },
              { 
                date: 'Q2 2025', 
                title: 'Launch', 
                desc: 'Enterprise-версия, white-label решения, масштабирование',
                status: 'future'
              },
            ].map((item, i) => (
              <div key={i} className={`relative flex items-start gap-6 md:gap-12 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`absolute left-4 md:left-1/2 w-3 h-3 rounded-full -translate-x-1/2 mt-2 ${
                  item.status === 'done' ? 'bg-emerald-500' : 
                  item.status === 'current' ? 'bg-emerald-400 ring-4 ring-emerald-400/30 animate-pulse' : 
                  'bg-neutral-600'
                }`} />
                
                <TiltCard intensity={5} className={`ml-10 md:ml-0 md:w-[calc(50%-3rem)] ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className={`text-sm font-medium ${item.status === 'current' ? 'text-emerald-400' : 'text-neutral-500'}`}>
                      {item.date}
                    </span>
                    <h4 className="text-xl font-bold mt-1 mb-2">{item.title}</h4>
                    <p className="text-neutral-400 text-sm">{item.desc}</p>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <TiltCard intensity={3} className="mt-8 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h4 className="font-bold mb-4">Ближайшие шаги (до 15 декабря):</h4>
              <ul className="grid md:grid-cols-2 gap-3 text-neutral-300">
                <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-400" /> Улучшить антифрод-детекцию</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-400" /> Добавить больше ролей в банк вопросов</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-400" /> Реализовать дашборд для рекрутеров</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-400" /> Провести пилот с 50+ кандидатами</li>
              </ul>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ===== 5. ТЕХНОЛОГИИ И AI ===== */}
      <section id="tech" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/50 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionTitle 
            icon={<CodeIcon className="w-4 h-4" />}
            badge="Раздел 5"
            title="Как мы реализуем решение"
            subtitle="Технологии и применение AI"
          />

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Frontend',
                items: ['React 18 + TypeScript', 'Tailwind CSS', 'WebSocket для real-time', 'Web Audio API'],
              },
              {
                title: 'AI & ML',
                items: ['Large Language Models', 'Speech-to-Text / TTS', 'RAG-pipeline для вопросов', 'NLP для анализа ответов'],
              },
              {
                title: 'Backend & Infra',
                items: ['Node.js / Vite', 'WebSocket streaming', 'Cloud Deployment', 'PostgreSQL / Supabase'],
              },
            ].map((stack, i) => (
              <TiltCard key={i} intensity={6}>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm h-full">
                  <h4 className="font-bold text-lg mb-4 text-emerald-400">{stack.title}</h4>
                  <ul className="space-y-2">
                    {stack.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-neutral-300">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            ))}
          </div>

          {/* AI Usage Highlight */}
          <TiltCard intensity={4}>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 backdrop-blur-sm">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-emerald-400" />
                Как мы используем AI
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Голосовое интервью', desc: 'Real-time диалог с кандидатом: распознавание речи, генерация вопросов, синтез голоса — всё в одном потоке с латентностью менее 500ms.' },
                  { title: 'Оценка ответов', desc: 'Multi-step reasoning: сначала эвристики (длина, структура), затем LLM-анализ на техническую глубину, коммуникацию, логику.' },
                  { title: 'Антифрод-система', desc: 'Мультимодальный анализ: видео (gaze detection), аудио (голосовые паттерны), текст (детекция сгенерированных ответов).' },
                  { title: 'Адаптивные вопросы', desc: 'RAG-подход: банк вопросов по ролям + динамическая сложность на основе предыдущих ответов кандидата.' },
                ].map((item, i) => (
                  <div key={i}>
                    <h5 className="font-semibold mb-2">{item.title}</h5>
                    <p className="text-neutral-400 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-emerald-950/20 to-black" />
        <Float3D>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/15 rounded-full blur-[200px] pointer-events-none" />
        </Float3D>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Попробуйте сами
          </h2>
          <p className="text-xl text-neutral-400 mb-10">
            Пройдите демо-интервью и оцените качество AI-собеседника
          </p>
          <TiltCard intensity={5} className="inline-block">
            <button 
              onClick={() => setRoute({ name: 'explore' })}
              className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-2xl text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              Начать интервью
              <ArrowRightIcon className="w-5 h-5 inline-block ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </TiltCard>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <WindLogoCompact size={32} />
            <span className="font-bold">Wind AI</span>
          </div>
          <p className="text-neutral-600 text-sm">© 2024 Wind AI. Все права защищены.</p>
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
