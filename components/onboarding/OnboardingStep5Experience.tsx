import React, { useState } from 'react';
import { OnboardingData } from '../../types';
import Button from '../Button';
import XIcon from '../icons/XIcon';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onSubmit: () => void;
}

const OnboardingStep5Experience: React.FC<Props> = ({ data, updateData, onSubmit }) => {
  const [education, setEducation] = useState(data.education);
  const [experience, setExperience] = useState(data.experience);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ education, experience });
    onSubmit();
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEducation(newEducation);
  };
  
  const addEducation = () => setEducation([...education, { school: '', degree: '', field: '', gpa: '' }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const newExperience = [...experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setExperience(newExperience);
  };
  
  const addExperience = () => setExperience([...experience, { company: '', role: '', startYear: '', endYear: '', city: '', country: '', description: '' }]);
  const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Education Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Education</h3>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="rounded-lg border border-neutral-700 p-4 space-y-4 relative">
              {education.length > 1 && (
                  <button type="button" onClick={() => removeEducation(index)} className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-white"><XIcon/></button>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="School" value={edu.school} onChange={e => handleEducationChange(index, 'school', e.target.value)} className="input-field"/>
                  <input placeholder="Degree" value={edu.degree} onChange={e => handleEducationChange(index, 'degree', e.target.value)} className="input-field"/>
              </div>
               <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Field of Study" value={edu.field} onChange={e => handleEducationChange(index, 'field', e.target.value)} className="input-field"/>
                  <input placeholder="GPA" value={edu.gpa} onChange={e => handleEducationChange(index, 'gpa', e.target.value)} className="input-field"/>
              </div>
            </div>
          ))}
          <button type="button" onClick={addEducation} className="text-sm text-indigo-400 hover:underline">+ Add Education</button>
        </div>
      </section>

      {/* Experience Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <div key={index} className="rounded-lg border border-neutral-700 p-4 space-y-4 relative">
              {experience.length > 1 && (
                 <button type="button" onClick={() => removeExperience(index)} className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-white"><XIcon/></button>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Company" value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} className="input-field"/>
                  <input placeholder="Role" value={exp.role} onChange={e => handleExperienceChange(index, 'role', e.target.value)} className="input-field"/>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Start year" value={exp.startYear} onChange={e => handleExperienceChange(index, 'startYear', e.target.value)} className="input-field"/>
                  <input placeholder="End year" value={exp.endYear} onChange={e => handleExperienceChange(index, 'endYear', e.target.value)} className="input-field"/>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="City" value={exp.city} onChange={e => handleExperienceChange(index, 'city', e.target.value)} className="input-field"/>
                  <input placeholder="Country" value={exp.country} onChange={e => handleExperienceChange(index, 'country', e.target.value)} className="input-field"/>
              </div>
              <textarea placeholder="Description" value={exp.description} onChange={e => handleExperienceChange(index, 'description', e.target.value)} className="input-field w-full min-h-24"/>
            </div>
          ))}
          <button type="button" onClick={addExperience} className="text-sm text-indigo-400 hover:underline">+ Add Work Experience</button>
        </div>
      </section>
      
      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 !text-white !font-bold py-3 mt-8">
        Complete Profile
      </Button>
      <style>{`.input-field { background-color: rgb(38 38 38 / 1); border: 1px solid rgb(64 64 64 / 1); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem; line-height: 1.25rem; } .input-field:focus { outline: none; border-color: #6366f1; }`}</style>
    </form>
  );
};

export default OnboardingStep5Experience;