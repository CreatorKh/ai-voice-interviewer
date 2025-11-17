import React from 'react';

const MercorLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM4 8.24L12 12.5L20 8.24V15.76L12 20L4 15.76V8.24Z"/>
    </svg>
);

export default MercorLogo;