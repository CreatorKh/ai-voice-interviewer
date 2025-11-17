import React from 'react';
import { AppRoute } from '../types';
import ProfileSidebar from './profile/ProfileSidebar';

interface LoggedInLayoutProps {
  children: React.ReactNode;
  setRoute: (route: AppRoute) => void;
  openSearchModal: () => void;
}

const LoggedInLayout: React.FC<LoggedInLayoutProps> = ({ children, setRoute, openSearchModal }) => {
  return (
    <div className="flex min-h-dvh bg-neutral-950">
      <ProfileSidebar setRoute={setRoute} openSearchModal={openSearchModal} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
             {children}
            </div>
        </main>
      </div>
    </div>
  );
};

export default LoggedInLayout;