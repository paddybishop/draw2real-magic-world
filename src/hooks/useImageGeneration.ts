
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDrawContext } from "@/context/DrawContext";
import { toast } from "@/hooks/use-toast";
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
      
      // First, upload the captured image to Supabase Storage to get a public URL
      const imageBlob = await fetch(capturedImage).then(r => r.blob());
      const timestamp = new Date().getTime();
      const filePath = `original-drawings/drawing-${timestamp}.jpg`;
      
      // Ensure the bucket exists before uploading
      try {
        console.log("Checking if 'generated-images' bucket exists");
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'generated-images');
        
        if (!bucketExists) {
          console.log("Creating 'generated-images' bucket with public access");
          const { error: createBucketError } = await supabase.storage.createBucket('generated-images', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
          
          if (createBucketError) {
            throw new Error(`Failed to create storage bucket: ${createBucketError.message}`);
          }
        }
      } catch (bucketError) {
        console.error("Error managing bucket:", bucketError);
        // Continue with upload attempt even if bucket check/creation fails
      }
      
      console.log("Uploading original drawing to Supabase Storage");
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('generated-images')
        .upload(filePath, imageBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });
        
      if (uploadError) {
        throw new Error(`Failed to upload drawing: ${uploadError.message}`);
      }
      
      // Get public URL of the uploaded image
      const { data: publicUrlData } = supabase
        .storage
        .from('generated-images')
        .getPublicUrl(filePath);
      
      const publicImageUrl = publicUrlData.publicUrl;
      console.log("Drawing uploaded, public URL:", publicImageUrl);
      
      // Call the makeReal Edge Function with the public URL
      console.log("Calling makeReal function with the drawing URL");
      const { data, error } = await supabase.functions.invoke<{
        imageUrl: string;
        prompt: string;
        error?: string;
      }>('makeReal', {
        body: { imageUrl: publicImageUrl },
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
      console.log("Generated prompt:", generatedPrompt);
      
      // Store the generated prompt
      if (generatedPrompt) {
        setGeneratedPrompt(generatedPrompt);
      }
      
      // Fetch the image
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
