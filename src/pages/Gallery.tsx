
import React from "react";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import GalleryImageCard from "@/components/GalleryImageCard";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { downloadImage } from "@/utils/galleryUtils";

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const { images, loading } = useGalleryImages();
  
  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      await downloadImage(imageUrl, filename);
    } catch (error) {
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
              <GalleryImageCard
                key={item.id}
                original={item.original}
                generated={item.generated}
                index={index}
                onDownload={handleDownload}
              />
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
