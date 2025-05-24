import React from "react";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import ImagePreview from "@/components/ImagePreview";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const MakeRealScreen: React.FC = () => {
  const {
    capturedImage,
    isGenerating,
    loadingDots,
    handleMakeReal
  } = useImageGeneration();
  
  const navigate = useNavigate();

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
        
        <PrimaryButton
          color="purple"
          size="large"
          className="animate-bounce-light w-64"
          onClick={handleMakeReal}
          disabled={isGenerating}
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
      </div>
    </Layout>
  );
};

export default MakeRealScreen;
