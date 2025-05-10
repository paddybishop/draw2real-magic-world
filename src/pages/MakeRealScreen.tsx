
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useDrawContext } from "@/context/DrawContext";
import { toast } from "@/components/ui/use-toast";

// OpenAI integration for image generation
async function generateImageWithOpenAI(imageBase64: string): Promise<string> {
  try {
    // Extract the base64 data (remove the prefix like "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(',')[1];
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using gpt-4o which supports vision and image generation
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transform this child's drawing into a realistic image. Keep the same colors and style but make it look like a real photograph. Return only the image, no text."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        response_format: { type: "image_url" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // Return the generated image URL
    return data.data[0].url;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}

const MakeRealScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    capturedImage, 
    setGeneratedImage, 
    setIsGenerating, 
    isGenerating, 
    setGenerationError 
  } = useDrawContext();
  const [loadingDots, setLoadingDots] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(!import.meta.env.VITE_OPENAI_API_KEY);

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
  
  const handleMakeReal = async () => {
    if (!capturedImage) return;
    
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      // Use the API key from environment or from user input
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || apiKeyInput;
      
      if (!apiKey) {
        throw new Error("OpenAI API key is required");
      }
      
      // Store API key in session storage for this session only
      if (apiKeyInput) {
        sessionStorage.setItem("openai_api_key", apiKeyInput);
      }

      // Temporary local override for development
      const tempApiKey = sessionStorage.getItem("openai_api_key");
      if (tempApiKey) {
        (window as any).tempOpenAIKey = tempApiKey;
      }
      
      // Generate the image
      const generatedImageUrl = await generateImageWithOpenAI(capturedImage);
      
      // Convert remote URL to base64 if needed
      if (generatedImageUrl.startsWith('http')) {
        // Fetch the image and convert to base64
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setGeneratedImage(base64data);
          setIsGenerating(false);
          navigate("/result");
        };
      } else {
        // Already in base64 format
        setGeneratedImage(generatedImageUrl);
        setIsGenerating(false);
        navigate("/result");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setGenerationError(error instanceof Error ? error.message : "Failed to generate image");
      setIsGenerating(false);
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    }
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
        
        {showApiKeyInput && (
          <div className="w-full mb-4">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">OpenAI API Key Required</h3>
              <p className="text-sm text-gray-600 mb-3">
                Enter your OpenAI API key to transform your drawing. 
                The key will only be stored for this session.
              </p>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border rounded-md mb-2"
              />
              <p className="text-xs text-gray-500">
                Your API key is only used for this request and is never stored on our servers.
              </p>
            </div>
          </div>
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
