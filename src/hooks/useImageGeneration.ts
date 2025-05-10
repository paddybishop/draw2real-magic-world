
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
      console.log("Image data length:", capturedImage.length);
      
      // Generate image using Supabase Edge Function
      const generatedImageUrl = await generateImageWithOpenAI(capturedImage);
      
      console.log("Image generation successful, URL received:", !!generatedImageUrl);
      
      if (!generatedImageUrl) {
        throw new Error("No image URL returned from the server");
      }
      
      // Handle the response from our edge function
      if (generatedImageUrl.startsWith('http')) {
        // Fetch the image and convert to base64
        console.log("Fetching image from URL:", generatedImageUrl.substring(0, 50) + "...");
        try {
          const response = await fetch(generatedImageUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          
          const blob = await response.blob();
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            console.log("Image successfully loaded as base64");
            setGeneratedImage(base64data);
            setIsGenerating(false);
            navigate("/result");
          };
        } catch (fetchError) {
          console.error("Error fetching generated image:", fetchError);
          throw new Error(`Error fetching image: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        }
      } else {
        // Already in base64 format
        console.log("Image already in base64 format");
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

  return {
    capturedImage,
    isGenerating,
    loadingDots,
    handleMakeReal
  };
}
