
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Missing image data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Received base64 image data");

    // Step 1: Ask GPT-4o to look at the image and generate a DALL·E-style prompt
    console.log("Sending image to GPT-4o for analysis...");
    const visionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this drawing in a fun and imaginative way so I can make a realistic version using AI. Make sure to capture all the details of the drawing.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!visionRes.ok) {
      const errText = await visionRes.text();
      console.error('GPT-4o error:', errText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyse drawing' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const visionData = await visionRes.json();
    const generatedPrompt = visionData.choices?.[0]?.message?.content?.trim();
    console.log("Generated prompt:", generatedPrompt);

    if (!generatedPrompt) {
      return new Response(
        JSON.stringify({ error: 'No prompt generated from image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Send the generated prompt to DALL·E
    console.log("Sending prompt to DALL-E for image generation...");
    const imageRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: generatedPrompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      }),
    });

    if (!imageRes.ok) {
      const errText = await imageRes.text();
      console.error('DALL·E error:', errText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate image' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageData = await imageRes.json();
    const generatedImageUrl = imageData.data?.[0]?.url;
    console.log("Received DALL-E image URL:", generatedImageUrl ? "success" : "failed");

    if (!generatedImageUrl) {
      return new Response(
        JSON.stringify({ error: 'No image URL returned from DALL·E' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return both the prompt and the direct image URL from OpenAI
    // This avoids storing in Supabase storage which is causing RLS issues
    return new Response(
      JSON.stringify({ 
        imageUrl: generatedImageUrl, 
        prompt: generatedPrompt 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
