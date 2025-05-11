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
  const [status, setStatus] = useState("Loading camera...");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Function to poll for the video element to exist in the DOM
  const waitForVideoElement = (callback: () => void) => {
    console.log("Starting to poll for video element");
    
    const checkElement = () => {
      const videoElement = document.getElementById('camera');
      
      if (videoElement) {
        console.log("Video element found in DOM");
        callback();
        return;
      }
      
      console.log("Video element not found, polling...");
      setTimeout(checkElement, 100); // Check every 100ms
    };
    
    checkElement();
  };
  
  const startCamera = async () => {
    // Make sure we're attempting camera access
    setIsCameraAttempted(true);
    setStatus("Requesting camera access...");
    
    waitForVideoElement(async () => {
      // Verify video element exists
      if (!videoRef.current) {
        console.error("Video element is not available in the DOM");
        setCameraError("Video element not found");
        setStatus("Error: Camera element missing");
        toast({
          title: "Camera Error",
          description: "Camera element is not available. Please try refreshing the page.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        // Try to get the camera with explicit width and height constraints
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        // Double check that videoRef is still valid when we get the stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            // Move play() inside onloadedmetadata to match the HTML structure provided
            videoRef.current?.play()
              .then(() => {
                console.log("Video playback started");
                setStatus("Camera ready!");
                setCameraActive(true);
              })
              .catch(playError => {
                console.error("Error playing video:", playError);
                setStatus(`Error starting video: ${playError instanceof Error ? playError.message : "Unknown error"}`);
              });
          };
        } else {
          throw new Error("Video element became unavailable");
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError(`Camera access error: ${err instanceof Error ? err.message : "Unknown error"}`);
        setStatus(`Camera access failed: ${err instanceof Error ? err.message : "Unknown error"}`);
        toast({
          title: "Camera Access Error",
          description: "Could not access camera. Please check permissions or try uploading an image instead.",
          variant: "destructive"
        });
      }
    });
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
        setCameraActive(false);
        setStatus("Camera stopped");
        console.log("Camera successfully stopped");
      } catch (error) {
        console.error("Error stopping camera:", error);
      }
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
    console.log("CameraScreen mounted, initializing camera");
    
    // Start camera initialization when component mounts
    startCamera();
    
    return () => {
      console.log("CameraScreen unmounting, stopping camera");
      stopCamera();
    };
  }, []);
  
  return (
    <Layout title="Take a Photo" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
        <p className="text-center text-sm font-medium mb-2" aria-live="polite" id="status">{status}</p>
        
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-8 border-white shadow-xl bg-black">
          {cameraActive ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              id="camera"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
              {!isCameraAttempted ? (
                <p className="text-white">{status}</p>
              ) : cameraError ? (
                <>
                  <CameraOff className="w-12 h-12 text-draw-pink mb-2" />
                  <SquigglyHeading className="text-white text-xl mb-2">
                    Camera Not Available
                  </SquigglyHeading>
                  <p className="text-white text-sm mb-4">
                    Please use the upload button below to select an image from your device.
                  </p>
                </>
              ) : (
                <>
                  <Camera className="w-12 h-12 text-draw-yellow animate-pulse mb-2" />
                  <p className="text-white">{status}</p>
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
