import React from 'react';

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

interface ToggleSwitchProps {
    isEnabled: boolean;
    setIsEnabled: (enabled: boolean) => void;
    label?: string;
    subLabel?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isEnabled, setIsEnabled, label, subLabel }) => {
    return (
        <div className="flex items-start justify-between">
            {label && (
                <div className="pr-4">
                    <label className="font-medium text-sm text-white">{label}</label>
                    {subLabel && <p className="text-xs text-neutral-400">{subLabel}</p>}
                </div>
            )}
            <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-800',
                    isEnabled ? 'bg-cyan-500' : 'bg-neutral-600'
                )}
                aria-pressed={isEnabled}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                    )}
                />
            </button>
        </div>
    );
};

export default ToggleSwitch;
