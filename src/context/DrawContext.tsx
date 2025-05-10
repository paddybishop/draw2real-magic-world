
import React, { createContext, useContext, useState } from "react";

interface DrawContextType {
  capturedImage: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
  setCapturedImage: (image: string | null) => void;
  setGeneratedImage: (image: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  resetImages: () => void;
}

const DrawContext = createContext<DrawContextType | undefined>(undefined);

export const DrawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const resetImages = () => {
    setCapturedImage(null);
    setGeneratedImage(null);
    setIsGenerating(false);
  };

  return (
    <DrawContext.Provider value={{
      capturedImage,
      generatedImage,
      isGenerating,
      setCapturedImage,
      setGeneratedImage,
      setIsGenerating,
      resetImages
    }}>
      {children}
    </DrawContext.Provider>
  );
};

export const useDrawContext = (): DrawContextType => {
  const context = useContext(DrawContext);
  if (!context) {
    throw new Error("useDrawContext must be used within a DrawProvider");
  }
  return context;
};
