
import React from "react";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useNavigate } from "react-router-dom";

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  
  // In a real app, this would come from a database or storage
  const sampleImages = [
    {
      original: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
      generated: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e"
    },
    {
      original: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      generated: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07"
    },
    {
      original: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb",
      generated: "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
    }
  ];
  
  return (
    <Layout title="Gallery" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        {sampleImages.length === 0 ? (
          <div className="text-center p-8">
            <h3 className="text-xl font-bold mb-2">No images yet!</h3>
            <p className="text-gray-500 mb-4">Your gallery is empty. Take photos of your drawings to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 w-full">
            {sampleImages.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex">
                  <div className="w-1/2 aspect-square">
                    <img 
                      src={item.original} 
                      alt={`Original drawing ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
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
