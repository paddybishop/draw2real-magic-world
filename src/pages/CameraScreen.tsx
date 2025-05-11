
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
  const [isMounting, setIsMounting] = useState(true);
  
  // Initialize camera on component mount
  useEffect(() => {
    let mounted = true;
    setIsMounting(true);
    
    const initCamera = async () => {
      try {
        console.log("Initializing camera...");
        
        // Stop any existing streams first
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Request camera with reasonable constraints
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        // Only set state if component is still mounted
        if (!mounted) {
          console.log("Component unmounted, cleaning up stream");
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        console.log("Camera stream obtained successfully");
        setStream(mediaStream);
        
        if (videoRef.current) {
          console.log("Setting video source");
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err);
            setCameraError("Error starting video playback");
          });
        }
        
        setIsMounting(false);
      } catch (err) {
        console.error("Camera access error:", err);
        
        if (mounted) {
          setCameraError(err instanceof Error ? err.message : "Failed to access camera");
          setIsMounting(false);
          toast({
            title: "Camera Access Error",
            description: "Could not access your camera. Please check permissions or try uploading an image.",
            variant: "destructive"
          });
        }
      }
    };
    
    // Short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initCamera();
    }, 100);
    
    // Clean up on unmount
    return () => {
      mounted = false;
      clearTimeout(timer);
      
      // Stop all tracks when component unmounts
      if (stream) {
        console.log("Cleaning up camera stream on unmount");
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Handle video element events
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;
    
    const handleCanPlay = () => {
      console.log("Video can play, camera ready");
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
      console.log("Capturing photo from video");
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Could not create image context");
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
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      console.log("Photo captured successfully");
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
    
    console.log("Processing uploaded file:", file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        console.log("File read successful");
        setCapturedImage(event.target.result as string);
        navigate("/preview");
      }
    };
    reader.onerror = () => {
      console.error("Error reading file");
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
          
          {/* Loading indicator */}
          {isMounting && !cameraError && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-draw-pink rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-draw-yellow rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 bg-draw-turquoise rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
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
        
        {/* Camera status indicator */}
        <p className="text-center text-sm font-medium" aria-live="polite">
          {isMounting ? "Initializing camera..." : 
           cameraReady ? "Camera ready" : 
           cameraError ? "Camera unavailable" : "Waiting for camera..."}
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
            disabled={!cameraReady || isMounting}
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
