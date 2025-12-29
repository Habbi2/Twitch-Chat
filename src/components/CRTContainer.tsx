'use client';

import React from 'react';

interface CRTContainerProps {
  children: React.ReactNode;
}

export function CRTContainer({ children }: CRTContainerProps) {
  return (
    <div className="crt-container">
      {/* Corner Skull Decorations - Static CSS art */}
      <div className="corner-skull top-left" />
      <div className="corner-skull top-right" />
      <div className="corner-skull bottom-left" />
      <div className="corner-skull bottom-right" />

      {/* Content Layer */}
      <div className="relative w-full h-full" style={{ willChange: 'transform' }}>
        {children}
      </div>

      {/* Vignette Overlay */}
      <div className="vignette" />

      {/* Corner skull styles */}
      <style jsx>{`
        .corner-skull {
          position: absolute;
          width: 2px;
          height: 2px;
          z-index: 101;
          box-shadow:
            /* Mini 6x6 pixel skull */
            4px 0 0 #e8e4d9, 6px 0 0 #e8e4d9, 8px 0 0 #e8e4d9,
            2px 2px 0 #e8e4d9, 4px 2px 0 #e8e4d9, 6px 2px 0 #e8e4d9, 8px 2px 0 #e8e4d9, 10px 2px 0 #e8e4d9,
            2px 4px 0 #e8e4d9, 4px 4px 0 #8b0000, 6px 4px 0 #e8e4d9, 8px 4px 0 #8b0000, 10px 4px 0 #e8e4d9,
            4px 6px 0 #e8e4d9, 6px 6px 0 #0a0808, 8px 6px 0 #e8e4d9;
        }
        .corner-skull.top-left { top: 8px; left: 8px; }
        .corner-skull.top-right { top: 8px; right: 8px; transform: scaleX(-1); }
        .corner-skull.bottom-left { bottom: 8px; left: 8px; transform: scaleY(-1); }
        .corner-skull.bottom-right { bottom: 8px; right: 8px; transform: scale(-1, -1); }
      `}</style>
    </div>
  );
}
