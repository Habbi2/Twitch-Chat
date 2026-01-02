'use client';

import React, { useState, useEffect } from 'react';
import { fireSubConfetti, createScreenFlash } from '@/lib/confetti';

interface FollowerAlertProps {
  username: string;
  onComplete: () => void;
  duration?: number;
}

export function FollowerAlert({
  username,
  onComplete,
  duration = 8000,
}: FollowerAlertProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Fire confetti on mount (lighter than sub)
    fireSubConfetti();
    createScreenFlash('#8b5cf6', 100);

    // Start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    // Complete and remove
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      {/* Neon icon decoration */}
      <div className="raid-ships">
        <span className="pixel-ship">⭐</span>
      </div>

      <div
        className="alert-box"
        style={{
          borderColor: '#8b5cf6',
          boxShadow: '0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(0, 240, 255, 0.2)',
        }}
      >
        <div
          className="alert-title neon-text-strong"
          style={{ color: '#ffffff' }}
        >
          ⭐ NEW FOLLOWER!
        </div>
        <div className="alert-subtitle" style={{ color: '#00f0ff', fontSize: '18px' }}>
          {username}
        </div>
        <div className="mt-2 text-xs pixel-text" style={{ color: '#8b5cf6' }}>
          WELCOME TO THE STREAM!
        </div>
      </div>
    </div>
  );
}
