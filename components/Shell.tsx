import React from 'react';
import { AppRoute } from '../types';
import { useAuth } from './AuthContext';
import Button from './Button';

interface ShellProps {
  setRoute: (r: AppRoute) => void;
}

const Shell: React.FC<ShellProps> = ({ setRoute }) => {
  const { user, logout, openLoginChoice } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/40">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <div className="font-semibold text-lg" style={{cursor: 'pointer'}} onClick={() => setRoute({ name: 'explore' })}>
          AI Interview Platform
        </div>
        <nav className="ml-auto text-sm opacity-80 flex gap-2 items-center">
          {user ? (
            <>
              {/* This content is moved to the LoggedInLayout/ProfileSidebar */}
              <Button variant="ghost" onClick={() => setRoute({ name: 'profile' })}>My Profile</Button>
              <Button variant="ghost" onClick={logout}>Sign Out</Button>
            </>
          ) : (
            <>
              <a href="#" className="hover:opacity-100 transition-opacity px-2">Docs</a>
              <a href="#" className="hover:opacity-100 transition-opacity px-2">About</a>
              <Button variant="primary" onClick={openLoginChoice}>
                Sign Up / Log In
              </Button>
            </>
          )}
        </nav>
      </div>
      <div className="h-0.5" style={{ background: "linear-gradient(90deg, rgba(34,211,238,.9), rgba(99,102,241,.9))" }} />
    </header>
  );
}

export default Shell;