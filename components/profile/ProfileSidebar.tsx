import React from 'react';
import { AppRoute } from '../../types';
import { useAuth } from '../AuthContext';
import MercorLogo from '../icons/MercorLogo';
import HomeIcon from '../icons/HomeIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon'; // Using this for search/explore
import ReferralsIcon from '../icons/ReferralsIcon';
import EarningsIcon from '../icons/EarningsIcon';
import UserIcon from '../icons/UserIcon';
import SettingsIcon from '../icons/SettingsIcon';

interface ProfileSidebarProps {
  setRoute: (route: AppRoute) => void;
  openSearchModal: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-white transition-colors duration-200 py-3 w-full rounded-lg hover:bg-white/5">
        <div className="w-6 h-6">{icon}</div>
        <span className="text-xs">{label}</span>
    </button>
);

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ setRoute, openSearchModal }) => {
    const { user, logout } = useAuth();
    
    return (
        <aside className="w-20 bg-neutral-900 flex flex-col items-center p-2 border-r border-white/10">
            <div className="p-2 text-indigo-400">
                <MercorLogo className="w-8 h-8" />
            </div>
            <nav className="flex-grow w-full flex flex-col items-center gap-2 mt-4">
                <NavItem icon={<HomeIcon />} label="Home" onClick={() => setRoute({name: 'home'})} />
                <NavItem icon={<BriefcaseIcon />} label="Search" onClick={openSearchModal} />
                <NavItem icon={<ReferralsIcon />} label="Referrals" onClick={() => setRoute({name: 'referrals'})} />
                <NavItem icon={<EarningsIcon />} label="Earnings" onClick={() => setRoute({name: 'earnings'})} />
            </nav>
            <div className="w-full">
                <NavItem icon={<UserIcon />} label="Profile" onClick={() => setRoute({name: 'profile'})} />
                <NavItem icon={<SettingsIcon />} label="Settings" onClick={() => {}} />
                {user && (
                     <div className="mt-4 p-2 border-t border-white/10">
                        <img 
                            src={user.picture} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full mx-auto cursor-pointer"
                            onClick={() => setRoute({name: 'profile'})}
                            title={`Logged in as ${user.name}`}
                        />
                        <button onClick={logout} className="text-neutral-500 hover:text-red-400 text-xs w-full mt-2">
                           Logout
                        </button>
                     </div>
                )}
            </div>
        </aside>
    );
};

export default ProfileSidebar;