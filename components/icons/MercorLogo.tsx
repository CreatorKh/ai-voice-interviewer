
import React from 'react';

const MercorLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-6 w-6 ${className}`}>
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.236L19.535 8.5 12 12.764 4.465 8.5 12 4.236zM4 9.695l7 3.5v7.07l-7-3.5V9.695zm9 0v7.07l7-3.5V9.695l-7 3.5z"/>
    </svg>
);

export default MercorLogo;
