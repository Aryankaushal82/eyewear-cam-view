
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import * as faceapi from 'face-api.js';

interface EyewearModelProps {
  faceLandmarks: faceapi.FaceLandmarks68 | null;
}

const EyewearModel: React.FC<EyewearModelProps> = ({ faceLandmarks }) => {
  const { scene } = useGLTF('/src/assets/eyewear.gltf');
  const modelRef = useRef<THREE.Group>(null);
  const targetPosition = useRef(new THREE.Vector3(0, 0, -0.5));
  const targetRotation = useRef(new THREE.Euler(0, 0, 0));
  
  // Get the camera from Three.js context
  const { camera } = useThree();
  
  // Clone the model to avoid modifying the original
  useEffect(() => {
    if (modelRef.current) {
      // Apply initial position and scale
      modelRef.current.position.set(0, 0, -0.5);
      modelRef.current.scale.set(0.1, 0.1, 0.1);
    }
  }, []);

  // Update model position and rotation based on face landmarks
  useFrame(() => {
    if (!modelRef.current) return;
    
    if (faceLandmarks) {
      // Get important face points (eyes and nose)
      const leftEye = faceLandmarks.getLeftEye();
      const rightEye = faceLandmarks.getRightEye();
      const nose = faceLandmarks.getNose();
      
      if (leftEye.length > 0 && rightEye.length > 0 && nose.length > 0) {
        // Calculate center point between eyes
        const leftEyeCenter = calculateCenter(leftEye);
        const rightEyeCenter = calculateCenter(rightEye);
        const eyeCenter = {
          x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
          y: (leftEyeCenter.y + rightEyeCenter.y) / 2
        };
        
        // Calculate distance between eyes for scale
        const eyeDistance = Math.sqrt(
          Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + 
          Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
        );
        
        // Normalize coordinates to WebGL space (-1 to 1)
        const normalizedX = (eyeCenter.x - 0.5) * 2;
        const normalizedY = -(eyeCenter.y - 0.5) * 2;
        
        // Calculate face rotation based on eye and nose positions
        const faceAngle = Math.atan2(
          rightEyeCenter.y - leftEyeCenter.y,
          rightEyeCenter.x - leftEyeCenter.x
        );
        
        // Set target position and rotation
        targetPosition.current = new THREE.Vector3(
          normalizedX * 0.5,
          normalizedY * 0.3,
          -0.5
        );
        
        targetRotation.current = new THREE.Euler(
          0,
          0,
          faceAngle * 0.5
        );
        
        // Calculate scale based on distance between eyes
        const scale = Math.max(0.05, eyeDistance * 0.0035);
        
        // Apply smooth interpolation to model position, rotation and scale
        modelRef.current.position.lerp(targetPosition.current, 0.1);
        
        // Smoothly interpolate rotation (Euler angles don't support lerp)
        modelRef.current.rotation.x += (targetRotation.current.x - modelRef.current.rotation.x) * 0.1;
        modelRef.current.rotation.y += (targetRotation.current.y - modelRef.current.rotation.y) * 0.1;
        modelRef.current.rotation.z += (targetRotation.current.z - modelRef.current.rotation.z) * 0.1;
        
        // Smoothly interpolate scale
        modelRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      }
    } else {
      // Reset to default position when no face is detected
      modelRef.current.position.lerp(new THREE.Vector3(0, 0, -0.5), 0.1);
      modelRef.current.rotation.x += (0 - modelRef.current.rotation.x) * 0.1;
      modelRef.current.rotation.y += (0 - modelRef.current.rotation.y) * 0.1;
      modelRef.current.rotation.z += (0 - modelRef.current.rotation.z) * 0.1;
    }
  });
  
  // Helper function to calculate center point of a group of points
  const calculateCenter = (points: faceapi.Point[]) => {
    const sumX = points.reduce((sum, point) => sum + point.x, 0);
    const sumY = points.reduce((sum, point) => sum + point.y, 0);
    return { 
      x: sumX / points.length / window.innerWidth,
      y: sumY / points.length / window.innerHeight
    };
  };
  
  return (
    <primitive 
      ref={modelRef} 
      object={scene.clone()} 
    />
  );
};

export default EyewearModel;
