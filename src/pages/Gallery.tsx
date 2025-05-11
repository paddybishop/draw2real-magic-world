
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";

interface GalleryImage {
  id: string;
  original: string;
  generated: string;
  prompt?: string;
  createdAt: string;
}

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        
        // Ensure the bucket exists - we do this first
        await ensureBucketExists();
        
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
    
    fetchImages();
  }, []);
  
  // Helper function to ensure the storage bucket exists
  const ensureBucketExists = async () => {
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
    }
  };
  
  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = filename;
      downloadLink.click();
      
      // Clean up
      URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the image",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Layout title="Gallery" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        {loading && (
          <div className="text-center p-8">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your creations...</p>
          </div>
        )}
        
        {!loading && images.length === 0 ? (
          <div className="text-center p-8">
            <h3 className="text-xl font-bold mb-2">No images yet!</h3>
            <p className="text-gray-500 mb-4">Your gallery is empty. Take photos of your drawings to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 w-full">
            {images.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex">
                  {item.original ? (
                    <div className="w-1/2 aspect-square">
                      <img 
                        src={item.original} 
                        alt={`Original drawing ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-1/2 aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
                      <p className="text-sm">Original drawing</p>
                    </div>
                  )}
                  <div className="w-1/2 aspect-square">
                    <img 
                      src={item.generated} 
                      alt={`Generated image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-3 flex justify-end">
                  <PrimaryButton
                    color={index % 2 === 0 ? "turquoise" : "pink"}
                    size="small"
                    onClick={() => downloadImage(item.generated, `generated-drawing-${index + 1}.png`)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Download size={16} />
                      Download
                    </div>
                  </PrimaryButton>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 w-full">
          <PrimaryButton
            color="purple"
            className="w-full"
            onClick={() => navigate("/camera")}
          >
            Create New Drawing
          </PrimaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
