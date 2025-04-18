
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as faceapi from 'face-api.js';
import WebcamFeed from './WebcamFeed';
import FaceTracker from './FaceTracker';
import EyewearModel from './EyewearModel';
import { Card, CardContent } from '@/components/ui/card';

const VirtualTryOn: React.FC = () => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [faceLandmarks, setFaceLandmarks] = useState<faceapi.FaceLandmarks68 | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Handle face landmarks detection
  const handleFaceLandmarks = (landmarks: faceapi.FaceLandmarks68 | null) => {
    setFaceLandmarks(landmarks);
  };

  // Toggle face detection
  const toggleDetecting = () => {
    setIsDetecting(!isDetecting);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          {/* Webcam Feed */}
          <WebcamFeed 
            onVideoRef={setVideoElement} 
            isDetecting={isDetecting}
            onToggleDetecting={toggleDetecting}
          />
          
          {/* Conditional rendering for 3D Canvas */}
          {isDetecting && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <Canvas
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                camera={{ position: [0, 0, 5], fov: 45 }}
              >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={0.5} />
                {/* Eyewear 3D model */}
                <EyewearModel faceLandmarks={faceLandmarks} />
              </Canvas>
            </div>
          )}
          
          {/* Face tracker (logic component) */}
          <FaceTracker 
            videoRef={videoElement}
            isDetecting={isDetecting}
            onFaceLandmarks={handleFaceLandmarks}
          />
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Virtual Eyewear Try-On</h2>
        <p className="text-gray-600">
          Click "Start Tracking" to begin the virtual try-on experience. 
          The app will detect your face and position virtual glasses accordingly.
        </p>
      </div>
    </div>
  );
};

export default VirtualTryOn;
