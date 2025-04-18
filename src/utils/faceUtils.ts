
import * as faceapi from 'face-api.js';

/**
 * Loads the face-api.js models from the public folder
 */
export const loadFaceDetectionModels = async (): Promise<void> => {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    ]);
    console.log('Face detection models loaded');
    return Promise.resolve();
  } catch (error) {
    console.error('Error loading face detection models:', error);
    return Promise.reject(error);
  }
};

/**
 * Maps 2D face landmarks to 3D coordinates for eyewear placement
 */
export const mapLandmarksTo3D = (landmarks: faceapi.FaceLandmarks68, windowWidth: number, windowHeight: number) => {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  
  // Calculate center point between eyes
  const leftEyeCenter = calculateCenter(leftEye);
  const rightEyeCenter = calculateCenter(rightEye);
  
  return {
    position: {
      x: ((leftEyeCenter.x + rightEyeCenter.x) / 2) / windowWidth,
      y: ((leftEyeCenter.y + rightEyeCenter.y) / 2) / windowHeight,
    },
    scale: Math.sqrt(
      Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + 
      Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
    ) / windowWidth * 10,
    rotation: Math.atan2(
      rightEyeCenter.y - leftEyeCenter.y,
      rightEyeCenter.x - leftEyeCenter.x
    )
  };
};

/**
 * Calculate center point from an array of points
 */
export const calculateCenter = (points: faceapi.Point[]) => {
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  return { 
    x: sumX / points.length,
    y: sumY / points.length
  };
};
