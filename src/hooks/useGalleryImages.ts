
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
        
        // Find all generated images (match different possible patterns)
        const generatedImages = sortedImages.filter(item => 
          item.name.startsWith('generated-') ||
          item.name.includes('generated-image-')
        );
        
        // Find all original images
        const originalImages = sortedImages.filter(item => 
          item.name.startsWith('original-')
        );
        
        console.log("Found generated images:", generatedImages.length);
        console.log("Found original images:", originalImages.length);
        
        // Create pairs of original and generated images
        const imagePairs: GalleryImage[] = [];
        
        // First, try to create pairs based on timestamp
        for (const origImage of originalImages) {
          // Extract timestamp from filename (format: original-{timestamp}.png)
          const timestamp = origImage.name.replace('original-', '').replace('.png', '');
          
          // Get public URL for original image
          const { data: origPublicUrlData } = supabase
            .storage
            .from('generated-images')
            .getPublicUrl(origImage.name);
            
          // Look for matching generated image based on timestamp
          const generatedImage = generatedImages.find(img => 
            img.name === `generated-${timestamp}.png` ||
            img.name === `generated-image-${timestamp}.png`
          );
          
          let generatedUrl = "";
          
          if (generatedImage) {
            // Get public URL for generated image
            const { data: genPublicUrlData } = supabase
              .storage
              .from('generated-images')
              .getPublicUrl(generatedImage.name);
              
            generatedUrl = genPublicUrlData.publicUrl;
            
            // Remove this image from generatedImages so we don't process it twice
            generatedImages.splice(generatedImages.indexOf(generatedImage), 1);
          }
          
          // Add to image pairs
          imagePairs.push({
            id: `image-${timestamp}`,
            original: origPublicUrlData.publicUrl,
            generated: generatedUrl,
            createdAt: origImage.created_at,
            prompt: ""
          });
        }
        
        // Add any remaining generated images that don't have a matching original
        for (const genImage of generatedImages) {
          // Extract timestamp from filename
          let timestamp = "";
          if (genImage.name.startsWith('generated-')) {
            // Format: generated-{timestamp}.png
            timestamp = genImage.name.replace('generated-', '').replace('.png', '');
          } else if (genImage.name.includes('generated-image-')) {
            // Format: generated-image-{timestamp}.png
            timestamp = genImage.name.replace('generated-image-', '').replace('.png', '');
          }
          
          // Create a public URL for the generated image
          const { data: genPublicUrlData } = supabase
            .storage
            .from('generated-images')
            .getPublicUrl(genImage.name);
            
          // Add to image pairs (with empty original)
          imagePairs.push({
            id: `image-${timestamp || genImage.id}`,
            original: "", // No matching original
            generated: genPublicUrlData.publicUrl,
            createdAt: genImage.created_at,
            prompt: ""
          });
        }
        
        // Sort final results by timestamp (most recent first)
        imagePairs.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
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
