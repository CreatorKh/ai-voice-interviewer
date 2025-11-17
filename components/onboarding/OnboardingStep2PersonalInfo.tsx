import React, { useState } from 'react';
import { OnboardingData } from '../../types';
import Button from '../Button';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const OnboardingStep2PersonalInfo: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [fullName, setFullName] = useState(data.fullName);
  const [email, setEmail] = useState(data.email);
  const [phone, setPhone] = useState(data.phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ fullName, email, phone });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto text-center">
       <p className="text-neutral-400">Let's start your profile! Fill out a few quick details to get discovered by top employers and unlock better opportunities</p>
      
      <div className="space-y-4 text-left">
          <div className="grid gap-1">
            <label htmlFor="fullName" className="text-sm font-medium text-neutral-300">Full Name *</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-300">Email *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
           <div className="grid gap-1">
            <label htmlFor="phone" className="text-sm font-medium text-neutral-300">Phone number *</label>
            <div className="flex">
                <select className="rounded-l-lg bg-neutral-700 border border-neutral-700 p-3 text-sm focus:outline-none">
                    <option>🇺🇸 +1</option>
                    <option>🇬🇧 +44</option>
                    <option>🇩🇪 +49</option>
                </select>
                <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full rounded-r-lg bg-neutral-800 border-y border-r border-neutral-700 p-3 text-sm focus:outline-none focus:border-indigo-500"
                />
            </div>
          </div>
      </div>
      
      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 !text-white !font-bold py-3">
        Next
      </Button>
    </form>
  );
};

export default OnboardingStep2PersonalInfo;