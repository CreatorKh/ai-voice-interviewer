
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, OnboardingData, ProfileData } from '../types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  profileData: ProfileData | null;
  login: (data: OnboardingData) => void;
  loginAsMockUser: () => void;
  logout: () => void;
  updateProfileData: (data: Partial<ProfileData>) => void;

  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  
  isLoginChoiceOpen: boolean;
  openLoginChoice: () => void;
  closeLoginChoice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "khurshid.creator@gmail.com";

const MOCK_USER: User = {
  name: "Khursid Khusanboev",
  email: ADMIN_EMAIL,
  picture: `https://i.pravatar.cc/150?u=${ADMIN_EMAIL}`,
};

const MOCK_PROFILE_DATA: ProfileData = {
    fullName: 'Khursid Khusanboev',
    email: ADMIN_EMAIL,
    phone: '+1 (332) 23',
    city: 'Ts',
    country: 'Uzbekistan',
    linkedin: 'https://linkedin.com/in/khursid-khusanboev',
    hasNoLinkedIn: false,
    resume: null,
    summary: 'Experienced software engineer with a passion for building scalable web applications and working with modern technologies.',
    education: [
        { school: 'TUIT', degree: 'Bachelors', field: 'Computer Science', gpa: '3.9' }
    ],
    experience: [
        { company: 'Microsoft', role: 'Software Engineer', startYear: '2020', endYear: '2023', city: 'San Francisco', country: 'United States of America', description: 'At Microsoft, I collaborated with...' }
    ],
    availability: 'immediately',
    preferredTimeCommitment: '40',
    timezone: 'America/New_York',
    workingHours: [
        { day: 'Monday', available: true, from: '09:00am', to: '05:00pm' },
        { day: 'Tuesday', available: true, from: '09:00am', to: '05:00pm' },
        { day: 'Wednesday', available: true, from: '09:00am', to: '05:00pm' },
        { day: 'Thursday', available: true, from: '09:00am', to: '05:00pm' },
        { day: 'Friday', available: true, from: '09:00am', to: '05:00pm' },
        { day: 'Saturday', available: false, from: '', to: '' },
        { day: 'Sunday', available: false, from: '', to: '' },
    ],
    domainInterests: ['Software Engineering', 'Design', 'Science'],
    otherInterests: '',
    minExpectedCompensationFT: 120000,
    minExpectedCompensationPT: 60,
    commChannels: { email: true, sms: false },
    opportunityTypes: { fullTime: true, partTime: true, referral: false },
    general: { jobOpportunities: true, productUpdates: false },
    unsubscribeAll: false,
    avatar: null,
    generativeProfilePictures: true,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoginChoiceOpen, setIsLoginChoiceOpen] = useState(false);

  const login = (data: OnboardingData) => {
    const newUser: User = {
      name: data.fullName,
      email: data.email,
      picture: `https://i.pravatar.cc/150?u=${data.email}`,
    };
    
    // Map onboarding data to profile data
    const newProfileData: ProfileData = {
        ...MOCK_PROFILE_DATA, // Start with mock data as a base
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        country: data.country,
        linkedin: data.linkedin,
        hasNoLinkedIn: data.hasNoLinkedIn,
        resume: data.resume,
        education: data.education,
        experience: data.experience,
        summary: '',
    };

    setUser(newUser);
    setProfileData(newProfileData);
    setIsAdmin(newUser.email === ADMIN_EMAIL);
    closeOnboarding();
  };
  
  const loginAsMockUser = () => {
    setUser(MOCK_USER);
    setProfileData(MOCK_PROFILE_DATA);
    setIsAdmin(MOCK_USER.email === ADMIN_EMAIL);
    closeLoginChoice();
  };

  const logout = () => {
    setUser(null);
    setProfileData(null);
    setIsAdmin(false);
  };
  
  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData(prev => prev ? { ...prev, ...data } : null);
  };

  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  const openLoginChoice = () => setIsLoginChoiceOpen(true);
  const closeLoginChoice = () => setIsLoginChoiceOpen(false);

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAdmin,
        profileData,
        login, 
        loginAsMockUser,
        logout, 
        updateProfileData,
        isOnboardingOpen, 
        openOnboarding, 
        closeOnboarding,
        isLoginChoiceOpen,
        openLoginChoice,
        closeLoginChoice
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};