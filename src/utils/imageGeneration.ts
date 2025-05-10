
/**
 * Utility function for generating images using OpenAI's API via Supabase Edge Functions
 */
import { supabase } from "@/integrations/supabase/client";

// Interface for the response from our Edge Function
interface ImageGenerationResponse {
  imageUrl: string;
  error?: string;
}

// Function that uses Supabase Edge Function to generate images
export async function generateImageWithOpenAI(imageBase64: string): Promise<string> {
  try {
    console.log("Starting image generation with Supabase Edge Function");
    
    // Call the Supabase Edge Function with the image data
    console.log("Invoking generate-image function...");
    const { data, error } = await supabase.functions.invoke<ImageGenerationResponse>('generate-image', {
      body: { imageBase64 },
    });

    console.log("Edge function response received", { data, error });

    if (error) {
      console.error("Supabase Edge Function error:", error);
      throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
    }

    if (!data) {
      console.error("Edge function returned no data");
      throw new Error('Edge function returned no data');
    }

    if (data.error) {
      console.error("Image generation error:", data.error);
      throw new Error(data.error);
    }

    console.log("Image generation successful, URL received:", !!data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}
