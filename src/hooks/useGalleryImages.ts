
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureStorageBucketExists } from "@/utils/imageStorage";
import { toast } from "@/components/ui/use-toast";

export interface GalleryImage {
  id: string;
  original: string;
  generated: string;
  prompt?: string;
  createdAt: string;
}

export const useGalleryImages = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchImages();
  }, []);
  
  const fetchImages = async () => {
    try {
      setLoading(true);
      
      // Ensure the bucket exists
      await ensureStorageBucketExists();
      
      // Fetch images from the generated-images bucket
      const { data: imageData, error } = await supabase
        .storage
        .from('generated-images')
        .list();
        
      if (error) {
        console.error("Error listing images:", error);
        throw error;
      }
      
      console.log("Image data from storage:", imageData);
      
      // Process the image data to create gallery items
      if (imageData && imageData.length > 0) {
        // Sort by creation time (most recent first)
        const sortedImages = imageData
          .filter(item => !item.name.startsWith('.'))
          .sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        
        // Group files by timestamp to match originals with generated images
        const generatedImages = sortedImages.filter(item => item.name.startsWith('generated-'));
        const originalImages = sortedImages.filter(item => item.name.startsWith('original-'));
        
        console.log("Found generated images:", generatedImages.length);
        console.log("Found original images:", originalImages.length);
        
        // Create pairs of original and generated images
        const imagePairs: GalleryImage[] = [];
        
        for (const genImage of generatedImages) {
          // Create a public URL for the generated image
          const { data: genPublicUrlData } = supabase
            .storage
            .from('generated-images')
            .getPublicUrl(genImage.name);
            
          // Extract timestamp from filename (format: generated-{timestamp}.png)
          const timestamp = genImage.name.replace('generated-', '').replace('.png', '');
          
          // Find matching original image
          const originalImage = originalImages.find(img => img.name === `original-${timestamp}.png`);
          let originalUrl = "";
          
          if (originalImage) {
            // Get public URL for original image
            const { data: origPublicUrlData } = supabase
              .storage
              .from('generated-images')
              .getPublicUrl(originalImage.name);
              
            originalUrl = origPublicUrlData.publicUrl;
          }
          
          // Add to image pairs
          imagePairs.push({
            id: genImage.id || `image-${timestamp}`,
            generated: genPublicUrlData.publicUrl,
            original: originalUrl,
            createdAt: genImage.created_at,
            prompt: "" // We don't have prompt data stored yet
          });
        }
        
        setImages(imagePairs);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { images, loading, fetchImages };
};
