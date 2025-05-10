
/**
 * Utility function for generating images using OpenAI's API
 */

// Function to analyze image with GPT-4o (vision capabilities)
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

// OpenAI integration for image generation
export async function generateImageWithOpenAI(imageBase64: string, apiKey: string): Promise<string> {
  try {
    // Step 1: Use GPT-4o to analyze the image and create a detailed description
    const imageDescription = await analyzeImageWithGPT4o(imageBase64, apiKey);
    
    // Step 2: Use the description to generate a new image with DALL-E-3
    const prompt = `Create a realistic version of this child's drawing: ${imageDescription}. Make it look photorealistic while keeping the spirit and elements of the original drawing.`;
    
    // Call OpenAI API using DALL-E-3 model for image generation
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3", // Using DALL-E-3 for image generation
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DALL-E API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // Return the generated image URL
    return data.data[0].url;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}
