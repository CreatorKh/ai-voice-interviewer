
import React from 'react';
import { useAuth } from '../AuthContext';
import { AppRoute } from '../../types';

import { WindLogo } from '../icons/WindLogo';
import HomeIcon from '../icons/HomeIcon';
import CompassIcon from '../icons/MicIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon';
import UserIcon from '../icons/UserIcon';
import DollarSignIcon from '../icons/GoogleIcon';
import ReferralsIcon from '../icons/ReferralsIcon';
import SettingsIcon from '../icons/SettingsIcon';
import AdminIcon from '../icons/AdminIcon';
import LogOutIcon from '../icons/StopIcon';
import SearchIcon from '../icons/XIcon';

interface ProfileSidebarProps {
  setRoute: (route: AppRoute) => void;
  openSearchModal: () => void;
}

// Candidate nav item
const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left ${active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
        {icon}
        <span className="hidden lg:inline">{label}</span>
    </button>
);

// Hirer nav item with purple theme
const HirerNavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all w-full text-left ${active ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
        {icon}
        <span className="hidden lg:inline">{label}</span>
    </button>
);

// Icons for hirer menu
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const HirerHomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);

const HirerSettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const HirerLogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ setRoute, openSearchModal }) => {
    const { user, userRole, logout, isAdmin, hirerData } = useAuth();
    const [activeNav, setActiveNav] = React.useState('Home');

    const handleNav = (route: AppRoute, label: string) => {
        setRoute(route);
        setActiveNav(label);
    }
    
    // ============ HIRER SIDEBAR ============
    if (userRole === 'hirer') {
        return (
            <aside className="hidden border-r border-purple-500/10 bg-gradient-to-b from-neutral-900 via-neutral-900 to-purple-950/20 md:flex md:flex-col justify-between w-16 lg:w-64 transition-all duration-300">
                {/* Logo */}
                <div>
                    <div className="flex h-16 items-center justify-center lg:justify-start border-b border-purple-500/10 px-4 lg:px-6">
                        <a href="#" onClick={(e) => {e.preventDefault(); handleNav({name: 'home'}, 'Home')}} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <SparklesIcon />
                            </div>
                            <div className="hidden lg:block">
                                <span className="font-bold text-lg">Wind AI</span>
                                <span className="block text-xs text-purple-400 -mt-0.5">for Recruiters</span>
                            </div>
                        </a>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="p-3 lg:p-4">
                        <div className="mb-2 px-3 hidden lg:block">
                            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Меню</span>
                        </div>
                        <ul className="space-y-1">
                            <li>
                                <HirerNavItem 
                                    icon={<HirerHomeIcon />} 
                                    label="Дашборд" 
                                    onClick={() => handleNav({name: 'home'}, 'Home')} 
                                    active={activeNav === 'Home'}
                                />
                            </li>
                            <li>
                                <HirerNavItem 
                                    icon={<SparklesIcon />} 
                                    label="Talent Pool" 
                                    onClick={() => handleNav({name: 'talentPool'}, 'TalentPool')} 
                                    active={activeNav === 'TalentPool'}
                                />
                            </li>
                            <li>
                                <HirerNavItem 
                                    icon={<UsersIcon />} 
                                    label="Мои кандидаты" 
                                    onClick={() => handleNav({name: 'hirerDashboard'}, 'Candidates')} 
                                    active={activeNav === 'Candidates'}
                                />
                            </li>
                            <li>
                                <HirerNavItem 
                                    icon={<BriefcaseIcon />} 
                                    label="Вакансии" 
                                    onClick={() => handleNav({name: 'explore'}, 'Jobs')} 
                                    active={activeNav === 'Jobs'}
                                />
                            </li>
                            <li>
                                <HirerNavItem 
                                    icon={<ChartIcon />} 
                                    label="Аналитика" 
                                    onClick={() => handleNav({name: 'admin'}, 'Analytics')} 
                                    active={activeNav === 'Analytics'}
                                />
                            </li>
                        </ul>
                        
                        <div className="mt-6 mb-2 px-3 hidden lg:block">
                            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Настройки</span>
                        </div>
                        <ul className="space-y-1">
                            <li>
                                <HirerNavItem 
                                    icon={<HirerSettingsIcon />} 
                                    label="Настройки" 
                                    onClick={() => handleNav({name: 'settings'}, 'Settings')} 
                                    active={activeNav === 'Settings'}
                                />
                            </li>
                        </ul>
                    </nav>
                </div>
                
                {/* User Section */}
                {user && (
                    <div className="p-3 lg:p-4 border-t border-purple-500/10">
                        {/* Company Info */}
                        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
                                {hirerData?.companyName?.charAt(0) || 'H'}
                            </div>
                            <div className="hidden lg:block flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{hirerData?.companyName || 'Company'}</p>
                                <p className="text-xs text-purple-400 truncate">{hirerData?.position || 'HR Manager'}</p>
                            </div>
                        </div>
                        
                        {/* Logout */}
                        <button 
                            onClick={logout}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all w-full text-left text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                            <HirerLogoutIcon />
                            <span className="hidden lg:inline">Выйти</span>
                        </button>
                    </div>
                )}
            </aside>
        );
    }
    
    // ============ CANDIDATE SIDEBAR ============
    return (
        <aside className="hidden border-r border-white/10 bg-neutral-900 md:flex md:flex-col justify-between w-16 lg:w-60 transition-all duration-300">
            <div>
                <div className="flex h-14 items-center justify-center lg:justify-start border-b border-white/10 px-4 lg:h-[60px] lg:px-6">
                    <a href="#" onClick={(e) => {e.preventDefault(); handleNav({name: 'home'}, 'Home')}} className="flex items-center gap-2 font-semibold">
                        <WindLogo size={28} />
                        <span className="hidden lg:inline">Wind AI</span>
                    </a>
                </div>
                <nav className="flex-grow p-2 lg:p-4">
                    <ul className="space-y-1">
                        <li><button onClick={openSearchModal} className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-400 hover:text-white hover:bg-white/5 w-full"><SearchIcon /><span className="hidden lg:inline">Search</span></button></li>
                        <li><NavItem icon={<HomeIcon />} label="Home" onClick={() => handleNav({name: 'home'}, 'Home')} active={activeNav === 'Home'}/></li>
                        <li><NavItem icon={<CompassIcon />} label="Explore" onClick={() => handleNav({name: 'explore'}, 'Explore')} active={activeNav === 'Explore'}/></li>
                        <li><NavItem icon={<BriefcaseIcon />} label="My Applications" onClick={() => handleNav({name: 'candidateDashboard'}, 'Applications')} active={activeNav === 'Applications'}/></li>
                        <li><NavItem icon={<UserIcon />} label="Profile" onClick={() => handleNav({name: 'profile'}, 'Profile')} active={activeNav === 'Profile'}/></li>
                        <li><NavItem icon={<DollarSignIcon />} label="Earnings" onClick={() => handleNav({name: 'earnings'}, 'Earnings')} active={activeNav === 'Earnings'}/></li>
                        <li><NavItem icon={<ReferralsIcon />} label="Referrals" onClick={() => handleNav({name: 'referrals'}, 'Referrals')} active={activeNav === 'Referrals'}/></li>
                        <li><NavItem icon={<SettingsIcon />} label="Settings" onClick={() => handleNav({name: 'settings'}, 'Settings')} active={activeNav === 'Settings'}/></li>
                        {isAdmin && <li><NavItem icon={<AdminIcon />} label="Admin" onClick={() => handleNav({name: 'admin'}, 'Admin')} active={activeNav === 'Admin'}/></li>}
                    </ul>
                </nav>
            </div>
            {user && (
                 <div className="p-2 lg:p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full"/>
                        <div className="hidden lg:block">
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-xs text-neutral-400">{user.email}</p>
                        </div>
                    </div>
                    <NavItem icon={<LogOutIcon />} label="Log Out" onClick={logout} />
                </div>
            )}
        </aside>
    );
};

export default ProfileSidebar;
