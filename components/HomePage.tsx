import React, { useState, useMemo } from 'react';
import { AppRoute } from '../types';
import { useAuth } from './AuthContext';
import Button from './Button';

interface HomePageProps {
  setRoute: (r: AppRoute) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setRoute }) => {
  const { user, profileData } = useAuth();
  const [activeTab, setActiveTab] = useState('Applications');

  const profileCompletionPercentage = useMemo(() => {
    if (!profileData) return 0;

    const fields = [
      !!profileData.fullName,
      !!profileData.phone,
      !!profileData.city,
      !!profileData.country,
      !!profileData.linkedin || profileData.hasNoLinkedIn,
      !!profileData.resume,
      !!profileData.summary,
      profileData.education?.length > 0 && !!profileData.education[0].school && !!profileData.education[0].degree,
      profileData.experience?.length > 0 && !!profileData.experience[0].company && !!profileData.experience[0].role,
      !!profileData.availability,
      !!profileData.preferredTimeCommitment,
      !!profileData.timezone,
      profileData.domainInterests?.length > 0,
      profileData.minExpectedCompensationFT > 0,
      profileData.minExpectedCompensationPT > 0,
      !!profileData.avatar,
    ];

    const completedFields = fields.filter(Boolean).length;
    const totalFields = fields.length;

    return Math.round((completedFields / totalFields) * 100);
  }, [profileData]);

  const isProfileComplete = profileCompletionPercentage === 100;
  // Assuming payment is always an important task for this demo
  const importantTaskCount = isProfileComplete ? 1 : 2;


  const applications = [
    { id: 1, title: "Data Scientist", rate: "$100 - $120", unit: "hour", type: "contract", company: "Mercor", started: "11/13/25" },
    { id: 4, title: "Financial Forecaster", rate: "$105 - $140", unit: "hour", type: "contract", company: "Mercor", started: "11/13/25" },
  ];

  const tabs = ['Contracts', 'Offers', 'Applications', 'Assessments', 'Saved'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name.split(' ')[0]}</h1>
        <p className="text-neutral-400">Important Tasks ({importantTaskCount})</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Setup Your Payments</h3>
            <p className="text-sm text-neutral-400">Add your payment details to start getting paid.</p>
          </div>
          <Button onClick={() => setRoute({ name: 'earnings' })} className="bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0">Setup Now</Button>
        </div>
        <div className={`rounded-lg border ${isProfileComplete ? 'border-green-500/30 bg-green-900/20' : 'border-white/10 bg-white/[0.03]'} p-4 flex items-center justify-between transition-colors`}>
          <div>
            <h3 className={`font-semibold ${isProfileComplete ? 'text-green-300' : ''}`}>
              {isProfileComplete ? "Profile Complete!" : "Complete Your Profile"}
            </h3>
            <p className={`text-sm ${isProfileComplete ? 'text-green-300' : 'text-neutral-400'}`}>
              {isProfileComplete 
                ? "You're all set. Recruiters can now see your full profile."
                : `Your profile is ${profileCompletionPercentage}% complete. Fill it out to get hired faster.`
              }
            </p>
          </div>
          <Button onClick={() => setRoute({ name: 'profile' })} className={`${isProfileComplete ? 'bg-white/10 hover:bg-white/20 !text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} flex-shrink-0 transition-colors`}>
            {isProfileComplete ? "View Profile" : "Complete now"}
          </Button>
        </div>
      </div>

      <div>
        <div className="border-b border-white/10">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  tab === activeTab
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-300'
                }`}
              >
                {tab}{tab === 'Applications' && ' (2)'}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-6">
          {activeTab === 'Applications' && (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">{app.title}</h4>
                    <p className="text-sm text-neutral-400">{app.rate} / {app.unit} - {app.type} - {app.company}</p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-xs text-neutral-500 mb-1">Started on {app.started}</p>
                    <button
                      onClick={() => setRoute({ name: 'apply', jobId: app.id })}
                      className="text-sm font-semibold bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-md hover:bg-yellow-400/30"
                    >
                      Start your application
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab !== 'Applications' && (
            <div className="text-center py-12 text-neutral-500">
              Content for {activeTab} goes here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;