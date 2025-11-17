import React from 'react';
import { useAuth } from './AuthContext';
import Button from './Button';
import XIcon from './icons/XIcon';
import MercorLogo from './icons/MercorLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { openOnboarding, loginAsMockUser, closeLoginChoice } = useAuth();

  const handleSignUp = () => {
    closeLoginChoice();
    openOnboarding();
  };

  const handleLogIn = () => {
    loginAsMockUser();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-sm flex flex-col p-8 text-center"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white">
            <XIcon />
        </button>
        
        <MercorLogo className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome</h2>
        <p className="text-neutral-400 mb-6">Sign up or log in to continue.</p>

        <div className="space-y-3">
            <Button onClick={handleSignUp} className="w-full bg-indigo-600 hover:bg-indigo-700 !text-white !font-bold py-3">
                Sign Up with Email
            </Button>
            <Button onClick={handleLogIn} variant="outline" className="w-full py-3">
                Log In as Demo User
            </Button>
        </div>

      </div>
    </div>
  );
};

export default LoginModal;