import React, { useState } from 'react';
import ProfileTabNav from './profile/ProfileTabNav';
import ProfileResumeTab from './profile/ProfileResumeTab';
import ProfileAvailabilityTab from './profile/ProfileAvailabilityTab';
import ProfileWorkPreferencesTab from './profile/ProfileWorkPreferencesTab';
import ProfileCommunicationsTab from './profile/ProfileCommunicationsTab';
import ProfileAccountTab from './profile/ProfileAccountTab';
import AdminPanel from './AdminPanel';
import Button from './Button';

export type ProfileTab = 'Resume' | 'Availability' | 'Work Preferences' | 'Communications' | 'Account';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Resume');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Resume':
        return <ProfileResumeTab />;
      case 'Availability':
        return <ProfileAvailabilityTab />;
      case 'Work Preferences':
        return <ProfileWorkPreferencesTab />;
      case 'Communications':
        return <ProfileCommunicationsTab />;
      case 'Account':
        return <ProfileAccountTab />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button
            variant="outline"
            onClick={() => setIsAdminPanelOpen(true)}
            className="text-sm"
          >
            ⚙️ LLM Settings
          </Button>
        </div>
        <ProfileTabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <div>
          {renderTabContent()}
        </div>
      </div>
      {isAdminPanelOpen && (
        <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />
      )}
    </>
  );
};

export default ProfilePage;