import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDrawContext } from "@/context/DrawContext";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/context/CreditsContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadImageToStorage, blobToBase64 } from "@/utils/imageStorage";

export function useImageGeneration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits, deductCredit } = useCredits();
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

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate images",
        variant: "destructive"
      });
      navigate("/auth/prompt");
      return;
    }

    // Check if user has credits
    if (credits <= 0) {
      toast({
        title: "No Credits",
        description: "You need credits to generate images. Purchase more to continue.",
        variant: "destructive"
      });
      navigate("/premium");
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      console.log("Starting image generation process");
      
      // Deduct credit first
      const creditDeducted = await deductCredit();
      if (!creditDeducted) {
        throw new Error("Failed to deduct credit");
      }

      // First, save the original drawing to storage using the edge function
      const timestamp = new Date().getTime();
      const originalFileName = `original-${timestamp}.png`;
      const generatedFileName = `generated-${timestamp}.png`;
      
      // Upload the original drawing using the uploadDrawing edge function
      console.log("Uploading original drawing via uploadDrawing edge function");
      const originalImageUrl = await uploadImageToStorage(capturedImage, originalFileName, true);
      
      if (!originalImageUrl) {
        console.warn("Could not upload original drawing, but will continue with generation");
      } else {
        console.log("Original drawing saved:", originalImageUrl);
      }
      
      // Pass the captured image to the makeReal function
      console.log("Calling makeReal function with the drawing data");
      
      const { data, error } = await supabase.functions.invoke<{
        generatedImageBase64: string;
        prompt?: string;
        error?: string;
      }>('makeReal', {
        body: { 
          imageData: capturedImage,
        },
      });
      
      console.log("Edge function response received:");
      console.dir({ data, error });
      
      if (error) {
        throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('Edge function returned no data');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check for expected data in the response
      if (!data || !data.generatedImageBase64) {
        console.error("Unexpected data structure from makeReal edge function:", data);
        throw new Error("No valid image data returned from the server");
      }
      
      // Extract base64 data and prompt from the response
      const generatedImageBase64 = data.generatedImageBase64;
      const generatedPrompt = data.prompt;
      
      console.log("Generated image data received from makeReal.");
      
      if (generatedPrompt) {
        console.log("Generated prompt:", generatedPrompt);
        setGeneratedPrompt(generatedPrompt);
      }
      
      // Now store the generated image base64 using uploadDrawing edge function
      try {
        // Store the generated image using the uploadDrawing edge function with retry logic
        console.log(`Uploading generated image base64 via uploadDrawing edge function with filename: ${generatedFileName}`);
        let storedGeneratedImageUrl = null;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!storedGeneratedImageUrl && retryCount < maxRetries) {
          try {
            storedGeneratedImageUrl = await uploadImageToStorage(generatedImageBase64, generatedFileName, false);
            if (!storedGeneratedImageUrl) {
              retryCount++;
              if (retryCount < maxRetries) {
                console.log(`Retry ${retryCount} of ${maxRetries} for image upload`);
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
              }
            }
          } catch (retryError) {
            console.error(`Retry ${retryCount + 1} failed:`, retryError);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }
        
        if (!storedGeneratedImageUrl) {
          throw new Error("Failed to store generated image after multiple attempts");
        }
        
        console.log("Generated image stored successfully:", storedGeneratedImageUrl);
        setGeneratedImage(storedGeneratedImageUrl);
        
        // Store the image metadata in the database with retry logic - NOW INCLUDING user_id
        let dbError = null;
        retryCount = 0;
        
        while (retryCount < maxRetries) {
          const { error } = await supabase
            .from('generated_images')
            .insert({
              user_id: user.id, // This was missing before!
              original_image_url: originalImageUrl || '',
              generated_image_url: storedGeneratedImageUrl,
              prompt: generatedPrompt,
              created_at: new Date().toISOString()
            });
            
          if (error) {
            console.error(`Database insert attempt ${retryCount + 1} failed:`, error);
            dbError = error;
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          } else {
            dbError = null;
            break;
          }
        }
        
        if (dbError) {
          console.error("Failed to store image metadata after multiple attempts:", dbError);
        }
        
        console.log("Images stored:", { 
          originalImageUrl, 
          storedGeneratedImageUrl
        });
        
        // Continue with the flow
        setIsGenerating(false);
        navigate("/result");
        
      } catch (storageError) {
        console.error("Error storing generated image:", storageError);
        setGenerationError(storageError instanceof Error ? storageError.message : "Failed to store generated image");
        setIsGenerating(false);
        
        toast({
          title: "Storage Failed",
          description: "The image was generated but couldn't be saved. Please try again.",
          variant: "destructive"
        });
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

  // Admin test function (only for specific user)
  const handleMakeRealTest = async () => {
    if (!user || user.email !== 'paddybishop@gmail.com') {
      toast({
        title: "Unauthorized",
        description: "This feature is only available to administrators",
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
      // Simulate generation without API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use the captured image as the "generated" image for testing
      setGeneratedImage(capturedImage);
      setGeneratedPrompt("Test generation - no API call made");
      
      toast({
        title: "Test Generation Complete",
        description: "Admin test completed without using credits or API calls",
      });
      
      setIsGenerating(false);
      navigate("/result");
    } catch (error) {
      console.error("Error in test generation:", error);
      setGenerationError("Test generation failed");
      setIsGenerating(false);
    }
  };

  return {
    capturedImage,
    isGenerating,
    loadingDots,
    handleMakeReal,
    handleMakeRealTest,
    credits
  };
}
