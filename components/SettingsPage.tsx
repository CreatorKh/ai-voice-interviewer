
import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="max-w-xl">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">User Preferences</h2>
            <p className="text-sm text-neutral-400 mt-1">
              General user settings and preferences will be available here in a future update.
              For now, please manage your profile information under the <span className="font-semibold text-cyan-400">Profile</span> tab.
            </p>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;