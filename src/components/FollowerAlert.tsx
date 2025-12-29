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
    createScreenFlash('#5c3a21', 100);

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
      {/* Static pixel skull decoration */}
      <div className="raid-ships">
        <span className="pixel-ship">💀</span>
      </div>

      <div
        className="alert-box"
        style={{
          borderColor: '#8b0000',
          boxShadow: '0 0 30px rgba(139, 0, 0, 0.4), 6px 6px 0 rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          className="alert-title gothic-text-strong"
          style={{ color: '#e8e4d9' }}
        >
          💀 A NEW HOLLOW JOINS!
        </div>
        <div className="alert-subtitle" style={{ color: '#a89f8f', fontSize: '18px' }}>
          {username}
        </div>
        <div className="mt-2 text-xs pixel-text" style={{ color: '#5c3a21' }}>
          WELCOME, UNDEAD...
        </div>
      </div>
    </div>
  );
}
