
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useDrawContext } from "@/context/DrawContext";
import { Camera, CameraOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import SquigglyHeading from "@/components/SquigglyHeading";

const CameraScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setCapturedImage } = useDrawContext();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraAttempted, setIsCameraAttempted] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing camera...");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const startCamera = async () => {
    setIsCameraAttempted(true);
    try {
      // Try to get the camera with explicit width and height constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        // Set the srcObject to the stream properly
        videoRef.current.srcObject = stream;
        
        // Listen for the loadedmetadata event before playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              setCameraActive(true);
              setLoadingText("Camera Ready!");
            })
            .catch((e) => {
              console.error("Error playing video:", e);
              setCameraError(`Error playing video: ${e instanceof Error ? e.message : "Unknown error"}`);
            });
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(`Camera access error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setLoadingText("Camera failed to load");
      toast({
        title: "Camera Access Error",
        description: "Could not access camera. Please check permissions or try uploading an image instead.",
        variant: "destructive"
      });
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };
  
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
        navigate("/preview");
      }
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          navigate("/preview");
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  useEffect(() => {
    // Add a small delay before starting the camera to ensure DOM is fully loaded
    const timer = setTimeout(() => {
      startCamera();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);
  
  return (
    <Layout title="Take a Photo" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-8 border-white shadow-xl bg-black">
          {cameraActive ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
              {!isCameraAttempted ? (
                <p className="text-white">{loadingText}</p>
              ) : cameraError ? (
                <>
                  <CameraOff className="w-12 h-12 text-draw-pink mb-2" />
                  <SquigglyHeading className="text-white text-xl mb-2">
                    Camera Not Available
                  </SquigglyHeading>
                  <p className="text-white text-sm mb-4">
                    Please use the upload button below to select an image from your device.
                  </p>
                  {cameraError && (
                    <p className="text-red-400 text-xs mt-2">{cameraError}</p>
                  )}
                </>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-draw-yellow animate-pulse mb-2" />
                  <p className="text-white">{loadingText}</p>
                </>
              )}
            </div>
          )}
          
          {/* Drawing frame overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-draw-yellow rounded-tl-3xl"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-draw-pink rounded-tr-3xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-draw-turquoise rounded-bl-3xl"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-draw-purple rounded-br-3xl"></div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4">
          <PrimaryButton
            color="yellow"
            onClick={triggerFileInput}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
                <line x1="16" x2="22" y1="5" y2="5"/>
                <line x1="19" x2="19" y1="2" y2="8"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              Upload Image
            </div>
          </PrimaryButton>
          
          <PrimaryButton 
            color="pink"
            onClick={capturePhoto}
            disabled={!cameraActive}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="3"/>
                <path d="M5 7h2a2 2 0 0 0 2-2 1 1 0 0 1 1-1h4a1 1 0 0 1 1 1 2 2 0 0 0 2 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
              </svg>
              Snap!
            </div>
          </PrimaryButton>
        </div>
        
        <input 
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Layout>
  );
};

export default CameraScreen;
