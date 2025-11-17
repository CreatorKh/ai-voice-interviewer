import React, { useState } from 'react';
import { OnboardingData } from '../../types';
import Button from '../Button';
import XIcon from '../icons/XIcon';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const OnboardingStep3Links: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [linkedin, setLinkedin] = useState(data.linkedin);
  const [hasNoLinkedIn, setHasNoLinkedIn] = useState(data.hasNoLinkedIn);
  const [portfolio, setPortfolio] = useState(data.portfolio);
  const [otherLinks, setOtherLinks] = useState(data.otherLinks);
  const [otherProfiles, setOtherProfiles] = useState(data.otherProfiles);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ linkedin, hasNoLinkedIn, portfolio, otherLinks, otherProfiles });
    onNext();
  };
  
  const addProfile = (type: string) => {
      if(!otherProfiles.some(p => p.type === type)) {
        setOtherProfiles([...otherProfiles, { type, value: '' }]);
      }
  }
  
  const removeProfile = (type: string) => {
      setOtherProfiles(otherProfiles.filter(p => p.type !== type));
  }
  
  const updateProfileValue = (type: string, value: string) => {
      setOtherProfiles(otherProfiles.map(p => p.type === type ? {...p, value} : p));
  }

  const profileOptions = ['leetcode', 'github', 'codechef', 'codeforces'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-center">
      <p className="text-neutral-400">Review your details to ensure everything is correct before moving on</p>
      
      <div className="bg-green-900/50 border border-green-700 text-green-300 text-sm rounded-lg p-3">
        💡 Tip: Profiles with LinkedIns and other public links get viewed 2x more
      </div>

      <div className="space-y-4 text-left">
          <h3 className="font-semibold">Links</h3>
          <div className="grid gap-1">
            <label htmlFor="linkedin" className="text-sm font-medium text-neutral-300">LinkedIn URL</label>
            <input
              id="linkedin" type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)}
              disabled={hasNoLinkedIn}
              placeholder="https://yourlinkedin.com"
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" id="no-linkedin" checked={hasNoLinkedIn} onChange={e => setHasNoLinkedIn(e.target.checked)} className="h-4 w-4 rounded bg-neutral-700 border-neutral-600 text-indigo-500 focus:ring-indigo-500"/>
                <label htmlFor="no-linkedin" className="text-sm text-neutral-400">I don't have a LinkedIn</label>
            </div>
          </div>
          <div className="grid gap-1">
            <label htmlFor="portfolio" className="text-sm font-medium text-neutral-300">Portfolio</label>
            <input
              id="portfolio" type="url" value={portfolio} onChange={e => setPortfolio(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
           {/* Dynamic Other Links could be added here if needed */}
      </div>

      <div className="space-y-4 text-left">
          <h3 className="font-semibold">Other Profiles</h3>
          <div className="space-y-2">
            {otherProfiles.map(profile => (
              <div key={profile.type} className="flex items-center gap-2">
                  <span className="capitalize text-sm w-24 text-neutral-400">{profile.type}</span>
                  <input
                    type="text"
                    value={profile.value}
                    onChange={e => updateProfileValue(profile.type, e.target.value)}
                    placeholder={`${profile.type}-username`}
                    className="flex-grow rounded-lg bg-neutral-800 border border-neutral-700 p-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button type="button" onClick={() => removeProfile(profile.type)} className="p-1 text-neutral-500 hover:text-white"><XIcon/></button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {profileOptions.filter(p => !otherProfiles.some(op => op.type === p)).map(p => (
              <button key={p} type="button" onClick={() => addProfile(p)} className="text-sm text-indigo-400 hover:underline">+ Add {p}</button>
            ))}
          </div>
      </div>
      
      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 !text-white !font-bold py-3 mt-8">
        Next
      </Button>
    </form>
  );
};

export default OnboardingStep3Links;