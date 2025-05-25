import React from "react";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import ImagePreview from "@/components/ImagePreview";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const MakeRealScreen: React.FC = () => {
  console.log("MakeRealScreen component rendering");
  console.log("MakeRealScreen: capturedImage state on render:", capturedImage ? `data length ${capturedImage.length}` : null);
  const {
    capturedImage,
    isGenerating,
    loadingDots,
    handleMakeReal
  } = useImageGeneration();

  const navigate = useNavigate();

  // If no captured image is available, show a message or redirect
  if (!capturedImage) {
    return (
      <Layout title="Make It Real" showBackButton>
        <div className="w-full max-w-md flex flex-col items-center justify-center gap-4 h-full text-center">
          <p className="text-lg text-gray-600">No drawing found.</p>
          <PrimaryButton onClick={() => navigate('/camera')}>Go to Camera</PrimaryButton>
        </div>
      </Layout>
    );
  }

  // **NEW:** Effect to check for triggerMakeReal flag on mount - keep this for potential redirects after auth
  React.useEffect(() => {
    const trigger = sessionStorage.getItem('triggerMakeReal');
    if (trigger === 'true') {
      sessionStorage.removeItem('triggerMakeReal'); // Consume the flag
      // Delay slightly to ensure state updates before triggering
      const timeoutId = setTimeout(() => {
        // Ensure we have a captured image before triggering
        if (capturedImage) {
           handleMakeReal();
        } else {
           console.warn("Attempted to trigger makeReal after auth, but no captured image found.");
           // Optionally redirect back to camera if no image
           // navigate('/camera'); // We removed this automatic redirect, the conditional render handles it
        }
      }, 100); // Small delay

      return () => clearTimeout(timeoutId);
    }
  }, [handleMakeReal, capturedImage]); // Depend on handleMakeReal and capturedImage

  // --- Authentication Logic ---
  // Add back useAuth hook
  const { user, signInWithGoogle } = useAuth();

  // Add back handleMakeRealWithAuth or modify handleMakeReal to check auth
  // For now, let's modify handleMakeReal to include the auth check
  // The button onClick will remain handleMakeReal

  // Modify the return JSX to conditionally show auth message/button if not authenticated
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

        {/* Authentication check for showing the button/message */}
        {!user && (
          <p className="text-sm text-gray-600 text-center">
            Sign in to turn your drawing into a realistic image and save your creations.
          </p>
        )}

        {user ? (
           // Button is enabled only if user is logged in and not generating
          <PrimaryButton
            color="purple"
            size="large"
            className="animate-bounce-light w-64"
            onClick={handleMakeReal} // Call handleMakeReal directly if authenticated
            disabled={isGenerating || !user} // Disable if generating OR not authenticated
          >
            {isGenerating ? (
              <span>Working on it...</span>
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
        ) : (
           // If not authenticated, show a disabled button or a sign-in message (already have message above)
           // Or perhaps a button that navigates to the auth prompt screen?
           // Let's make the primary button always visible but disabled and with text prompting sign in
           <PrimaryButton
             color="purple"
             size="large"
             className="animate-bounce-light w-64"
             onClick={() => navigate('/auth/prompt')} // Navigate to prompt if clicked while logged out
             disabled={isGenerating || !user} // Disable if generating OR not authenticated
           >
             Sign In to Make Real
           </PrimaryButton>
        )}

      </div>
    </Layout>
  );
};

export default MakeRealScreen;
