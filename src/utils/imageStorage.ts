
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
 * Uploads a base64 image to Supabase storage
 * @param base64Image - The base64-encoded image data
 * @param fileName - The name to give the file in storage
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export const uploadImageToStorage = async (base64Image: string, fileName: string): Promise<string | null> => {
  try {
    console.log(`Uploading image to Supabase storage: ${fileName}`);
    
    // Ensure the bucket exists before trying to upload
    await ensureStorageBucketExists();
    
    // Convert base64 to blob
    let imageData = base64Image;
    if (base64Image.startsWith('data:')) {
      imageData = base64Image.split(',')[1];
    }
    
    const binaryImageData = atob(imageData);
    const array = new Uint8Array(binaryImageData.length);
    for (let i = 0; i < binaryImageData.length; i++) {
      array[i] = binaryImageData.charCodeAt(i);
    }
    const blob = new Blob([array], { type: 'image/png' });
    
    // Upload to Supabase storage with public access
    const { data, error } = await supabase
      .storage
      .from('generated-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('generated-images')
      .getPublicUrl(fileName);
      
    console.log("Uploaded successfully, public URL:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading to storage:", error);
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
