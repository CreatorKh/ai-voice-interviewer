import React, { useState, useCallback } from 'react';
import { OnboardingData } from '../../types';
import Button from '../Button';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-neutral-500 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>;

const OnboardingStep4Resume: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [resume, setResume] = useState<File | null>(data.resume);
  const [hasNoResume, setHasNoResume] = useState(data.hasNoResume);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ resume, hasNoResume });
    onNext();
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setResume(files[0]);
      setHasNoResume(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, []);
  
  const handleNoResumeChange = (checked: boolean) => {
    setHasNoResume(checked);
    if(checked) {
        setResume(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto text-center">
      <p className="text-neutral-400">Autofill your profile in seconds by uploading your resume</p>
      
      <div className="bg-green-900/50 border border-green-700 text-green-300 text-sm rounded-lg p-3">
        💡 Tip: Hiring managers are more likely to reach out when they see a resume attached
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-900/20' : 'border-neutral-700'} ${hasNoResume ? 'opacity-50' : ''}`}
      >
        <UploadIcon />
        {resume ? (
             <p className="text-white font-semibold">{resume.name}</p>
        ) : (
            <>
                <p className="font-semibold">Drop your resume here</p>
                <p className="text-neutral-400 text-sm">or <label htmlFor="resume-upload" className="text-indigo-400 hover:underline cursor-pointer">browse files</label> on your computer</p>
            </>
        )}
        <p className="text-xs text-neutral-500 mt-2">Supports PDF, up to 3MB</p>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          onChange={e => handleFileChange(e.target.files)}
          className="hidden"
          disabled={hasNoResume}
        />
      </div>

      <div className="flex items-center justify-center gap-2 mt-1">
        <input type="checkbox" id="no-resume" checked={hasNoResume} onChange={e => handleNoResumeChange(e.target.checked)} className="h-4 w-4 rounded bg-neutral-700 border-neutral-600 text-indigo-500 focus:ring-indigo-500"/>
        <label htmlFor="no-resume" className="text-sm text-neutral-400">I don't have a resume</label>
      </div>
      
      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 !text-white !font-bold py-3">
        Next
      </Button>
    </form>
  );
};

export default OnboardingStep4Resume;