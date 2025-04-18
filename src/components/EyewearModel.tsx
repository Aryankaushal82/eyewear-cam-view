
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import * as faceapi from 'face-api.js';

interface EyewearModelProps {
  faceLandmarks: faceapi.FaceLandmarks68 | null;
}

const EyewearModel: React.FC<EyewearModelProps> = ({ faceLandmarks }) => {
  const [modelError, setModelError] = useState<string | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  const targetPosition = useRef(new THREE.Vector3(0, 0, -0.5));
  const targetRotation = useRef(new THREE.Euler(0, 0, 0));
  
  // Instead of loading external GLTF, create a simple glasses mesh
  const { camera } = useThree();
  
  // Create simple glasses mesh on mount
  useEffect(() => {
    if (modelRef.current) {
      try {
        // Clear any previous children
        while (modelRef.current.children.length > 0) {
          modelRef.current.remove(modelRef.current.children[0]);
        }
        
        // Create simple glasses frame
        const frameMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x222222, 
          roughness: 0.5, 
          metalness: 0.8 
        });
        
        // Create left lens frame
        const leftFrame = new THREE.Mesh(
          new THREE.TorusGeometry(0.3, 0.05, 16, 32),
          frameMaterial
        );
        leftFrame.position.set(-0.4, 0, 0);
        leftFrame.rotation.x = Math.PI / 2;
        
        // Create right lens frame
        const rightFrame = new THREE.Mesh(
          new THREE.TorusGeometry(0.3, 0.05, 16, 32),
          frameMaterial
        );
        rightFrame.position.set(0.4, 0, 0);
        rightFrame.rotation.x = Math.PI / 2;
        
        // Create bridge
        const bridge = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8),
          frameMaterial
        );
        bridge.rotation.z = Math.PI / 2;
        
        // Add lenses
        const lensMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x6688cc,
          transmission: 0.9,
          opacity: 0.3,
          transparent: true,
          roughness: 0.1
        });
        
        const leftLens = new THREE.Mesh(
          new THREE.CircleGeometry(0.25, 32),
          lensMaterial
        );
        leftLens.position.set(-0.4, 0, 0.02);
        
        const rightLens = new THREE.Mesh(
          new THREE.CircleGeometry(0.25, 32),
          lensMaterial
        );
        rightLens.position.set(0.4, 0, 0.02);
        
        // Add temples (arms)
        const leftTemple = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.04, 0.04),
          frameMaterial
        );
        leftTemple.position.set(-0.7, 0, -0.1);
        leftTemple.rotation.y = Math.PI / 4;
        
        const rightTemple = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.04, 0.04),
          frameMaterial
        );
        rightTemple.position.set(0.7, 0, -0.1);
        rightTemple.rotation.y = -Math.PI / 4;
        
        // Add all parts to the group
        modelRef.current.add(leftFrame);
        modelRef.current.add(rightFrame);
        modelRef.current.add(bridge);
        modelRef.current.add(leftLens);
        modelRef.current.add(rightLens);
        modelRef.current.add(leftTemple);
        modelRef.current.add(rightTemple);
        
        // Apply initial position and scale
        modelRef.current.position.set(0, 0, -0.5);
        modelRef.current.scale.set(0.5, 0.5, 0.5);
      } catch (error) {
        console.error("Error creating glasses model:", error);
        setModelError("Failed to create glasses model");
      }
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
        const normalizedX = (eyeCenter.x / window.innerWidth - 0.5) * 2;
        const normalizedY = -(eyeCenter.y / window.innerHeight - 0.5) * 2;
        
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
        const scale = Math.max(0.2, eyeDistance * 0.0035);
        
        // Apply smooth interpolation to model position, rotation and scale
        modelRef.current.position.lerp(targetPosition.current, 0.1);
        
        // Smoothly interpolate rotation
        modelRef.current.rotation.x += (targetRotation.current.x - modelRef.current.rotation.x) * 0.1;
        modelRef.current.rotation.y += (targetRotation.current.y - modelRef.current.rotation.y) * 0.1;
        modelRef.current.rotation.z += (targetRotation.current.z - modelRef.current.rotation.z) * 0.1;
        
        // Smoothly interpolate scale
        const targetScale = new THREE.Vector3(scale, scale, scale);
        modelRef.current.scale.lerp(targetScale, 0.1);
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
      x: sumX / points.length,
      y: sumY / points.length
    };
  };
  
  return (
    <group ref={modelRef}>
      {/* The glasses will be created programmatically */}
    </group>
  );
};

export default EyewearModel;
