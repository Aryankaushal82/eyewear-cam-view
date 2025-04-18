
import React from 'react';
import VirtualTryOn from '@/components/VirtualTryOn';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-blue-800">Virtual Eyewear Try-On</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <VirtualTryOn />
        
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold mb-2">1. Face Detection</div>
              <p className="text-gray-600 text-sm">
                Our app uses face-api.js to detect and track your facial features in real-time.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold mb-2">2. 3D Rendering</div>
              <p className="text-gray-600 text-sm">
                React Three Fiber renders the eyewear model in 3D on top of your webcam feed.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold mb-2">3. Try Before You Buy</div>
              <p className="text-gray-600 text-sm">
                See how glasses look on your face without having to visit a physical store.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-blue-800 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>Virtual Eyewear Try-On App © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
