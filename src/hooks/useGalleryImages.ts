import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureStorageBucketsExist } from "@/utils/imageStorage";
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
      
      // Fetch images from both original-drawings and generated-images buckets
      console.log("Fetching images from original-drawings bucket...");
      const { data: originalImageData, error: originalError } = await supabase
        .storage
        .from('original-drawings')
        .list();

      if (originalError) {
        console.error("Error listing original images:", originalError);
        throw originalError;
      }

      console.log("Fetching images from generated-images bucket...");
      const { data: generatedImageData, error: generatedError } = await supabase
        .storage
        .from('generated-images')
        .list();

      if (generatedError) {
        console.error("Error listing generated images:", generatedError);
        throw generatedError;
      }
      
      // Combine and process image data
      const allImageData = [...(originalImageData || []), ...(generatedImageData || [])];
      
      console.log("Combined image data count:", allImageData.length);

      // Process the combined image data to create gallery items
      if (allImageData && allImageData.length > 0) {
        // Sort by creation time (most recent first) - using combined data
        const sortedImages = allImageData
          .filter(item => !item.name.startsWith('.'))
          .sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        
        // Separate into original and generated lists again, but from the combined sorted list
        const originalImages = sortedImages.filter(item => item.name.startsWith('original-'));
        const generatedImages = sortedImages.filter(item => item.name.startsWith('generated-') || item.name.includes('generated-image-'));

        console.log("Found original images (after combining):", originalImages.length);
        console.log("Found generated images (after combining):", generatedImages.length);

        const imagePairs: GalleryImage[] = [];
        
        // First, try to create pairs based on timestamp from the original images list
        for (const origImage of originalImages) {
          // Extract timestamp from filename (format: original-{timestamp}.png)
          const timestamp = origImage.name.replace('original-', '').replace('.png', '');
          
          // Get public URL for original image from the correct bucket
          const { data: origPublicUrlData } = supabase
            .storage
            .from('original-drawings') // <-- Get public URL from original-drawings
            .getPublicUrl(origImage.name);
            
          // Look for matching generated image based on timestamp in the generated images list
          const generatedImage = generatedImages.find(img => 
            img.name === `generated-${timestamp}.png` ||
            img.name === `generated-image-${timestamp}.png`
          );
          
          let generatedUrl = "";
          
          if (generatedImage) {
            // Get public URL for generated image from the correct bucket
            const { data: genPublicUrlData } = supabase
              .storage
              .from('generated-images') // <-- Get public URL from generated-images
              .getPublicUrl(generatedImage.name);
              
            generatedUrl = genPublicUrlData.publicUrl;
            
            // Remove this image from generatedImages so we don't process it twice
            // Find index of generatedImage in the generatedImages array
            const genIndex = generatedImages.findIndex(img => img.id === generatedImage.id);
            if (genIndex > -1) {
              generatedImages.splice(genIndex, 1);
            }
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
          
          // Create a public URL for the generated image from its bucket
          const { data: genPublicUrlData } = supabase
            .storage
            .from('generated-images') // <-- Get public URL from generated-images
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
      } else {
         setImages([]); // Set empty if no images found in either bucket
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
