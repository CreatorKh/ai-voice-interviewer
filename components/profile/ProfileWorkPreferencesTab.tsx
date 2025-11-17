import React from 'react';
import { useAuth } from '../AuthContext';
import Button from '../Button';

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

const ProfileWorkPreferencesTab: React.FC = () => {
    const { profileData, updateProfileData } = useAuth();
    if (!profileData) return null;

    const domains = ['Software Engineering', 'Legal', 'Design', 'Creative', 'Hobby', 'Medical', 'Science', 'Finance', 'Generalist'];

    const toggleDomain = (domain: string) => {
        const newInterests = profileData.domainInterests.includes(domain)
            ? profileData.domainInterests.filter(d => d !== domain)
            : [...profileData.domainInterests, domain];
        updateProfileData({ domainInterests: newInterests });
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <section className="space-y-4">
                <h3 className="font-semibold">Work Preferences</h3>
                <p className="text-sm text-neutral-400">What domains are you interested in? Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                    {domains.map(domain => (
                        <button
                            key={domain}
                            onClick={() => toggleDomain(domain)}
                            className={cn(
                                "px-3 py-1.5 text-sm rounded-lg transition border",
                                profileData.domainInterests.includes(domain)
                                    ? "bg-cyan-400 text-black font-semibold border-cyan-400"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                        >
                            {domain}
                        </button>
                    ))}
                </div>
                 <div className="grid gap-1.5">
                    <label className="text-sm">Others (please specify)</label>
                    <input 
                        type="text"
                        value={profileData.otherInterests} 
                        onChange={(e) => updateProfileData({ otherInterests: e.target.value })}
                        className="input-field"
                    />
                </div>
            </section>
            
            <section className="space-y-4">
                <h3 className="font-semibold">Minimum expected compensation</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <label className="text-sm">Full-time</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                            <input 
                                type="number"
                                value={profileData.minExpectedCompensationFT} 
                                onChange={(e) => updateProfileData({ minExpectedCompensationFT: parseInt(e.target.value, 10) || 0 })}
                                className="input-field pl-6 w-full"
                            />
                             <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">/ year</span>
                        </div>
                    </div>
                     <div className="grid gap-1.5">
                        <label className="text-sm">Part-time</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                            <input 
                                type="number"
                                value={profileData.minExpectedCompensationPT} 
                                onChange={(e) => updateProfileData({ minExpectedCompensationPT: parseInt(e.target.value, 10) || 0 })}
                                className="input-field pl-6 w-full"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">/ hour</span>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-neutral-500">We won't reach out about roles below this. This stays private and won't impact your offers.</p>
            </section>

             <div className="pt-4 flex justify-end">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Save Changes</Button>
            </div>
             <style>{`.input-field { background-color: rgb(38 38 38 / 1); border: 1px solid rgb(64 64 64 / 1); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem; line-height: 1.25rem; } .input-field:focus { outline: none; border-color: #6366f1; }`}</style>
        </div>
    );
};

export default ProfileWorkPreferencesTab;