
import React from 'react';
import { useAuth } from '../AuthContext';
import { AppRoute } from '../../types';

import MercorLogo from '../icons/MercorLogo';
import HomeIcon from '../icons/HomeIcon';
import CompassIcon from '../icons/MicIcon'; // Was MicIcon, now is CompassIcon
import BriefcaseIcon from '../icons/BriefcaseIcon';
import UserIcon from '../icons/UserIcon';
import DollarSignIcon from '../icons/GoogleIcon'; // Was GoogleIcon, is DollarSignIcon
import ReferralsIcon from '../icons/ReferralsIcon'; // Was ReferralsIcon, is WalletsIcon (used for referrals)
import SettingsIcon from '../icons/SettingsIcon';
import AdminIcon from '../icons/AdminIcon';
import LogOutIcon from '../icons/StopIcon'; // Was StopIcon, now is LogOutIcon
import SearchIcon from '../icons/XIcon'; // Was XIcon, is SearchIcon

interface ProfileSidebarProps {
  setRoute: (route: AppRoute) => void;
  openSearchModal: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left ${active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
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

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ setRoute, openSearchModal }) => {
    const { user, userRole, logout, isAdmin, hirerData } = useAuth();
    // A simple way to determine the active route. In a real app, this would be more robust.
    const [activeNav, setActiveNav] = React.useState('Home');

    const handleNav = (route: AppRoute, label: string) => {
        setRoute(route);
        setActiveNav(label);
    }
    
    // Hirer navigation
    if (userRole === 'hirer') {
        return (
            <aside className="hidden border-r border-white/10 bg-neutral-900 md:flex md:flex-col justify-between w-16 lg:w-60 transition-all duration-300">
                <div>
                    <div className="flex h-14 items-center justify-center lg:justify-start border-b border-white/10 px-4 lg:h-[60px] lg:px-6">
                        <a href="#" onClick={(e) => {e.preventDefault(); handleNav({name: 'home'}, 'Home')}} className="flex items-center gap-2 font-semibold">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <MercorLogo className="h-5 w-5 text-white" />
                            </div>
                            <span className="hidden lg:inline">Wind AI</span>
                            <span className="hidden lg:inline text-xs text-purple-400 ml-1">HR</span>
                        </a>
                    </div>
                    <nav className="flex-grow p-2 lg:p-4">
                        <ul className="space-y-1">
                            <li><NavItem icon={<HomeIcon />} label="Дашборд" onClick={() => handleNav({name: 'home'}, 'Home')} active={activeNav === 'Home'}/></li>
                            <li><NavItem icon={<UsersIcon />} label="Кандидаты" onClick={() => handleNav({name: 'hirerDashboard'}, 'Candidates')} active={activeNav === 'Candidates'}/></li>
                            <li><NavItem icon={<BriefcaseIcon />} label="Вакансии" onClick={() => handleNav({name: 'explore'}, 'Jobs')} active={activeNav === 'Jobs'}/></li>
                            <li><NavItem icon={<ChartIcon />} label="Аналитика" onClick={() => handleNav({name: 'admin'}, 'Analytics')} active={activeNav === 'Analytics'}/></li>
                            <li><NavItem icon={<SettingsIcon />} label="Настройки" onClick={() => handleNav({name: 'settings'}, 'Settings')} active={activeNav === 'Settings'}/></li>
                        </ul>
                    </nav>
                </div>
                {user && (
                     <div className="p-2 lg:p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                {hirerData?.companyName?.charAt(0) || 'H'}
                            </div>
                            <div className="hidden lg:block">
                                <p className="font-semibold text-sm">{hirerData?.companyName || 'HR'}</p>
                                <p className="text-xs text-neutral-400">{hirerData?.position || 'Manager'}</p>
                            </div>
                        </div>
                        <NavItem icon={<LogOutIcon />} label="Выйти" onClick={logout} />
                    </div>
                )}
            </aside>
        );
    }
    
    // Candidate navigation (default)
    return (
        <aside className="hidden border-r border-white/10 bg-neutral-900 md:flex md:flex-col justify-between w-16 lg:w-60 transition-all duration-300">
            <div>
                <div className="flex h-14 items-center justify-center lg:justify-start border-b border-white/10 px-4 lg:h-[60px] lg:px-6">
                    <a href="#" onClick={(e) => {e.preventDefault(); handleNav({name: 'home'}, 'Home')}} className="flex items-center gap-2 font-semibold">
                        <MercorLogo className="h-6 w-6 text-cyan-400" />
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
