
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    console.log("Processing request to makeReal function");
    const { imageData } = await req.json();
    
    if (!imageData) {
      console.error("No image data provided");
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error("API key not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log("Calling OpenAI API to generate image and extract prompt...");
    
    try {
      // Call OpenAI's GPT-4V first to analyze the image and create a detailed prompt
      console.log("First step: Analyzing image with GPT-4o...");
      
      // Remove data URL prefix if present to get just the base64 data
      let base64Image = imageData;
      if (base64Image.startsWith('data:')) {
        base64Image = base64Image.split(',')[1];
      }
      
      // Call GPT-4V to analyze the drawing
      const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a visual AI assistant helping a child turn their crayon drawing into a realistic image using AI. Look at the image carefully and describe it in a vivid, concrete sentence that includes: creature type, body parts, colours, pose, and background. Focus on what DALL·E 3 needs to recreate the drawing accurately. Respond with one detailed prompt only — no preamble or follow-up."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Describe this drawing in detail to help DALL-E transform it into a realistic image:" },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        }),
      });

      if (!visionResponse.ok) {
        const errorText = await visionResponse.text();
        console.error("GPT-4V API error:", errorText);
        return new Response(
          JSON.stringify({ error: `GPT-4V API error: ${errorText}` }),
          { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const visionData = await visionResponse.json();
      console.log("GPT-4V analysis received");
      
      const generatedPrompt = visionData.choices[0].message.content.trim();
      console.log("Generated prompt:", generatedPrompt);
      
      // Now use DALL-E to generate an image based on the prompt
      console.log("Second step: Generating image with DALL-E using the analyzed prompt...");
      const dallEResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: generatedPrompt,
          n: 1,
          size: "1024x1024",
          response_format: "url",
        }),
      });

      if (!dallEResponse.ok) {
        const errorText = await dallEResponse.text();
        console.error("DALL-E API error:", errorText);
        return new Response(
          JSON.stringify({ error: `DALL-E API error: ${errorText}` }),
          { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const dallEData = await dallEResponse.json();
      console.log("DALL-E response received");
      
      const imageUrl = dallEData.data[0]?.url;
      const prompt = generatedPrompt;

      if (!imageUrl) {
        console.error("No image URL returned from DALL-E");
        return new Response(
          JSON.stringify({ error: "No image URL returned from DALL-E" }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      console.log("Successfully generated image with DALL-E");
      console.log("Image URL:", imageUrl);

      return new Response(
        JSON.stringify({ imageUrl, prompt }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200 
        }
      );
    } catch (openaiError) {
      console.error("Error calling OpenAI:", openaiError.message);
      return new Response(
        JSON.stringify({ 
          error: "Error calling OpenAI API", 
          details: openaiError.message 
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500 
        }
      );
    }
    
  } catch (error) {
    console.error("General error:", error.message);
    return new Response(
      JSON.stringify({ 
        error: "Error processing request", 
        details: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});
