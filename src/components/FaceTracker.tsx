
import React, { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { useToast } from "@/components/ui/use-toast";
import { loadFaceDetectionModels } from '@/utils/faceUtils';

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
    const initModels = async () => {
      try {
        await loadFaceDetectionModels();
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

    initModels();

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
        try {
          // Detect faces with lower memory footprint options
          const options = new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 320,
            scoreThreshold: 0.5
          });
          
          const detection = await faceapi
            .detectSingleFace(videoRef, options)
            .withFaceLandmarks();

          if (detection) {
            // Extract face landmarks and send to parent component
            onFaceLandmarks(detection.landmarks);
          } else {
            onFaceLandmarks(null);
          }
        } catch (error) {
          console.error("Face detection error:", error);
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
