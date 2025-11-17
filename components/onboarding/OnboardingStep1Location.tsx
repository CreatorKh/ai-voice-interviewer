import React, { useState } from 'react';
import { OnboardingData } from '../../types';
import Button from '../Button';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const OnboardingStep1Location: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [country, setCountry] = useState(data.country);
  const [city, setCity] = useState(data.city);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ country, city });
    onNext();
  };

  const countries = ["United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "Uzbekistan"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto text-center">
      <p className="text-neutral-400">Let's start your profile! Fill out a few quick details to get discovered by top employers and unlock better opportunities</p>
      
      <div className="space-y-4 text-left">
          <div className="grid gap-1">
            <label htmlFor="country" className="text-sm font-medium text-neutral-300">Country / Region *</label>
            <select
              id="country"
              value={country}
              onChange={e => setCountry(e.target.value)}
              required
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-3 text-sm focus:outline-none focus:border-indigo-500"
            >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid gap-1">
            <label htmlFor="city" className="text-sm font-medium text-neutral-300">City *</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              required
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
      </div>
      
      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 !text-white !font-bold py-3">
        Next
      </Button>
    </form>
  );
};

export default OnboardingStep1Location;