
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

  // Helper function to upload a base64 image to Supabase storage
  const uploadImageToStorage = async (base64Image: string, fileName: string): Promise<string | null> => {
    try {
      console.log(`Uploading image to Supabase storage: ${fileName}`);
      
      // Convert base64 to blob
      let imageData = base64Image;
      if (base64Image.startsWith('data:')) {
        imageData = base64Image.split(',')[1];
      }
      
      const binaryImageData = atob(imageData);
      const array = new Uint8Array(binaryImageData.length);
      for (let i = 0; i < binaryImageData.length; i++) {
        array[i] = binaryImageData.charCodeAt(i);
      }
      const blob = new Blob([array], { type: 'image/png' });
      
      // Upload to Supabase storage
      const { data, error } = await supabase
        .storage
        .from('generated-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true
        });
        
      if (error) {
        console.error("Storage upload error:", error);
        return null;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('generated-images')
        .getPublicUrl(fileName);
        
      console.log("Uploaded successfully, public URL:", publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error uploading to storage:", error);
      return null;
    }
  };
  
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
      
      // Store images in Supabase storage
      try {
        const timestamp = new Date().getTime();
        const originalFileName = `original-${timestamp}.png`;
        const generatedFileName = `generated-${timestamp}.png`;
        
        // Upload the original drawing
        const originalImageUrl = await uploadImageToStorage(capturedImage, originalFileName);
        
        // Fetch and upload the generated image
        const response = await fetch(generatedImageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const base64data = await blobToBase64(blob);
        
        // Store the generated image in Supabase storage
        const storedGeneratedImageUrl = await uploadImageToStorage(base64data, generatedFileName);
        
        console.log("Images stored in Supabase storage:", { 
          originalImageUrl, 
          storedGeneratedImageUrl 
        });
        
        // Continue with the flow
        setGeneratedImage(base64data);
        setIsGenerating(false);
        navigate("/result");
        
      } catch (storageError) {
        console.error("Error storing images in Supabase:", storageError);
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
