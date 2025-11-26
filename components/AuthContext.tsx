import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, OnboardingData, ProfileData } from '../types';

export type UserRole = 'candidate' | 'hirer';

interface HirerData {
  companyName: string;
  position: string;
  email: string;
}

interface AuthContextType {
  // Common
  user: User | null;
  userRole: UserRole | null;
  isAdmin: boolean;
  logout: () => void;
  
  // Candidate specific
  profileData: ProfileData | null;
  login: (data: OnboardingData) => void;
  loginAsMockUser: () => void;
  updateProfileData: (data: Partial<ProfileData>) => void;
  
  // Hirer specific
  hirerData: HirerData | null;
  loginAsHirer: (data: HirerData) => void;
  loginAsMockHirer: () => void;

  // Modals
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  
  isLoginChoiceOpen: boolean;
  openLoginChoice: () => void;
  closeLoginChoice: () => void;
  
  isHirerLoginOpen: boolean;
  openHirerLogin: () => void;
  closeHirerLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "khurshid.creator@gmail.com";

const MOCK_USER: User = {
  name: "Khursid Khusanboev",
  email: ADMIN_EMAIL,
  picture: `https://i.pravatar.cc/150?u=${ADMIN_EMAIL}`,
};

const MOCK_HIRER: User = {
  name: "HR Manager",
  email: "hr@windai.com",
  picture: `https://i.pravatar.cc/150?u=hr@windai.com`,
};

const MOCK_HIRER_DATA: HirerData = {
  companyName: "Wind AI",
  position: "HR Manager",
  email: "hr@windai.com",
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [hirerData, setHirerData] = useState<HirerData | null>(null);
  
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoginChoiceOpen, setIsLoginChoiceOpen] = useState(false);
  const [isHirerLoginOpen, setIsHirerLoginOpen] = useState(false);

  // Load saved session
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole | null;
    const savedUser = localStorage.getItem('user');
    const savedHirerData = localStorage.getItem('hirerData');
    
    if (savedRole && savedUser) {
      setUser(JSON.parse(savedUser));
      setUserRole(savedRole);
      if (savedRole === 'hirer' && savedHirerData) {
        setHirerData(JSON.parse(savedHirerData));
      }
    }
  }, []);

  // Candidate login
  const login = (data: OnboardingData) => {
    const newUser: User = {
      name: data.fullName,
      email: data.email,
      picture: `https://i.pravatar.cc/150?u=${data.email}`,
    };
    
    const newProfileData: ProfileData = {
        ...MOCK_PROFILE_DATA,
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
    setUserRole('candidate');
    setProfileData(newProfileData);
    setIsAdmin(newUser.email === ADMIN_EMAIL);
    
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('userRole', 'candidate');
    
    closeOnboarding();
  };
  
  const loginAsMockUser = () => {
    setUser(MOCK_USER);
    setUserRole('candidate');
    setProfileData(MOCK_PROFILE_DATA);
    setIsAdmin(MOCK_USER.email === ADMIN_EMAIL);
    
    localStorage.setItem('user', JSON.stringify(MOCK_USER));
    localStorage.setItem('userRole', 'candidate');
    
    closeLoginChoice();
  };

  // Hirer login
  const loginAsHirer = (data: HirerData) => {
    const newUser: User = {
      name: data.companyName,
      email: data.email,
      picture: `https://i.pravatar.cc/150?u=${data.email}`,
    };
    
    setUser(newUser);
    setUserRole('hirer');
    setHirerData(data);
    setIsAdmin(true); // Hirers have admin-like access
    
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('userRole', 'hirer');
    localStorage.setItem('hirerData', JSON.stringify(data));
    
    closeHirerLogin();
  };
  
  const loginAsMockHirer = () => {
    setUser(MOCK_HIRER);
    setUserRole('hirer');
    setHirerData(MOCK_HIRER_DATA);
    setIsAdmin(true);
    
    localStorage.setItem('user', JSON.stringify(MOCK_HIRER));
    localStorage.setItem('userRole', 'hirer');
    localStorage.setItem('hirerData', JSON.stringify(MOCK_HIRER_DATA));
    
    closeHirerLogin();
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setProfileData(null);
    setHirerData(null);
    setIsAdmin(false);
    
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hirerData');
  };
  
  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData(prev => prev ? { ...prev, ...data } : null);
  };

  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  const openLoginChoice = () => setIsLoginChoiceOpen(true);
  const closeLoginChoice = () => setIsLoginChoiceOpen(false);
  
  const openHirerLogin = () => setIsHirerLoginOpen(true);
  const closeHirerLogin = () => setIsHirerLoginOpen(false);

  return (
    <AuthContext.Provider value={{ 
        user, 
        userRole,
        isAdmin,
        profileData,
        hirerData,
        login, 
        loginAsMockUser,
        loginAsHirer,
        loginAsMockHirer,
        logout, 
        updateProfileData,
        isOnboardingOpen, 
        openOnboarding, 
        closeOnboarding,
        isLoginChoiceOpen,
        openLoginChoice,
        closeLoginChoice,
        isHirerLoginOpen,
        openHirerLogin,
        closeHirerLogin,
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
