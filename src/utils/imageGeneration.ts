
/**
 * Utility function for generating images using OpenAI's API
 */

// OpenAI integration for image generation
export async function generateImageWithOpenAI(imageBase64: string, apiKey: string): Promise<string> {
  try {
    // Extract the base64 data (remove the prefix like "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(',')[1];
    
    // Call OpenAI API using DALL-E-3 model which is designed for image generation
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3", // Using DALL-E-3 for image generation
        prompt: "Transform this child's drawing into a realistic image. Keep the same colors and style but make it look like a real photograph.",
        n: 1,
        size: "1024x1024",
        response_format: "url",
        // The parameter name should be 'image_data' not 'image' for base64 images
        image_data: base64Data, // Use the correct parameter name for base64-encoded image
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // Return the generated image URL
    return data.data[0].url;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}
