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
    createScreenFlash('#8b5cf6', 150);

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

  // Color intensity based on bit amount - Neon palette
  const getColorForBits = (bits: number): string => {
    if (bits >= 10000) return '#ffffff'; // Pure white for huge donations
    if (bits >= 5000) return '#00f0ff'; // Neon cyan
    if (bits >= 1000) return '#8b5cf6'; // Neon purple
    if (bits >= 100) return '#00ff88'; // Neon green
    return '#b0b0c0'; // Muted white for smaller
  };

  const color = getColorForBits(bits);

  return (
    <div className={`alert-container ${isExiting ? 'alert-exit' : 'alert-enter'}`}>
      {/* Neon icon decorations */}
      <div className="raid-ships">
        <span className="pixel-ship">💎</span>
        <span className="pixel-ship">✨</span>
        <span className="pixel-ship">💎</span>
      </div>

      <div
        className="alert-box"
        style={{
          borderColor: '#8b5cf6',
          boxShadow: '0 0 50px rgba(139, 92, 246, 0.5), 0 0 100px rgba(0, 240, 255, 0.3)',
        }}
      >
        <div className="alert-title neon-text-strong" style={{ color: '#ffffff' }}>
          💎 BITS CHEERED! 💎
        </div>
        <div className="alert-subtitle" style={{ color: '#b0b0c0' }}>{username} cheered</div>
        <div className="alert-amount" style={{ color, textShadow: `0 0 20px ${color}` }}>
          {bits.toLocaleString()} BITS
        </div>
        {message && (
          <div
            className="mt-4 text-base terminal-text"
            style={{ color: '#ffffff', maxWidth: '400px' }}
          >
            &quot;{message}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
