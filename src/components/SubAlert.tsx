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
    createScreenFlash('#00f0ff', 150);

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

  const title = isGift ? '🎁 GIFT SUB!' : '⚡ NEW SUBSCRIBER!';
  const subtitle = isGift
    ? `${gifter} gifted to ${username}`
    : months > 1
    ? `${username} subscribed for ${months} months!`
    : `${username} just subscribed!`;

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      {/* Neon icon decorations */}
      <div className="raid-ships">
        <span className="pixel-ship">✨</span>
        <span className="pixel-ship">⚡</span>
        <span className="pixel-ship">✨</span>
      </div>

      <div
        className="alert-box"
        style={{
          borderColor: '#00f0ff',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.5), 0 0 80px rgba(139, 92, 246, 0.3)',
        }}
      >
        <div
          className="alert-title neon-text-strong"
          style={{ color: '#ffffff' }}
        >
          {title}
        </div>
        <div className="alert-subtitle" style={{ color: '#b0b0c0' }}>{subtitle}</div>
        {months > 1 && !isGift && (
          <div className="alert-amount" style={{ color: '#8b5cf6' }}>
            {months} MONTHS
          </div>
        )}
        {message && (
          <div
            className="mt-4 text-sm terminal-text"
            style={{ color: '#ffffff', maxWidth: '400px' }}
          >
            &quot;{message}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
