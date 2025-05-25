import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import CreditsDisplay from "./CreditsDisplay";

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
  const { user, signInWithGoogle, signOut } = useAuth();

  const goBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Please try signing in again",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "Please try signing out again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`min-h-screen bg-draw-background p-4 flex flex-col ${className}`}>
      {/* Profile Section */}
      <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
        <CreditsDisplay />
        
        {user ? (
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
            {user.user_metadata?.avatar_url && (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium text-gray-700">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-draw-purple hover:text-draw-pink transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Sign In</span>
          </button>
        )}
      </div>

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
