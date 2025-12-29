'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fireRaidCelebration, createScreenFlash } from '@/lib/confetti';

interface RaidAlertProps {
  raider: string;
  viewers: number;
  onComplete: () => void;
  duration?: number;
}

export function RaidAlert({
  raider,
  viewers,
  onComplete,
  duration = 8000,
}: RaidAlertProps) {
  const [isExiting, setIsExiting] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Fire raid celebration on mount
    cleanupRef.current = fireRaidCelebration(viewers);
    createScreenFlash('#8b0000', 200);

    // Start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    // Complete and remove
    const completeTimer = setTimeout(() => {
      cleanupRef.current?.();
      onComplete();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
      cleanupRef.current?.();
    };
  }, [viewers, duration, onComplete]);

  // Generate skulls based on viewer count (max 10 skulls)
  const skullCount = Math.min(Math.ceil(viewers / 15), 10);

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      {/* Static Pixel Skulls */}
      <div className="raid-ships">
        {Array.from({ length: skullCount }).map((_, i) => (
          <span
            key={i}
            className="pixel-ship"
          >
            ☠
          </span>
        ))}
      </div>

      <div
        className="alert-box"
        style={{
          borderColor: '#8b0000',
          boxShadow: '0 0 50px rgba(139, 0, 0, 0.6), inset 0 0 20px rgba(139, 0, 0, 0.2), 6px 6px 0 rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          className="alert-title gothic-text-strong"
          style={{ color: '#e8e4d9' }}
        >
          ⚔ INVASION INCOMING! ⚔
        </div>
        <div className="alert-subtitle" style={{ color: '#b8860b' }}>
          {raider}
        </div>
        <div className="alert-amount" style={{ color: '#e8e4d9' }}>
          ×{viewers.toLocaleString()} PHANTOMS
        </div>
        <div className="mt-2 text-xs pixel-text" style={{ color: '#8b0000' }}>
          PREPARE TO DIE!
        </div>
      </div>
    </div>
  );
}
