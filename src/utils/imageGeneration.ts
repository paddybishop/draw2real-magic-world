
/**
 * Utility function for generating images using OpenAI's API via Supabase Edge Functions
 */
import { callEdgeFunction } from './supabaseClient';

// Interface for the response from our Edge Function
interface ImageGenerationResponse {
  imageUrl: string;
  error?: string;
}

// Function that uses Supabase Edge Function to generate images
export async function generateImageWithOpenAI(imageBase64: string, apiKey?: string): Promise<string> {
  try {
    // Call the Supabase Edge Function with the image data
    const response = await callEdgeFunction<ImageGenerationResponse>('generate-image', {
      imageBase64,
      apiKey, // This is optional and will be used as fallback if not set in Edge Function secrets
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.imageUrl;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}
