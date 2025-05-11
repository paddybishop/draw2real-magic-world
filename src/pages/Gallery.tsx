
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
        
        // Fetch images from the generated-images bucket
        const { data: imageData, error } = await supabase
          .storage
          .from('generated-images')
          .list();
          
        if (error) {
          throw error;
        }
        
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
    
    // Check if the storage bucket exists, and create it if it doesn't
    const checkAndCreateBucket = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error checking buckets:", error);
          return;
        }
        
        const bucketExists = buckets.some(bucket => bucket.name === 'generated-images');
        
        if (!bucketExists) {
          console.log("Creating 'generated-images' bucket");
          const { error: createError } = await supabase.storage.createBucket('generated-images', {
            public: true,
          });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
          } else {
            console.log("Bucket created successfully");
          }
        }
        
        // Now fetch images
        fetchImages();
        
      } catch (error) {
        console.error("Error in bucket check:", error);
        setLoading(false);
      }
    };
    
    checkAndCreateBucket();
  }, []);
  
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
                  >
                    <div className="flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                        <polyline points="16 6 12 2 8 6"/>
                        <line x1="12" y1="2" x2="12" y2="15"/>
                      </svg>
                      Share
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
