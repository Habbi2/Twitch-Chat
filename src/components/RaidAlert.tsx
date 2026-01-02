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
    createScreenFlash('#00f0ff', 200);

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

  // Generate icons based on viewer count (max 10)
  const iconCount = Math.min(Math.ceil(viewers / 15), 10);

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      {/* Neon Icons */}
      <div className="raid-ships">
        {Array.from({ length: iconCount }).map((_, i) => (
          <span
            key={i}
            className="pixel-ship"
          >
            🚀
          </span>
        ))}
      </div>

      <div
        className="alert-box"
        style={{
          borderColor: '#00f0ff',
          boxShadow: '0 0 60px rgba(0, 240, 255, 0.6), 0 0 120px rgba(139, 92, 246, 0.4)',
        }}
      >
        <div
          className="alert-title neon-text-strong"
          style={{ color: '#ffffff' }}
        >
          🚀 INCOMING RAID! 🚀
        </div>
        <div className="alert-subtitle" style={{ color: '#00f0ff' }}>
          {raider}
        </div>
        <div className="alert-amount" style={{ color: '#ffffff' }}>
          {viewers.toLocaleString()} VIEWERS
        </div>
        <div className="mt-2 text-xs pixel-text" style={{ color: '#8b5cf6' }}>
          WELCOME RAIDERS!
        </div>
      </div>
    </div>
  );
}
