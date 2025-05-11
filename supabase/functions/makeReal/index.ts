
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
      // Call OpenAI's DALL-E to generate the image
      const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: "You are a visual AI assistant helping a child turn their crayon drawing into a realistic image using AI. Look at the image carefully and describe it in a vivid, concrete sentence that includes: creature type, body parts, colours, pose, and background. Focus on what DALL·E 3 needs to recreate the drawing accurately. Respond with one detailed prompt only — no preamble or follow-up.",
          n: 1,
          size: "1024x1024",
          response_format: "url",
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error("OpenAI API error:", errorText);
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${errorText}` }),
          { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const openaiData = await openaiResponse.json();
      console.log("OpenAI response received:", JSON.stringify(openaiData).substring(0, 200) + "...");
      
      const imageUrl = openaiData.data[0]?.url;
      const prompt = openaiData.data[0]?.revised_prompt || "";

      if (!imageUrl) {
        console.error("No image URL returned from OpenAI");
        return new Response(
          JSON.stringify({ error: "No image URL returned from OpenAI" }),
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
