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
    createScreenFlash('#00FF00', 100);

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
      <div
        className="alert-box"
        style={{
          borderColor: '#00FF00',
          boxShadow: '0 0 30px #00FF00',
        }}
      >
        <div
          className="alert-title chromatic-text-strong"
          style={{ color: '#00FF00' }}
        >
          ✨ NEW FOLLOWER!
        </div>
        <div className="alert-subtitle" style={{ color: '#FFFFFF', fontSize: '18px' }}>
          {username}
        </div>
        <div className="mt-2 text-xs pixel-text" style={{ color: '#00FF00' }}>
          WELCOME TO THE CREW!
        </div>
      </div>
    </div>
  );
}
