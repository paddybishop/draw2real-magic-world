import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      return new Response(JSON.stringify({
        error: 'No image data provided'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    console.log("Received image data, processing with OpenAI APIs");
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({
        error: "OPENAI_API_KEY is not set in environment variables"
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Extract base64 data without prefix if it exists
    let base64Image = imageData;
    if (base64Image.startsWith('data:')) {
      base64Image = base64Image.split(',')[1];
    }

    // First use GPT-4V to analyze the drawing
    console.log("Analyzing image with GPT-4o...");
    const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
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
              {
                type: "text",
                text: "Describe this drawing in detail to help DALL-E transform it into a realistic image:"
              },
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
      })
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("GPT-4V API error:", errorText);
      return new Response(JSON.stringify({
        error: `GPT-4V API error: ${errorText}`
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const visionData = await visionResponse.json();
    const generatedPrompt = visionData.choices[0].message.content.trim();
    console.log("Generated prompt:", generatedPrompt);

    // Then use DALL-E with the analyzed prompt
    console.log("Generating image with DALL-E using the analyzed prompt...");
    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: generatedPrompt,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      })
    });

    if (!openaiRes.ok) {
      const errorDetails = await openaiRes.text();
      console.error("OpenAI API error:", errorDetails);
      return new Response(JSON.stringify({
        error: `OpenAI API error: ${errorDetails}`
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const data = await openaiRes.json();
    if (!data || !data.data || !data.data[0]?.url) {
      console.error("No image URL returned from OpenAI");
      return new Response(JSON.stringify({
        error: "No image URL returned from OpenAI"
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const openaiImageUrl = data.data[0].url;
    console.log("Successfully generated OpenAI image URL:", openaiImageUrl);

    // **NEW:** Download the image from OpenAI within the edge function
    console.log("Downloading image from OpenAI within edge function...");
    const imageResponse = await fetch(openaiImageUrl);
    
    if (!imageResponse.ok) {
      console.error("Failed to download image from OpenAI within edge function:", imageResponse.status, imageResponse.statusText);
      return new Response(JSON.stringify({
        error: "Failed to download image from OpenAI"
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Read the image data as ArrayBuffer and convert to base64
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    
    // **FIX:** Replace call stack overflowing btoa conversion
    // const generatedImageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));
    const bytes = new Uint8Array(imageArrayBuffer);
    let binaryString = "";
    for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
    }
    const generatedImageBase64 = btoa(binaryString);
    
    console.log("Successfully downloaded and converted image to base64.");

    // Return the base64 image data and prompt
    return new Response(JSON.stringify({
      generatedImageBase64: generatedImageBase64,
      prompt: generatedPrompt
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Error in generate-image function:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});
