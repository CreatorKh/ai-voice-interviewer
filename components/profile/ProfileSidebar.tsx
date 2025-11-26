
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

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ setRoute, openSearchModal }) => {
    const { user, logout, isAdmin } = useAuth();
    // A simple way to determine the active route. In a real app, this would be more robust.
    const [activeNav, setActiveNav] = React.useState('Home');

    const handleNav = (route: AppRoute, label: string) => {
        setRoute(route);
        setActiveNav(label);
    }
    
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
