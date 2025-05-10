
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useDrawContext } from "@/context/DrawContext";

const MakeRealScreen: React.FC = () => {
  const navigate = useNavigate();
  const { capturedImage, setGeneratedImage, setIsGenerating, isGenerating } = useDrawContext();
  const [loadingDots, setLoadingDots] = useState("");

  useEffect(() => {
    if (!capturedImage) {
      navigate("/camera");
    }
  }, [capturedImage, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingDots(prev => prev.length >= 3 ? "" : prev + ".");
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);
  
  const handleMakeReal = () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      // In a real app, this would call an AI service to transform the image
      // For now, we'll just use the original image as a placeholder
      setGeneratedImage(capturedImage);
      setIsGenerating(false);
      navigate("/result");
    }, 3000);
  };
  
  return (
    <Layout title="Make It Real" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-8 border-white shadow-xl mb-8">
          {capturedImage && (
            <img 
              src={capturedImage} 
              alt="Captured drawing" 
              className="w-full h-full object-cover"
            />
          )}
          
          {isGenerating && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
              <div className="flex space-x-2 mb-4">
                <div className="w-4 h-4 bg-draw-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-4 h-4 bg-draw-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-4 h-4 bg-draw-turquoise rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <div className="w-4 h-4 bg-draw-purple rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
              </div>
              <p className="text-white text-lg">Creating magic{loadingDots}</p>
            </div>
          )}
          
          {/* Drawing gears animation when loading */}
          {isGenerating && (
            <>
              <div className="absolute -top-10 -left-10 w-20 h-20 opacity-50">
                <div className="w-full h-full border-8 border-draw-pink rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-24 h-24 opacity-50">
                <div className="w-full h-full border-8 border-draw-turquoise rounded-full animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }}></div>
              </div>
              <div className="absolute top-1/2 -right-8 w-16 h-16 opacity-50">
                <div className="w-full h-full border-8 border-draw-yellow rounded-full animate-spin" style={{ animationDuration: '6s' }}></div>
              </div>
            </>
          )}
        </div>
        
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
