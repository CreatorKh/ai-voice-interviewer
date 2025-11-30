import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import Button from './Button';
import XIcon from './icons/XIcon';
import { WindLogo } from './icons/WindLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { openOnboarding, loginAsMockUser, closeLoginChoice } = useAuth();
  const [consentGiven, setConsentGiven] = useState(false);

  const handleSignUp = () => {
    if (!consentGiven) return;
    closeLoginChoice();
    openOnboarding();
  };

  const handleLogIn = () => {
    if (!consentGiven) return;
    loginAsMockUser();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-sm flex flex-col p-8 text-center relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white">
            <XIcon />
        </button>
        
        <div className="mx-auto mb-4"><WindLogo size={48} /></div>
        <h2 className="text-2xl font-bold mb-2">Добро пожаловать</h2>
        <p className="text-neutral-400 mb-6">Зарегистрируйтесь или войдите чтобы продолжить.</p>

        {/* Consent checkbox */}
        <label className="flex items-start gap-3 text-left mb-6 cursor-pointer group">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs text-neutral-400 group-hover:text-neutral-300">
            Я даю согласие на обработку персональных данных, видео/аудио запись интервью и использование данных для оценки кандидатов в соответствии с{' '}
            <a href="#" className="text-cyan-400 hover:underline">Политикой конфиденциальности</a>
          </span>
        </label>

        <div className="space-y-3">
            <Button 
              onClick={handleSignUp} 
              disabled={!consentGiven}
              className={`w-full py-3 ${consentGiven ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-neutral-700 cursor-not-allowed'} !text-white !font-bold`}
            >
                Регистрация
            </Button>
            <Button 
              onClick={handleLogIn} 
              variant="outline" 
              disabled={!consentGiven}
              className={`w-full py-3 ${!consentGiven ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                Войти как Demo
            </Button>
        </div>

      </div>
    </div>
  );
};

export default LoginModal;