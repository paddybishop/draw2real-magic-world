
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDrawContext } from "@/context/DrawContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useImageGeneration() {
  const navigate = useNavigate();
  const { 
    capturedImage, 
    setGeneratedImage, 
    setIsGenerating, 
    isGenerating, 
    setGenerationError,
    setGeneratedPrompt
  } = useDrawContext();
  const [loadingDots, setLoadingDots] = useState("");

  // Only redirect if not on camera page and there's no captured image
  useEffect(() => {
    if (!capturedImage && location.pathname !== "/camera") {
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
    if (!capturedImage) {
      toast({
        title: "No Image",
        description: "Please capture an image first",
        variant: "destructive"
      });
      navigate("/camera");
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      console.log("Starting image generation process");
      
      // Pass the captured image directly to the makeReal function
      console.log("Calling makeReal function with the drawing data");
      
      const { data, error } = await supabase.functions.invoke<{
        imageUrl: string;
        prompt?: string;
        error?: string;
      }>('makeReal', {
        body: { imageData: capturedImage },
      });
      
      console.log("Edge function response received", { data, error });
      
      if (error) {
        throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('Edge function returned no data');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const generatedImageUrl = data.imageUrl;
      const generatedPrompt = data.prompt;
      
      if (!generatedImageUrl) {
        throw new Error("No image URL returned from the server");
      }
      
      console.log("Image generation successful, URL received:", generatedImageUrl.substring(0, 50) + "...");
      
      if (generatedPrompt) {
        console.log("Generated prompt:", generatedPrompt);
        setGeneratedPrompt(generatedPrompt);
      }
      
      // Fetch the generated image
      try {
        const response = await fetch(generatedImageUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const base64data = await blobToBase64(blob);
        
        console.log("Image successfully loaded as base64");
        setGeneratedImage(base64data);
        setIsGenerating(false);
        navigate("/result");
        
      } catch (fetchError) {
        console.error("Error fetching generated image:", fetchError);
        
        // As a fallback, try to use the direct URL if we couldn't convert to base64
        console.log("Attempting to use direct URL as fallback");
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
          : "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper function to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
    });
  };

  return {
    capturedImage,
    isGenerating,
    loadingDots,
    handleMakeReal
  };
}
