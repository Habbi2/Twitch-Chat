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
    createScreenFlash('#b8860b', 150);

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

  // Color intensity based on bit amount - Gothic palette
  const getColorForBits = (bits: number): string => {
    if (bits >= 10000) return '#e8e4d9'; // Bone white for huge donations
    if (bits >= 5000) return '#b8860b'; // Ember gold
    if (bits >= 1000) return '#8b0000'; // Blood red
    if (bits >= 100) return '#5c3a21'; // Rust brown
    return '#a89f8f'; // Ash gray for smaller
  };

  const color = getColorForBits(bits);

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      {/* Static pixel skull decorations */}
      <div className="raid-ships">
        <span className="pixel-ship">🔥</span>
        <span className="pixel-ship">💀</span>
        <span className="pixel-ship">🔥</span>
      </div>

      <div
        className="alert-box"
        style={{
          borderColor: '#8b0000',
          boxShadow: '0 0 40px rgba(139, 0, 0, 0.5), 6px 6px 0 rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="alert-title gothic-text-strong" style={{ color: '#e8e4d9' }}>
          🔥 SOULS DONATED! 🔥
        </div>
        <div className="alert-subtitle" style={{ color: '#a89f8f' }}>{username} offers tribute</div>
        <div className="alert-amount" style={{ color }}>
          {bits.toLocaleString()} SOULS
        </div>
        {message && (
          <div
            className="mt-4 text-base terminal-text"
            style={{ color: '#e8e4d9', maxWidth: '400px' }}
          >
            &quot;{message}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
