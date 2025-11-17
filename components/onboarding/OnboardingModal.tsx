import React, { useState } from 'react';
import { OnboardingData } from '../../types';
import { useAuth } from '../AuthContext';
import OnboardingStep1Location from './OnboardingStep1Location';
import OnboardingStep2PersonalInfo from './OnboardingStep2PersonalInfo';
import OnboardingStep3Links from './OnboardingStep3Links';
import OnboardingStep4Resume from './OnboardingStep4Resume';
import OnboardingStep5Experience from './OnboardingStep5Experience';
import OnboardingHeader from './OnboardingHeader';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    country: 'Uzbekistan', city: '', fullName: '', email: '', phone: '',
    linkedin: '', hasNoLinkedIn: false, portfolio: '', otherLinks: [],
    otherProfiles: [], resume: null, hasNoResume: false,
    education: [{ school: '', degree: '', field: '', gpa: '' }],
    experience: [{ company: '', role: '', startYear: '', endYear: '', city: '', country: '', description: '' }]
  });
  
  const { login } = useAuth();

  const totalSteps = 5;

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const updateData = (newData: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...newData }));

  const handleSubmit = () => {
    login(data);
  };

  if (!isOpen) return null;

  const getStepTitle = () => {
      switch (currentStep) {
          case 1: return "Welcome to Mercor!";
          case 2: return "Welcome to Mercor!";
          case 3: return "Confirm your information";
          case 4: return "Upload a recent resume or CV";
          case 5: return "Work Experience & Education";
          default: return "";
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-neutral-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <OnboardingHeader
            title={getStepTitle()}
            onClose={onClose}
            onBack={handleBack}
            showBack={currentStep > 1}
        />
        <div className="flex-grow overflow-y-auto p-8">
            {currentStep === 1 && <OnboardingStep1Location data={data} updateData={updateData} onNext={handleNext} />}
            {currentStep === 2 && <OnboardingStep2PersonalInfo data={data} updateData={updateData} onNext={handleNext} />}
            {currentStep === 3 && <OnboardingStep3Links data={data} updateData={updateData} onNext={handleNext} />}
            {currentStep === 4 && <OnboardingStep4Resume data={data} updateData={updateData} onNext={handleNext} />}
            {currentStep === 5 && <OnboardingStep5Experience data={data} updateData={updateData} onSubmit={handleSubmit} />}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;