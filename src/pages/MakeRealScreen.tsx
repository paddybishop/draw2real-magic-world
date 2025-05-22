import React from "react";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import ImagePreview from "@/components/ImagePreview";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

const MakeRealScreen: React.FC = () => {
  const {
    capturedImage,
    isGenerating,
    loadingDots,
    handleMakeReal
  } = useImageGeneration();
  
  const { user, signInWithGoogle } = useAuth();
  
  const handleMakeRealWithAuth = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
        handleMakeReal();
      } catch (error) {
        toast({
          title: "Authentication Failed",
          description: "Please try signing in again",
          variant: "destructive"
        });
      }
      return;
    }
    
    handleMakeReal();
  };
  
  return (
    <Layout title="Make It Real" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        <ImagePreview 
          capturedImage={capturedImage} 
          isGenerating={isGenerating} 
          loadingDots={loadingDots}
        />
        
        {isGenerating && (
          <p className="text-sm text-gray-600 italic text-center">
            This could take up to 20 seconds as our AI analyzes your drawing and creates magic...
          </p>
        )}
        
        {!user && (
          <p className="text-sm text-gray-600 text-center">
            Sign in with Google to turn your drawing into a realistic image
          </p>
        )}
        
        <PrimaryButton
          color="purple"
          size="large"
          className="animate-bounce-light w-64"
          onClick={handleMakeRealWithAuth}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span>Working on it...</span>
          ) : !user ? (
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="8" width="20" height="8" rx="2" ry="2"/>
                <rect x="2" y="16" width="8" height="6" rx="2" ry="2"/>
                <rect x="14" y="16" width="8" height="6" rx="2" ry="2"/>
                <path d="m22 8-4-4H6L2 8"/>
                <path d="M18 2h2a2 2 0 0 1 2 2v4"/>
                <path d="M4 2h2a2 2 0 0 1 2 2v4"/>
              </svg>
              Make Real
            </div>
          )}
        </PrimaryButton>
      </div>
    </Layout>
  );
};

export default MakeRealScreen;
