import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/70 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;