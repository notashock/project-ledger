import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 w-full h-full min-h-[200px]">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer dashed ring spinning */}
        <div className="w-10 h-10 border-4 border-on-surface border-dashed rounded-full animate-spin"></div>
        {/* Inner solid neobrutalist square dot */}
        <div className="absolute w-3 h-3 bg-primary border border-on-surface shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded"></div>
      </div>
      {message && (
        <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
