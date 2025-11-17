import React from 'react';
import { useAuth } from '../AuthContext';
import Button from '../Button';
import ToggleSwitch from '../ToggleSwitch';

const ProfileAccountTab: React.FC = () => {
    const { user, profileData, updateProfileData } = useAuth();
    if (!profileData || !user) return null;

    return (
        <div className="space-y-8 max-w-3xl">
            <section className="space-y-4">
                <h3 className="font-semibold">Account</h3>
                <p className="text-sm text-neutral-400">Update your preference and make your account yours.</p>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-4">
                    <div className="flex items-start gap-4">
                        <img src={user.picture} alt="avatar" className="w-16 h-16 rounded-full bg-neutral-700"/>
                        <div>
                            <h4 className="font-semibold">Change avatar</h4>
                            <p className="text-xs text-neutral-400">JPG, PNG, or GIF. Max size of 5 MB. Files over 500x500 will be compressed.</p>
                            <Button variant="outline" className="mt-2 text-xs py-1 px-3">Upload</Button>
                        </div>
                    </div>
                </div>
                 <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                     <ToggleSwitch
                        label="Generative profile pictures"
                        subLabel="Let Mercor generate a professional photo from your AI interview. Your image will be private and only visible to employers you apply to."
                        isEnabled={profileData.generativeProfilePictures}
                        setIsEnabled={(val) => updateProfileData({ generativeProfilePictures: val })}
                    />
                 </div>
            </section>
            
            <section className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/5">
                <h3 className="font-semibold">Payout preferences</h3>
                <p className="text-sm text-neutral-400">Choose how you want to receive your payouts: Standard or Instant.</p>
                <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 text-sm rounded-lg p-3">
                    Payment method setup required. Finalize your payout method during your acceptance to make payouts.
                </div>
            </section>

             <section className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/5">
                <h3 className="font-semibold">Change email</h3>
                <p className="text-sm text-neutral-400">Transfer all jobs and account-related communications to a new email address.</p>
                <Button variant="outline">Change email</Button>
            </section>
            
            <section className="space-y-4 p-4 rounded-lg border border-red-500/30 bg-red-900/20">
                <h3 className="font-semibold text-red-400">Delete account</h3>
                <p className="text-sm text-neutral-400">Permanently delete the account and all data from the Mercor platform.</p>
                <Button className="!bg-red-600/80 hover:!bg-red-600/100 text-white">Delete account</Button>
            </section>
        </div>
    );
};

export default ProfileAccountTab;