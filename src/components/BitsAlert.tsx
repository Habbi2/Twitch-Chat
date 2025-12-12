'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fireBitsFireworks, createScreenFlash } from '@/lib/confetti';

interface BitsAlertProps {
  username: string;
  bits: number;
  message: string;
  onComplete: () => void;
  duration?: number;
}

export function BitsAlert({
  username,
  bits,
  message,
  onComplete,
  duration = 8000,
}: BitsAlertProps) {
  const [isExiting, setIsExiting] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Fire fireworks on mount
    cleanupRef.current = fireBitsFireworks(bits);
    createScreenFlash('#FF6600', 150);

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
  }, [bits, duration, onComplete]);

  // Color intensity based on bit amount
  const getColorForBits = (bits: number): string => {
    if (bits >= 10000) return '#FF0000'; // Red for huge donations
    if (bits >= 5000) return '#FF00FF'; // Magenta
    if (bits >= 1000) return '#00FFFF'; // Cyan
    if (bits >= 100) return '#FFFF00'; // Yellow
    return '#FF6600'; // Orange for smaller
  };

  const color = getColorForBits(bits);

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      <div
        className="alert-box"
        style={{
          borderColor: color,
          boxShadow: `0 0 40px ${color}`,
        }}
      >
        <div className="alert-title chromatic-text-strong" style={{ color }}>
          💎 BITS INCOMING!
        </div>
        <div className="alert-subtitle">{username} cheered</div>
        <div className="alert-amount" style={{ color }}>
          {bits.toLocaleString()} BITS
        </div>
        {message && (
          <div
            className="mt-4 text-base terminal-text"
            style={{ color: '#FFFFFF', maxWidth: '400px' }}
          >
            &quot;{message}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
