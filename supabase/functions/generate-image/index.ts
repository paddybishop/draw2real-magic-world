
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    console.log("Received image data, calling OpenAI API");
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not set in environment variables" }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const data = await openaiRes.json();
    
    if (!data || !data.data || !data.data[0]?.url) {
      console.error("No image URL returned from OpenAI");
      return new Response(
        JSON.stringify({ error: "No image URL returned from OpenAI" }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Get the image data as blob
    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);
    
    // Create a Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing");
      
      // Since OpenAI API call was successful, we can return the direct URL instead of failing
      console.log("Returning direct OpenAI image URL instead of storing in Supabase");
      return new Response(
        JSON.stringify({ imageUrl: openaiImageUrl }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Create client with service role key for admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a unique filename
    const filename = `generated-image-${Date.now()}.png`;
    const bucketName = 'generated-images';
    
    console.log(`Uploading image to Supabase Storage bucket '${bucketName}' as ${filename}`);
    
    try {
      // Check if bucket exists and create if needed
      const { data: buckets, error: bucketListError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketListError) {
        console.error("Error listing buckets:", bucketListError);
      } else {
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        
        if (!bucketExists) {
          console.log(`Bucket '${bucketName}' not found, attempting to create it`);
          const { error: createError } = await supabase
            .storage
            .createBucket(bucketName, {
              public: true,
              fileSizeLimit: 5242880 // 5MB
            });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
          } else {
            console.log(`Successfully created bucket '${bucketName}'`);
          }
        } else {
          console.log(`Bucket '${bucketName}' already exists`);
        }
      }
    } catch (bucketError) {
      console.error("Error managing bucket:", bucketError);
      // Continue with upload attempt even if bucket check/creation fails
    }
    
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
      
      // Since OpenAI API call was successful, we can return the direct URL instead of failing
      console.log("Returning direct OpenAI image URL due to storage upload failure");
      return new Response(
        JSON.stringify({ imageUrl: openaiImageUrl }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Error in generate-image function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});
