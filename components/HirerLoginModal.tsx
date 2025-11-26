import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import Button from './Button';

interface HirerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const HirerLoginModal: React.FC<HirerLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAsHirer, loginAsMockHirer } = useAuth();
  const [mode, setMode] = useState<'choice' | 'form'>('choice');
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    loginAsHirer({
      companyName: formData.companyName,
      position: formData.position,
      email: formData.email,
    });
    
    setLoading(false);
    setMode('choice');
    setFormData({ companyName: '', position: '', email: '' });
  };

  const handleDemoLogin = () => {
    loginAsMockHirer();
    setMode('choice');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <XIcon />
        </button>

        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <BuildingIcon />
          </div>
          <h2 className="text-2xl font-bold mb-2">Wind AI для HR</h2>
          <p className="text-neutral-400 text-sm">
            {mode === 'choice' 
              ? 'Войдите чтобы управлять кандидатами'
              : 'Введите данные вашей компании'
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {mode === 'choice' ? (
            <div className="space-y-3">
              <Button
                onClick={handleDemoLogin}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                Войти как Demo HR
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setMode('form')}
                className="w-full"
              >
                Войти с данными компании
              </Button>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-neutral-500 text-center">
                  Demo аккаунт позволяет протестировать все функции платформы
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 block mb-1">Название компании *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Wind AI"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>
              
              <div>
                <label className="text-sm text-neutral-400 block mb-1">Ваша должность</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  placeholder="HR Manager"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>
              
              <div>
                <label className="text-sm text-neutral-400 block mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="hr@company.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('choice')}
                  className="flex-1"
                >
                  Назад
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HirerLoginModal;

