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
    createScreenFlash('#00FF00', 200);

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

  // Generate ships based on viewer count (max 15 ships)
  const shipCount = Math.min(Math.ceil(viewers / 10), 15);

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      {/* Animated Pixel Ships */}
      <div className="raid-ships">
        {Array.from({ length: shipCount }).map((_, i) => (
          <span
            key={i}
            className="pixel-ship"
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          >
            ▼
          </span>
        ))}
      </div>

      <div
        className="alert-box"
        style={{
          borderColor: '#00FF00',
          boxShadow: '0 0 50px #00FF00, inset 0 0 20px rgba(0, 255, 0, 0.2)',
        }}
      >
        <div
          className="alert-title chromatic-text-strong"
          style={{ color: '#FF0000' }}
        >
          ⚠ RAID INCOMING! ⚠
        </div>
        <div className="alert-subtitle" style={{ color: '#00FF00' }}>
          {raider}
        </div>
        <div className="alert-amount" style={{ color: '#00FF00' }}>
          ×{viewers.toLocaleString()} PLAYERS
        </div>
        <div className="mt-2 text-xs pixel-text" style={{ color: '#FFFF00' }}>
          PREPARE FOR BATTLE!
        </div>
      </div>
    </div>
  );
}
