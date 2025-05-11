
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for uploading and managing images in Supabase storage
 */

/**
 * Ensures that the required storage bucket exists
 * @returns Promise that resolves when the bucket check/creation is complete
 */
export const ensureStorageBucketExists = async (): Promise<void> => {
  try {
    console.log("Checking if generated-images bucket exists");
    
    // First, check if the bucket already exists by trying to list it
    const { error: listError } = await supabase
      .storage
      .from('generated-images')
      .list('', { limit: 1 });
      
    // If we can list files, the bucket exists and we're done
    if (!listError) {
      console.log("Bucket already exists");
      return;
    }
    
    // If there's an error other than "Not Found", log it but continue
    if (listError.message !== "The resource was not found") {
      console.error("Unexpected error checking bucket:", listError);
    }
    
    // Try to create the bucket
    console.log("Creating generated-images bucket");
    const { error: createError } = await supabase
      .storage
      .createBucket('generated-images', {
        public: true,
      });
      
    if (createError) {
      console.error("Error creating bucket:", createError);
      if (createError.message.includes("row-level security policy")) {
        // This is likely an RLS issue, but the bucket might already exist
        console.log("RLS policy error, but the bucket might exist already");
      } else {
        throw createError;
      }
    } else {
      console.log("Bucket created successfully");
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    throw error;
  }
};

/**
 * Uploads a base64 image to Supabase storage using the edge function
 * @param base64Image - The base64-encoded image data
 * @param fileName - The name to give the file in storage
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export const uploadImageToStorage = async (base64Image: string, fileName: string): Promise<string | null> => {
  try {
    console.log(`Uploading image to Supabase edge function: ${fileName}`);
    
    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      publicUrl?: string;
      error?: string;
    }>('uploadDrawing', {
      body: { 
        base64Image, 
        fileName 
      },
    });
    
    if (error) {
      console.error("Edge function error:", error);
      return null;
    }
    
    if (!data || !data.success || !data.publicUrl) {
      console.error("Upload failed:", data?.error || "Unknown error");
      return null;
    }
    
    console.log("Upload successful, image URL:", data.publicUrl);
    return data.publicUrl;
    
  } catch (error) {
    console.error("Error uploading to storage via edge function:", error);
    return null;
  }
};

/**
 * Converts a blob to a base64 string
 * @param blob - The blob to convert
 * @returns Promise resolving to the base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = reject;
  });
};
