import React from 'react';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import XIcon from '../icons/XIcon';
import { WindLogo } from '../icons/WindLogo';

interface OnboardingHeaderProps {
  title: string;
  onClose: () => void;
  onBack: () => void;
  showBack: boolean;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ title, onClose, onBack, showBack }) => {
  return (
    <header className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
       <div className="flex items-center gap-4 w-1/3">
            {showBack ? (
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white">
                    <ArrowLeftIcon />
                </button>
            ) : <div className="w-10 h-10" /> /* Placeholder to keep alignment */}
        </div>
        
        <div className="flex flex-col items-center text-center">
            <div className="mb-2"><WindLogo size={40} /></div>
            <h2 className="text-xl font-bold">{title}</h2>
        </div>

        <div className="flex items-center justify-end w-1/3">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white">
                <XIcon />
            </button>
        </div>
    </header>
  );
};

export default OnboardingHeader;