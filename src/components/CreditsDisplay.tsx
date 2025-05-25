
import React from 'react';
import { useCredits } from '@/context/CreditsContext';
import { useAuth } from '@/context/AuthContext';

const CreditsDisplay: React.FC = () => {
  const { credits, isLoading } = useCredits();
  const { user } = useAuth();

  if (!user || isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-draw-purple">
        <circle cx="12" cy="12" r="10"/>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
        <path d="M12 18V6"/>
      </svg>
      <span className="text-sm font-medium text-gray-700">{credits} credits</span>
    </div>
  );
};

export default CreditsDisplay;
