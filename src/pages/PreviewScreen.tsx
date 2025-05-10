
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useDrawContext } from "@/context/DrawContext";

const PreviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const { capturedImage, setCapturedImage } = useDrawContext();
  
  React.useEffect(() => {
    // If there's no captured image, redirect to camera screen
    if (!capturedImage) {
      navigate("/camera");
    }
  }, [capturedImage, navigate]);
  
  const handleRetake = () => {
    setCapturedImage(null);
    navigate("/camera");
  };
  
  const handleUseDrawing = () => {
    navigate("/make-real");
  };
  
  if (!capturedImage) {
    return null;
  }
  
  return (
    <Layout title="Preview" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-8 border-white shadow-xl">
          <img 
            src={capturedImage} 
            alt="Captured drawing" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex gap-4 mt-4">
          <PrimaryButton
            color="turquoise"
            onClick={handleRetake}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
              Retake
            </div>
          </PrimaryButton>
          
          <PrimaryButton
            color="pink"
            onClick={handleUseDrawing}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
              Use This Drawing
            </div>
          </PrimaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default PreviewScreen;
