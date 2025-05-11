
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import Confetti from "@/components/Confetti";
import { useDrawContext } from "@/context/DrawContext";
import { toast } from "@/components/ui/use-toast";

const ResultScreen: React.FC = () => {
  const navigate = useNavigate();
  const { capturedImage, generatedImage, generatedPrompt, isWatermarkRemoved, resetImages } = useDrawContext();
  const [showConfetti, setShowConfetti] = useState(true);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  
  useEffect(() => {
    if (!generatedImage) {
      navigate("/camera");
    }
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [generatedImage, navigate]);
  
  const handleMakeAnother = () => {
    resetImages();
    navigate("/camera");
  };
  
  const handleShare = (mode: 'single' | 'sideBySide') => {
    // In a real app, this would implement sharing functionality
    toast({
      title: "Sharing " + (mode === 'single' ? 'image' : 'comparison'),
      description: "This feature would share your " + (mode === 'single' ? 'image' : 'side by side comparison') + " to social media or via messaging.",
    });
  };
  
  const handleMoreOptions = () => {
    navigate("/premium");
  };
  
  const togglePrompt = () => {
    setShowPrompt(!showPrompt);
  };
  
  if (!generatedImage) {
    return null;
  }
  
  return (
    <Layout title="Your Creation" showBackButton>
      {showConfetti && <Confetti />}
      
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        <div className="relative w-full rounded-3xl overflow-hidden border-8 border-white shadow-xl">
          {compareMode ? (
            <div className="flex flex-row">
              <div className="w-1/2 aspect-square">
                <img 
                  src={capturedImage!} 
                  alt="Original drawing" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-1/2 aspect-square">
                <img 
                  src={generatedImage} 
                  alt="Generated image" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="aspect-square">
              <img 
                src={generatedImage} 
                alt="Generated image" 
                className="w-full h-full object-cover"
              />
              
              {/* Watermark - only show if not removed */}
              {!isWatermarkRemoved && (
                <div className="absolute bottom-2 right-2 text-white text-xs font-bold opacity-40 bg-black bg-opacity-30 px-2 py-1 rounded">
                  Draw2Real
                </div>
              )}
            </div>
          )}
        </div>
        
        {showPrompt && generatedPrompt && (
          <div className="w-full p-3 bg-white rounded-lg shadow-md text-sm">
            <h3 className="text-draw-purple font-bold mb-1">AI Prompt:</h3>
            <p className="text-gray-700">{generatedPrompt}</p>
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <div className="flex gap-3">
            <PrimaryButton
              color="turquoise"
              onClick={() => setCompareMode(!compareMode)}
            >
              {compareMode ? "Hide Original" : "Compare"}
            </PrimaryButton>
            
            <PrimaryButton
              color="pink"
              onClick={() => handleShare(compareMode ? 'sideBySide' : 'single')}
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Share
              </div>
            </PrimaryButton>
          </div>
          
          <div className="flex gap-3">
            <PrimaryButton
              color="yellow"
              onClick={handleMakeAnother}
            >
              Make Another
            </PrimaryButton>
            
            <PrimaryButton
              color={showPrompt ? "purple" : "purple"}
              onClick={togglePrompt}
            >
              {showPrompt ? "Hide Prompt" : "Show Prompt"}
            </PrimaryButton>
          </div>
          
          <div className="flex justify-center w-full">
            <PrimaryButton
              color="purple"
              onClick={handleMoreOptions}
            >
              More Options
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResultScreen;
