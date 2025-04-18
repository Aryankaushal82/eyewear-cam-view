
import React, { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { useToast } from "@/components/ui/use-toast";

interface FaceTrackerProps {
  videoRef: HTMLVideoElement | null;
  isDetecting: boolean;
  onFaceLandmarks: (landmarks: faceapi.FaceLandmarks68 | null) => void;
}

const FaceTracker: React.FC<FaceTrackerProps> = ({ 
  videoRef, 
  isDetecting, 
  onFaceLandmarks 
}) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const requestRef = useRef<number>();
  const { toast } = useToast();

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load models from public folder
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        setModelsLoaded(true);
        toast({
          title: "Face Models Loaded",
          description: "Face tracking is ready to use",
        });
      } catch (error) {
        console.error("Failed to load face detection models:", error);
        toast({
          title: "Error",
          description: "Failed to load face detection models",
          variant: "destructive"
        });
      }
    };

    loadModels();

    // Clean up animation frame on unmount
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [toast]);

  // Face detection loop
  useEffect(() => {
    if (!videoRef || !modelsLoaded || !isDetecting) {
      onFaceLandmarks(null);
      return;
    }

    const detectFace = async () => {
      if (videoRef && videoRef.readyState === 4) {
        // Detect faces
        const detection = await faceapi
          .detectSingleFace(videoRef, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detection) {
          // Extract face landmarks and send to parent component
          onFaceLandmarks(detection.landmarks);
        } else {
          onFaceLandmarks(null);
        }
      }

      requestRef.current = requestAnimationFrame(detectFace);
    };

    detectFace();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [videoRef, modelsLoaded, isDetecting, onFaceLandmarks]);

  return null; // This is a logic-only component
};

export default FaceTracker;
