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

// Keep the analyzeImageWithGPT4o function for reference until the Edge Function is fully implemented
// This function will be moved to the Edge Function
export async function analyzeImageWithGPT4o(imageBase64: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using GPT-4o which has vision capabilities
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing children's drawings. Describe the drawing in great detail including all elements, colors, style, and composition. Your description will be used to generate a realistic version of this drawing."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this child's drawing in detail for image generation:" },
              { 
                type: "image_url", 
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GPT-4o API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
}
