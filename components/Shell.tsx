import React from 'react';
import SearchIcon from './icons/XIcon'; // Repurposed
import BellIcon from './icons/EarningsIcon'; // Repurposed

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/10 bg-neutral-950/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
      <div className="flex-1">
        <form>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <SearchIcon />
            </div>
            <input
              type="search"
              placeholder="Search transactions..."
              className="w-full max-w-sm rounded-lg bg-white/[0.05] border-none p-2 pl-10 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>
        </form>
      </div>
      <button className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
        <BellIcon />
        <span className="sr-only">Toggle notifications</span>
      </button>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 cursor-pointer">
        <img
          src={`https://i.pravatar.cc/150?u=antifraud-admin`}
          alt="Admin User"
          className="w-full h-full rounded-full border-2 border-neutral-800"
          title="Admin User"
        />
      </div>
    </header>
  );
}

export default Header;
