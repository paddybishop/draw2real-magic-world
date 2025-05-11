
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import Confetti from "@/components/Confetti";
import { useDrawContext } from "@/context/DrawContext";
import { toast } from "@/components/ui/use-toast";
import { Share2 } from "lucide-react";

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
  
  const handleShare = async (mode: 'single' | 'sideBySide') => {
    try {
      // Create a canvas to combine images if in sideBySide mode
      if (mode === 'sideBySide' && capturedImage && generatedImage) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Load the original drawing
        const drawingImg = new Image();
        const promise1 = new Promise<void>((resolve) => {
          drawingImg.onload = () => resolve();
          drawingImg.src = capturedImage;
        });
        
        // Load the generated image
        const generatedImg = new Image();
        const promise2 = new Promise<void>((resolve) => {
          generatedImg.onload = () => resolve();
          generatedImg.src = generatedImage;
        });
        
        // Wait for both images to load
        await Promise.all([promise1, promise2]);
        
        // Set canvas dimensions to fit both images side by side
        canvas.width = drawingImg.width + generatedImg.width;
        canvas.height = Math.max(drawingImg.height, generatedImg.height);
        
        // Draw both images on the canvas
        ctx?.drawImage(drawingImg, 0, 0);
        ctx?.drawImage(generatedImg, drawingImg.width, 0);
        
        // Convert canvas to a data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Share the combined image
        if (navigator.share) {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'draw2real.png', { type: 'image/png' });
          
          await navigator.share({
            title: 'My Drawing Made Real',
            text: 'Check out my drawing transformed with Draw2Real!',
            files: [file]
          });
          
          toast({
            title: "Shared successfully",
            description: "Your side-by-side comparison has been shared.",
          });
        } else {
          // Fallback for browsers that don't support the Web Share API with files
          downloadImage(dataUrl, 'draw2real-comparison.png');
          
          toast({
            title: "Downloaded Comparison",
            description: "Your browser doesn't support sharing files. The image has been downloaded instead.",
          });
        }
      } else if (generatedImage) {
        // Share only the generated image
        if (navigator.share) {
          try {
            // Try to share with files if supported
            const blob = await (await fetch(generatedImage)).blob();
            const file = new File([blob], 'draw2real.png', { type: 'image/png' });
            
            await navigator.share({
              title: 'My Drawing Made Real',
              text: 'Check out my drawing transformed with Draw2Real!',
              files: [file]
            });
          } catch (fileError) {
            // Fallback to sharing URL only (for browsers that support share but not file sharing)
            console.log("File sharing not supported, falling back to URL sharing");
            
            await navigator.share({
              title: 'My Drawing Made Real',
              text: 'Check out my drawing transformed with Draw2Real!',
              url: window.location.href
            });
          }
          
          toast({
            title: "Shared successfully",
            description: "Your image has been shared.",
          });
        } else {
          // Fallback for browsers that don't support the Web Share API
          downloadImage(generatedImage, 'draw2real.png');
          
          toast({
            title: "Downloaded Image",
            description: "Your browser doesn't support sharing. The image has been downloaded instead.",
          });
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing Failed",
        description: "There was an error sharing your image. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to download an image
  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                <Share2 size={20} />
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
              color="purple"
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
