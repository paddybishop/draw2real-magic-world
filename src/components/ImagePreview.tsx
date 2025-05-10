
import React from "react";

interface ImagePreviewProps {
  capturedImage: string | null;
  isGenerating: boolean;
  loadingDots: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ capturedImage, isGenerating, loadingDots }) => {
  return (
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-8 border-white shadow-xl mb-8">
      {capturedImage && (
        <img 
          src={capturedImage} 
          alt="Captured drawing" 
          className="w-full h-full object-cover"
        />
      )}
      
      {isGenerating && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
          <div className="flex space-x-2 mb-4">
            <div className="w-4 h-4 bg-draw-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-4 h-4 bg-draw-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-4 h-4 bg-draw-turquoise rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <div className="w-4 h-4 bg-draw-purple rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
          </div>
          <p className="text-white text-lg">Creating magic{loadingDots}</p>
        </div>
      )}
      
      {/* Drawing gears animation when loading */}
      {isGenerating && (
        <>
          <div className="absolute -top-10 -left-10 w-20 h-20 opacity-50">
            <div className="w-full h-full border-8 border-draw-pink rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 opacity-50">
            <div className="w-full h-full border-8 border-draw-turquoise rounded-full animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }}></div>
          </div>
          <div className="absolute top-1/2 -right-8 w-16 h-16 opacity-50">
            <div className="w-full h-full border-8 border-draw-yellow rounded-full animate-spin" style={{ animationDuration: '6s' }}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImagePreview;
