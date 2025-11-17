import React from 'react';
import { ProfileTab } from '../ProfilePage';

interface ProfileTabNavProps {
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
}

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

const ProfileTabNav: React.FC<ProfileTabNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: ProfileTab[] = ['Resume', 'Availability', 'Work Preferences', 'Communications', 'Account'];

  return (
    <div className="border-b border-white/10">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
              tab === activeTab
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-300'
            )}
            aria-current={tab === activeTab ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabNav;