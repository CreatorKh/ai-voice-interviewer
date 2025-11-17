import React from 'react';
import { useAuth } from '../AuthContext';
import Button from '../Button';

const ProfileResumeTab: React.FC = () => {
  const { profileData, updateProfileData } = useAuth();

  if (!profileData) return <div>Loading profile...</div>;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    updateProfileData({ [e.target.name]: e.target.value });
  };
  
  // Handlers for nested education/experience would be more complex
  // For this demo, we'll keep it simple and show the data.

  return (
    <div className="space-y-8 max-w-3xl">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-neutral-300">Full name *</label>
          <input name="fullName" value={profileData.fullName} onChange={handleInputChange} className="input-field" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-neutral-300">Resume</label>
          <p className="text-sm text-neutral-400">This field is taken from companies to find you opportunities</p>
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-neutral-300">Email</label>
          <input name="email" value={profileData.email} onChange={handleInputChange} className="input-field" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-neutral-300">Phone</label>
          <input name="phone" value={profileData.phone} onChange={handleInputChange} className="input-field" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-neutral-300">City</label>
          <input name="city" value={profileData.city} onChange={handleInputChange} className="input-field" />
        </div>
         <div className="grid gap-1.5">
          <label className="text-sm font-medium text-neutral-300">Country</label>
          <input name="country" value={profileData.country} onChange={handleInputChange} className="input-field" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-neutral-300">LinkedIn URL</label>
          <input name="linkedin" value={profileData.linkedin} onChange={handleInputChange} className="input-field" />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold mb-2">Resume *</h3>
         <div className="border-2 border-dashed border-neutral-700 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <p className="font-semibold">{profileData.resume ? profileData.resume.name : 'Drop your resume here'}</p>
            <p className="text-neutral-400 text-sm">or <label htmlFor="resume-upload" className="text-indigo-400 hover:underline cursor-pointer">browse files</label> on your computer</p>
            <p className="text-xs text-neutral-500 mt-2">Supports PDF, up to 3MB</p>
        </div>
      </section>
      
      <section>
        <h3 className="text-base font-semibold mb-2">Summary</h3>
        <textarea name="summary" value={profileData.summary} onChange={handleInputChange} className="input-field w-full min-h-24" placeholder="Profile Summary"/>
      </section>
      
      {/* Education & Work Experience would be rendered here */}
      
      <div className="pt-4 flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Save Changes</Button>
      </div>
       <style>{`.input-field { background-color: rgb(38 38 38 / 1); border: 1px solid rgb(64 64 64 / 1); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem; line-height: 1.25rem; } .input-field:focus { outline: none; border-color: #6366f1; }`}</style>
    </div>
  );
};

export default ProfileResumeTab;