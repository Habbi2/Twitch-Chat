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
    createScreenFlash('#FFFF00', 150);

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

  const title = isGift ? '🎁 GIFT SUB!' : '⭐ NEW SUB!';
  const subtitle = isGift
    ? `${gifter} gifted to ${username}`
    : months > 1
    ? `${username} resubbed for ${months} months!`
    : `${username} just subscribed!`;

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      <div
        className="alert-box"
        style={{
          borderColor: isGift ? '#FF00FF' : '#FFFF00',
          boxShadow: `0 0 30px ${isGift ? '#FF00FF' : '#FFFF00'}`,
        }}
      >
        <div
          className="alert-title chromatic-text-strong"
          style={{ color: isGift ? '#FF00FF' : '#FFFF00' }}
        >
          {title}
        </div>
        <div className="alert-subtitle">{subtitle}</div>
        {months > 1 && !isGift && (
          <div className="alert-amount" style={{ color: '#FFD700' }}>
            ×{months} MONTHS
          </div>
        )}
        {message && (
          <div
            className="mt-4 text-sm terminal-text"
            style={{ color: '#FFFFFF', maxWidth: '400px' }}
          >
            &quot;{message}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
