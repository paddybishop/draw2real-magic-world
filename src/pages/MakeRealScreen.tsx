
import React from "react";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import ApiKeyInput from "@/components/ApiKeyInput";
import ImagePreview from "@/components/ImagePreview";
import { useImageGeneration } from "@/hooks/useImageGeneration";

const MakeRealScreen: React.FC = () => {
  const {
    capturedImage,
    isGenerating,
    loadingDots,
    apiKeyInput,
    setApiKeyInput,
    showApiKeyInput,
    handleMakeReal
  } = useImageGeneration();
  
  return (
    <Layout title="Make It Real" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        <ImagePreview 
          capturedImage={capturedImage} 
          isGenerating={isGenerating} 
          loadingDots={loadingDots}
        />
        
        {showApiKeyInput && (
          <ApiKeyInput 
            apiKeyInput={apiKeyInput} 
            setApiKeyInput={setApiKeyInput} 
          />
        )}
        
        <PrimaryButton
          color="purple"
          size="large"
          className="animate-bounce-light w-64"
          onClick={handleMakeReal}
          disabled={isGenerating || (showApiKeyInput && !apiKeyInput)}
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
