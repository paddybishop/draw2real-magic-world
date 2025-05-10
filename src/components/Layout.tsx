
import React from "react";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backPath?: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton = false, 
  backPath = "/", 
  className = "" 
}) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`min-h-screen bg-draw-background p-4 flex flex-col ${className}`}>
      <header className="relative flex items-center justify-center py-4">
        {showBackButton && (
          <button 
            onClick={goBack} 
            className="absolute left-1 p-2 rounded-full bg-white shadow-md hover:shadow-lg"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-draw-purple">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        )}
        {title && (
          <div className="squiggle-border from-draw-pink via-draw-turquoise to-draw-yellow">
            <h1 className="font-bold text-2xl text-center">{title}</h1>
          </div>
        )}
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center relative">
        {children}
      </main>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-draw-yellow opacity-20" />
        <div className="absolute bottom-20 right-5 w-24 h-24 rounded-full bg-draw-turquoise opacity-20" />
        <div className="absolute top-1/2 left-4 w-10 h-10 rounded-full bg-draw-pink opacity-20" />
        <div className="absolute bottom-40 left-1/4 w-14 h-14 rounded-full bg-draw-purple opacity-20" />
        <div className="absolute top-32 right-10 w-12 h-12 rounded-full bg-draw-blue opacity-20" />
      </div>
    </div>
  );
};

export default Layout;
