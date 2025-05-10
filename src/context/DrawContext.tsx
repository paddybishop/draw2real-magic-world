
import React, { createContext, useContext, useState } from "react";

interface DrawContextType {
  capturedImage: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
  generationError: string | null;
  generatedPrompt: string | null;
  isWatermarkRemoved: boolean;
  setCapturedImage: (image: string | null) => void;
  setGeneratedImage: (image: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGenerationError: (error: string | null) => void;
  setGeneratedPrompt: (prompt: string | null) => void;
  setIsWatermarkRemoved: (isRemoved: boolean) => void;
  resetImages: () => void;
}

const DrawContext = createContext<DrawContextType | undefined>(undefined);

export const DrawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isWatermarkRemoved, setIsWatermarkRemoved] = useState(false);

  const resetImages = () => {
    setCapturedImage(null);
    setGeneratedImage(null);
    setIsGenerating(false);
    setGenerationError(null);
    setGeneratedPrompt(null);
    setIsWatermarkRemoved(false);
  };

  return (
    <DrawContext.Provider value={{
      capturedImage,
      generatedImage,
      isGenerating,
      generationError,
      generatedPrompt,
      isWatermarkRemoved,
      setCapturedImage,
      setGeneratedImage,
      setIsGenerating,
      setGenerationError,
      setGeneratedPrompt,
      setIsWatermarkRemoved,
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
