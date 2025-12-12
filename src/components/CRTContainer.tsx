'use client';

import React from 'react';

interface CRTContainerProps {
  children: React.ReactNode;
}

export function CRTContainer({ children }: CRTContainerProps) {
  return (
    <div className="crt-container">
      {/* Content Layer - No SVG filters for better performance */}
      <div className="relative w-full h-full">
        {children}
      </div>

      {/* Vignette Overlay */}
      <div className="vignette" />
    </div>
  );
}
