import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDrawContext } from "@/context/DrawContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadImageToStorage, blobToBase64 } from "@/utils/imageStorage";
import { useAuth } from "@/context/AuthContext";

export function useImageGeneration() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue",
        variant: "destructive"
      });
      return;
    }

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
      
      // First, save the original drawing to storage using the edge function
      const timestamp = new Date().getTime();
      const originalFileName = `original-${timestamp}.png`;
      const generatedFileName = `generated-${timestamp}.png`;
      
      // Upload the original drawing using the edge function
      console.log("Uploading original drawing via edge function");
      const originalImageUrl = await uploadImageToStorage(capturedImage, originalFileName);
      
      if (!originalImageUrl) {
        console.warn("Could not upload original drawing, but will continue with generation");
      } else {
        console.log("Original drawing saved:", originalImageUrl);
      }
      
      // Pass the captured image to the makeReal function
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
      
      // Now store the generated image
      try {
        // Fetch and upload the generated image
        console.log("Fetching generated image from URL to upload to Supabase");
        const response = await fetch(generatedImageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const base64data = await blobToBase64(blob);
        
        // Store the generated image using the edge function
        console.log(`Uploading generated image via edge function with filename: ${generatedFileName}`);
        const storedGeneratedImageUrl = await uploadImageToStorage(base64data, generatedFileName);
        
        if (!storedGeneratedImageUrl) {
          console.warn("Could not upload generated image to storage, using direct URL");
          setGeneratedImage(generatedImageUrl);
        } else {
          console.log("Generated image stored successfully:", storedGeneratedImageUrl);
          setGeneratedImage(storedGeneratedImageUrl);
        }
        
        console.log("Images stored:", { 
          originalImageUrl, 
          storedGeneratedImageUrl: storedGeneratedImageUrl || generatedImageUrl
        });
        
        // Continue with the flow
        setIsGenerating(false);
        navigate("/result");
        
      } catch (storageError) {
        console.error("Error storing generated image:", storageError);
        // Non-critical error, continue with the flow using the direct URL
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
