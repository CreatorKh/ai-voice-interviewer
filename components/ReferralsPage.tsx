import React, { useRef } from 'react';
import Button from './Button';
import { AppRoute } from '../types';

interface ReferralsPageProps {
  setRoute: (r: AppRoute) => void;
}

const ReferralsPage: React.FC<ReferralsPageProps> = ({ setRoute }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stats = [
    { label: 'All Applicants', count: 0 },
    { label: 'Signed Up', count: 0 },
    { label: 'Applying', count: 0 },
    { label: 'Under Review', count: 0 },
    { label: 'Offer', count: 0 },
    { label: 'Hired', count: 0 },
  ];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      alert(`Successfully selected "${file.name}". This file would now be processed.`);
      // Reset input so the same file can be selected again
      event.target.value = '';
    }
  };
  
  const handleGetConnections = () => {
      alert("This would redirect you to LinkedIn to authorize and export your connections as a CSV file.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My referrals</h1>
        <p className="text-neutral-400">Track your referral earnings and progress</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <p className="text-3xl font-bold">{stat.count}</p>
            <p className="text-sm text-neutral-400">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center pt-8">
        <div className="bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-indigo-500/10 grid place-items-center">
            <svg width="40" height="40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="4" fill="#a78bfa"/>
              <circle cx="30" cy="30" r="3" fill="#a78bfa"/>
              <circle cx="70" cy="30" r="3" fill="#a78bfa"/>
              <circle cx="30" cy="70" r="3" fill="#a78bfa"/>
              <circle cx="70" cy="70" r="3" fill="#a78bfa"/>
              <circle cx="50" cy="20" r="2" fill="#a78bfa"/>
              <circle cx="50" cy="80" r="2" fill="#a78bfa"/>
              <circle cx="20" cy="50" r="2" fill="#a78bfa"/>
              <circle cx="80" cy="50" r="2" fill="#a78bfa"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Invite your connections, earn rewards</h2>
          <p className="text-neutral-400 mb-6">The easiest way to make referrals is by inviting your LinkedIn connections to join Mercor.</p>
          
          <ul className="space-y-4 text-left max-w-xs mx-auto mb-8">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-sm grid place-items-center flex-shrink-0">1</div>
              <span>Upload your LinkedIn connections</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-sm grid place-items-center flex-shrink-0">2</div>
              <span>Invite to recommended roles</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-sm grid place-items-center flex-shrink-0">3</div>
              <span>Get paid for each success</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full py-3" onClick={handleUploadClick}>Upload connections</Button>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3" onClick={handleGetConnections}>Get my LinkedIn connections</Button>
          </div>
          <p className="text-xs text-neutral-500 mt-3">Extract the ZIP from LinkedIn and upload 'Connections.csv' here.</p>
        </div>
      </div>
       <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv"
      />
    </div>
  );
};

export default ReferralsPage;