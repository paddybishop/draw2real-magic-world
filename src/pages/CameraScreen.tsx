
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useDrawContext } from "@/context/DrawContext";
import { Camera, CameraOff, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const CameraScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setCapturedImage } = useDrawContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Initialize camera on component mount
  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      try {
        // Get user media with camera
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        // Only set state if component is still mounted
        if (mounted) {
          setStream(mediaStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.error("Camera access error:", err);
        
        if (mounted) {
          setCameraError(err instanceof Error ? err.message : "Failed to access camera");
          toast({
            title: "Camera Access Error",
            description: "Could not access your camera. Please check permissions or try uploading an image.",
            variant: "destructive"
          });
        }
      }
    };
    
    initCamera();
    
    // Clean up on unmount
    return () => {
      mounted = false;
      
      // Stop all tracks when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Handle video element events
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;
    
    const handleCanPlay = () => {
      setCameraReady(true);
    };
    
    const handleError = (e: Event) => {
      console.error("Video element error:", e);
      setCameraReady(false);
      setCameraError("Video playback error");
    };
    
    // Add event listeners
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("error", handleError);
    
    // Clean up
    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("error", handleError);
    };
  }, []);
  
  const capturePhoto = () => {
    if (!videoRef.current || !cameraReady) return;
    
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast({
          title: "Capture Error",
          description: "Could not create image context",
          variant: "destructive"
        });
        return;
      }
      
      // Draw video frame to canvas
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convert to data URL
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      navigate("/preview");
    } catch (err) {
      console.error("Error capturing photo:", err);
      toast({
        title: "Capture Failed",
        description: "Could not capture image from camera",
        variant: "destructive"
      });
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedImage(event.target.result as string);
        navigate("/preview");
      }
    };
    reader.onerror = () => {
      toast({
        title: "Upload Failed",
        description: "Could not read the selected file",
        variant: "destructive"
      });
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Layout title="Take a Photo" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-8 border-white shadow-xl bg-black">
          {/* Camera view or error state */}
          {cameraError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <CameraOff className="w-12 h-12 text-draw-pink mb-2" />
              <h3 className="text-white text-xl mb-2">Camera Not Available</h3>
              <p className="text-white text-sm mb-4">
                {cameraError}. Please use the upload button below.
              </p>
            </div>
          ) : (
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              id="camera"
            />
          )}
          
          {/* Drawing frame overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-draw-yellow rounded-tl-3xl"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-draw-pink rounded-tr-3xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-draw-turquoise rounded-bl-3xl"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-draw-purple rounded-br-3xl"></div>
          </div>
        </div>
        
        {/* Camera status indicator */}
        <p className="text-center text-sm font-medium" aria-live="polite">
          {cameraReady ? "Camera ready" : cameraError ? "Camera unavailable" : "Initializing camera..."}
        </p>
        
        {/* Action buttons */}
        <div className="flex gap-4 mt-2">
          <PrimaryButton
            color="yellow"
            onClick={triggerFileInput}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload size={20} />
              Upload Image
            </div>
          </PrimaryButton>
          
          <PrimaryButton 
            color="pink"
            onClick={capturePhoto}
            disabled={!cameraReady}
          >
            <div className="flex items-center justify-center gap-2">
              <Camera size={20} />
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
