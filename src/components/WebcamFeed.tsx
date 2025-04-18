
import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface WebcamFeedProps {
  onVideoRef: (video: HTMLVideoElement | null) => void;
  isDetecting: boolean;
  onToggleDetecting: () => void;
}

const WebcamFeed: React.FC<WebcamFeedProps> = ({ 
  onVideoRef, 
  isDetecting,
  onToggleDetecting 
}) => {
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    // When the webcam is ready, pass the video element to the parent
    if (webcamRef.current && webcamRef.current.video) {
      onVideoRef(webcamRef.current.video);
    }
    
    return () => {
      onVideoRef(null);
    };
  }, [onVideoRef]);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  return (
    <div className="relative">
      <div className="rounded-lg overflow-hidden shadow-lg">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored={true}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Button
          onClick={onToggleDetecting}
          variant="outline"
          className="bg-white bg-opacity-80 backdrop-blur-sm hover:bg-white"
        >
          {isDetecting ? (
            <>
              <CameraOff className="mr-2 h-4 w-4" />
              Stop Tracking
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Start Tracking
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WebcamFeed;
