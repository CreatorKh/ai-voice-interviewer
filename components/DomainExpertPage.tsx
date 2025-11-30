import React, { useState } from 'react';
import { Job, AppRoute, ApplicationData } from '../types';
import { useAuth } from './AuthContext';
import Button from './Button';

interface DomainExpertPageProps {
  job: Job;
  applicationData: ApplicationData;
  onComplete: (expertData: any) => void;
  setRoute: (r: AppRoute) => void;
}

const DomainExpertPage: React.FC<DomainExpertPageProps> = ({ job, applicationData, onComplete, setRoute }) => {
  const { user, profileData } = useAuth();

  const [formData, setFormData] = useState({
    email: applicationData.email || '',
    country: '',
    linkedIn: applicationData.linkedInUrl || '',
    phone: '',
    hiringExperience: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalExpertData: any = {};
    if (user && profileData) {
      finalExpertData = {
        email: profileData.email,
        country: profileData.country,
        linkedInUrl: profileData.linkedin,
        phone: profileData.phone,
        hiringExperience: formData.hiringExperience 
      };
    } else {
      finalExpertData = {
        email: formData.email,
        country: formData.country,
        linkedInUrl: formData.linkedIn,
        phone: formData.phone,
        hiringExperience: formData.hiringExperience
      };
    }
    onComplete(finalExpertData);
  };

  const steps = [
      { name: 'Upload Resume', completed: true },
      { name: 'Senior Professional Interview', completed: true },
      { name: 'Senior Domain Expert', completed: false },
      { name: 'Work Authorization', completed: false }
  ];

  return (
    <div className="grid lg:grid-cols-[320px,1fr] gap-8">
      <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hidden lg:block">
        <h3 className="text-sm font-semibold opacity-80 mb-3">Software Developers Application</h3>
        <div className="text-sm text-neutral-400 mb-4">2 of 4 steps done</div>
        <div className="w-full bg-neutral-700 rounded-full h-1.5 mb-4">
            <div className="bg-cyan-400 h-1.5 rounded-full" style={{width: '50%'}}></div>
        </div>
        <ul className="mt-4 text-sm space-y-3 text-neutral-300">
           {steps.map((step, index) => (
             <li key={step.name} className={`flex items-center gap-3 ${index === 2 ? 'font-semibold text-white' : 'opacity-60'}`}>
               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${index <= 1 ? 'bg-cyan-400 text-black' : (index === 2 ? 'border-2 border-cyan-400' : 'border-2 border-neutral-600')}`}>
                 {index <= 1 ? '✓' : index + 1}
               </div>
               {step.name}
             </li>
           ))}
        </ul>
      </aside>
      <div>
        <h1 className="text-2xl font-bold mb-1">Senior Domain Expert</h1>
        <p className="text-neutral-400 mb-6">Please answer the following questions.</p>

        {user && profileData ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <p className="text-sm text-neutral-300 bg-neutral-800 p-3 rounded-lg">
                We've used your profile to answer most of these questions. Please just answer the remaining one below.
              </p>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Have you been involved in hiring, training, or managing other professionals in your industry? If so, how many? Please describe.*</label>
                <textarea name="hiringExperience" value={formData.hiringExperience} onChange={handleChange} required className="input-field w-full min-h-24" />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">Next</Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">What is the email address associated with your Wind AI account?*</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">What country are you currently based in?*</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} required className="input-field" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">What is your LinkedIn profile URL?*</label>
                <input type="url" name="linkedIn" value={formData.linkedIn} onChange={handleChange} required className="input-field" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">What is your phone number?*</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Have you been involved in hiring, training, or managing other professionals in your industry? If so, how many? Please describe.*</label>
                <textarea name="hiringExperience" value={formData.hiringExperience} onChange={handleChange} required className="input-field w-full min-h-24" />
              </div>
            </section>
            <Button type="submit" className="w-full md:w-auto">Next</Button>
          </form>
        )}
      </div>
      <style>{`.input-field { background-color: rgb(38 38 38 / 1); border: 1px solid rgb(64 64 64 / 1); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem; line-height: 1.25rem; } .input-field:focus { outline: none; border-color: #6366f1; }`}</style>
    </div>
  );
};

export default DomainExpertPage;
