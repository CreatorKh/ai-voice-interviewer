import React from 'react';
import { useAuth } from '../AuthContext';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';

const ProfileCommunicationsTab: React.FC = () => {
    const { profileData, updateProfileData } = useAuth();
    if (!profileData) return null;

    return (
        <div className="space-y-8 max-w-3xl">
            <section className="space-y-4">
                <h3 className="font-semibold">Communications</h3>
                <p className="text-sm text-neutral-400">Select how and where you'd like to receive updates</p>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-4">
                    <h4 className="text-sm font-semibold">Communication channels</h4>
                    <ToggleSwitch
                        label="Email"
                        subLabel="Text message (SMS)"
                        isEnabled={profileData.commChannels.email}
                        setIsEnabled={(val) => updateProfileData({ commChannels: { ...profileData.commChannels, email: val } })}
                    />
                     <ToggleSwitch
                        isEnabled={profileData.commChannels.sms}
                        setIsEnabled={(val) => updateProfileData({ commChannels: { ...profileData.commChannels, sms: val } })}
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="font-semibold">Opportunity types</h3>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-4">
                     <ToggleSwitch
                        label="Full-time opportunities"
                        subLabel="Contact me about full-time roles"
                        isEnabled={profileData.opportunityTypes.fullTime}
                        setIsEnabled={(val) => updateProfileData({ opportunityTypes: { ...profileData.opportunityTypes, fullTime: val } })}
                    />
                     <ToggleSwitch
                        label="Part-time opportunities"
                        subLabel="Contact me about part-time roles"
                        isEnabled={profileData.opportunityTypes.partTime}
                        setIsEnabled={(val) => updateProfileData({ opportunityTypes: { ...profileData.opportunityTypes, partTime: val } })}
                    />
                     <ToggleSwitch
                        label="Referral opportunities"
                        subLabel="Contact me about relevant referral opportunities"
                        isEnabled={profileData.opportunityTypes.referral}
                        setIsEnabled={(val) => updateProfileData({ opportunityTypes: { ...profileData.opportunityTypes, referral: val } })}
                    />
                </div>
            </section>
            
             <section className="space-y-4">
                <h3 className="font-semibold">General</h3>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-4">
                     <ToggleSwitch
                        label="Job opportunities"
                        subLabel="Receive notifications about new job openings, interviews, and application invitations."
                        isEnabled={profileData.general.jobOpportunities}
                        setIsEnabled={(val) => updateProfileData({ general: { ...profileData.general, jobOpportunities: val } })}
                    />
                     <ToggleSwitch
                        label="Product updates"
                        subLabel="Get updates about offers, work trials, contracts, and project status changes."
                        isEnabled={profileData.general.productUpdates}
                        setIsEnabled={(val) => updateProfileData({ general: { ...profileData.general, productUpdates: val } })}
                    />
                     <ToggleSwitch
                        label="Unsubscribe from all"
                        subLabel="Turn this on to stop all the nags."
                        isEnabled={profileData.unsubscribeAll}
                        setIsEnabled={(val) => updateProfileData({ unsubscribeAll: val })}
                    />
                </div>
            </section>
            
            <div className="pt-4 flex justify-end">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Save Changes</Button>
            </div>
        </div>
    );
};

export default ProfileCommunicationsTab;