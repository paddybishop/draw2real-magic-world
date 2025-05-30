import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { base64Image, fileName, bucketName } = await req.json();
    
    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!bucketName) {
      return new Response(
        JSON.stringify({ error: 'No bucket name provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    console.log("Received image data for upload:", {
      fileName: fileName || "unnamed-file.png",
      bucketName,
      imageDataLength: base64Image.length
    });
    
    // Create a Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Create client with service role key for admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate a name if not provided
    const outputFileName = fileName || `drawing-${Date.now()}.png`;
    // Use the bucket name from the request, default to generated-images if not provided
    const targetBucket = bucketName || 'generated-images';
    
    // Extract base64 data without prefix if it exists
    let imageData = base64Image;
    if (base64Image.startsWith('data:')) {
      imageData = base64Image.split(',')[1];
    }
    
    // Decode base64 to bytes
    const binaryImageData = atob(imageData);
    const array = new Uint8Array(binaryImageData.length);
    for (let i = 0; i < binaryImageData.length; i++) {
      array[i] = binaryImageData.charCodeAt(i);
    }
    
    console.log(`Uploading image to bucket '${targetBucket}' as ${outputFileName}`);
    
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketListError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketListError) {
        console.error("Error listing buckets:", bucketListError);
      } else {
        const bucketExists = buckets?.some((bucket)=>bucket.name === targetBucket);
        
        if (!bucketExists) {
          console.log(`Creating bucket '${targetBucket}'`);
          const { error: createError } = await supabase
            .storage
            .createBucket(targetBucket, { public: true });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
          } else {
            console.log(`Successfully created bucket '${targetBucket}'`);
          }
        } else {
          console.log(`Bucket '${targetBucket}' already exists`);
        }
      }
    } catch (bucketError) {
      console.error("Error managing bucket:", bucketError);
      // Continue with upload attempt
    }
    
    // Upload file to storage
    console.log(`Attempting to upload to bucket '${targetBucket}'`);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(targetBucket)
      .upload(outputFileName, array, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(targetBucket)
      .getPublicUrl(outputFileName);
    
    console.log("Upload successful:", {
      bucket: targetBucket,
      fileName: outputFileName,
      publicUrl: publicUrlData.publicUrl
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        fileName: outputFileName,
        publicUrl: publicUrlData.publicUrl,
        bucket: targetBucket
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
    
  } catch (error) {
    console.error("Error in uploadDrawing function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
