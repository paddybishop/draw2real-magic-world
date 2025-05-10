
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Received image data, calling OpenAI API");
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not set in environment variables" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI's image generation API (dall-e-3)
    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: "Transform this drawing into a realistic, detailed image. Keep the general concept, layout and colors from the original drawing, but make it look photorealistic.",
        n: 1,
        size: "1024x1024",
        response_format: "url",
      }),
    });

    if (!openaiRes.ok) {
      const errorDetails = await openaiRes.text();
      console.error("OpenAI API error:", errorDetails);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorDetails}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await openaiRes.json();
    
    if (!data || !data.data || !data.data[0]?.url) {
      console.error("No image URL returned from OpenAI");
      return new Response(
        JSON.stringify({ error: "No image URL returned from OpenAI" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiImageUrl = data.data[0].url;
    console.log("Successfully generated OpenAI image URL:", openaiImageUrl);
    
    // Download the image from OpenAI
    console.log("Downloading image from OpenAI...");
    const imageResponse = await fetch(openaiImageUrl);
    
    if (!imageResponse.ok) {
      console.error("Failed to download image from OpenAI:", imageResponse.status, imageResponse.statusText);
      return new Response(
        JSON.stringify({ error: "Failed to download image from OpenAI" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the image data as blob
    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing");
      return new Response(
        JSON.stringify({ error: "Storage configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a unique filename
    const filename = `generated-image-${Date.now()}.png`;
    const bucketName = 'generated-images';
    
    console.log(`Uploading image to Supabase Storage bucket '${bucketName}' as ${filename}`);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filename, imageBytes, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Failed to upload image to storage:", uploadError);
      return new Response(
        JSON.stringify({ error: `Storage upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Successfully uploaded image to Supabase Storage");
    
    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filename);
    
    const imageUrl = publicUrlData.publicUrl;
    console.log("Generated public URL:", imageUrl);
    
    return new Response(
      JSON.stringify({ imageUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-image function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
