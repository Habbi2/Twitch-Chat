'use client';

import React, { useState, useEffect } from 'react';
import { fireSubConfetti, createScreenFlash } from '@/lib/confetti';

interface SubAlertProps {
  username: string;
  months: number;
  message?: string;
  isGift: boolean;
  gifter?: string;
  onComplete: () => void;
  duration?: number;
}

export function SubAlert({
  username,
  months,
  message,
  isGift,
  gifter,
  onComplete,
  duration = 8000,
}: SubAlertProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Fire confetti on mount
    fireSubConfetti();
    createScreenFlash('#8b0000', 150);

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

  const title = isGift ? '💀 SOUL GIFTED!' : '⚔ AN UNDEAD RISES!';
  const subtitle = isGift
    ? `${gifter} bestowed upon ${username}`
    : months > 1
    ? `${username} remains for ${months} cycles!`
    : `${username} has joined the covenant!`;

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      {/* Static pixel skull decorations */}
      <div className="raid-ships">
        <span className="pixel-ship">☠</span>
        <span className="pixel-ship">☠</span>
        <span className="pixel-ship">☠</span>
      </div>

      <div
        className="alert-box"
        style={{
          borderColor: '#8b0000',
          boxShadow: '0 0 30px rgba(139, 0, 0, 0.5), 6px 6px 0 rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          className="alert-title gothic-text-strong"
          style={{ color: '#e8e4d9' }}
        >
          {title}
        </div>
        <div className="alert-subtitle" style={{ color: '#a89f8f' }}>{subtitle}</div>
        {months > 1 && !isGift && (
          <div className="alert-amount" style={{ color: '#b8860b' }}>
            ×{months} CYCLES
          </div>
        )}
        {message && (
          <div
            className="mt-4 text-sm terminal-text"
            style={{ color: '#e8e4d9', maxWidth: '400px' }}
          >
            &quot;{message}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
