import React from 'react';
import { useAuth } from '../AuthContext';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';

const ProfileAvailabilityTab: React.FC = () => {
    const { profileData, updateProfileData } = useAuth();
    if (!profileData) return null;

    const handleWorkingHoursChange = (day: string, field: string, value: any) => {
        const newWorkingHours = profileData.workingHours.map(wh => 
            wh.day === day ? { ...wh, [field]: value } : wh
        );
        updateProfileData({ workingHours: newWorkingHours });
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <section className="space-y-4">
                <h3 className="font-semibold">Availability</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <label className="text-sm">Availability to start *</label>
                        <select 
                            value={profileData.availability} 
                            onChange={(e) => updateProfileData({ availability: e.target.value })}
                            className="input-field"
                        >
                            <option value="immediately">Immediately</option>
                            <option value="1-week">In 1 week</option>
                            <option value="2-weeks">In 2 weeks</option>
                        </select>
                    </div>
                     <div className="grid gap-1.5">
                        <label className="text-sm">Preferred time commitment *</label>
                         <input 
                            type="text"
                            placeholder="Ex: 40"
                            value={profileData.preferredTimeCommitment} 
                            onChange={(e) => updateProfileData({ preferredTimeCommitment: e.target.value })}
                            className="input-field"
                        />
                    </div>
                    <div className="grid gap-1.5 md:col-span-2">
                        <label className="text-sm">Timezone *</label>
                         <select 
                            value={profileData.timezone} 
                            onChange={(e) => updateProfileData({ timezone: e.target.value })}
                            className="input-field"
                        >
                            <option value="America/New_York">Eastern Time (US & Canada)</option>
                            <option value="America/Chicago">Central Time (US & Canada)</option>
                            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                        </select>
                    </div>
                </div>
            </section>
            
            <section className="space-y-4">
                <h3 className="font-semibold">Working hours</h3>
                <div className="space-y-3">
                    {profileData.workingHours.map(({day, available, from, to}) => (
                        <div key={day} className="grid grid-cols-[1fr,auto,1fr,auto,1fr] items-center gap-3">
                            <ToggleSwitch
                                isEnabled={available}
                                setIsEnabled={(val) => handleWorkingHoursChange(day, 'available', val)}
                                label={day}
                            />
                            <input type="text" value={from} onChange={(e) => handleWorkingHoursChange(day, 'from', e.target.value)} className="input-field w-28" disabled={!available}/>
                            <span>-</span>
                            <input type="text" value={to} onChange={(e) => handleWorkingHoursChange(day, 'to', e.target.value)} className="input-field w-28" disabled={!available}/>
                        </div>
                    ))}
                </div>
            </section>
            
            <section className="space-y-4">
                 <h3 className="font-semibold">Date-specific hours</h3>
                 <div className="text-center py-8 border-2 border-dashed border-neutral-700 rounded-xl">
                    <p className="text-sm text-neutral-400">No active exceptions</p>
                 </div>
            </section>
            
            <div className="pt-4 flex justify-end">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Save Changes</Button>
            </div>
            <style>{`.input-field { background-color: rgb(38 38 38 / 1); border: 1px solid rgb(64 64 64 / 1); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem; line-height: 1.25rem; } .input-field:focus { outline: none; border-color: #6366f1; } .input-field:disabled { opacity: 0.5 }`}</style>
        </div>
    );
};

export default ProfileAvailabilityTab;