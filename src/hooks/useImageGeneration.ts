
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDrawContext } from "@/context/DrawContext";
import { toast } from "@/hooks/use-toast";
import { generateImageWithOpenAI } from "@/utils/imageGeneration";

export function useImageGeneration() {
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
      
      if (!apiKey && showApiKeyInput) {
        throw new Error("OpenAI API key is required");
      }
      
      // Store API key in session storage for this session only
      if (apiKeyInput) {
        sessionStorage.setItem("openai_api_key", apiKeyInput);
      }

      // Pass the API key to the generation function (optional with our edge function)
      const generatedImageUrl = await generateImageWithOpenAI(capturedImage, apiKey);
      
      // Handle the response from our edge function
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
        description: error instanceof Error 
          ? error.message 
          : "Failed to generate image. Please try again or check your API key.",
        variant: "destructive"
      });
    }
  };

  return {
    capturedImage,
    isGenerating,
    loadingDots,
    apiKeyInput,
    setApiKeyInput,
    showApiKeyInput,
    handleMakeReal
  };
}
