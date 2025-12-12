'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTypewriter } from '@/hooks/useTypewriter';

interface ScatteredMessageProps {
  id: string;
  username: string;
  message: string;
  color: string;
  onRemove: (id: string) => void;
  lifetime?: number; // ms before auto-remove
  showTypewriter?: boolean;
}

// Generate random position and rotation for chaotic scatter
function generateRandomPosition() {
  return {
    top: Math.random() * 75 + 5, // 5% to 80%
    left: Math.random() * 70 + 5, // 5% to 75%
    rotation: (Math.random() - 0.5) * 10, // -5deg to +5deg
  };
}

export function ScatteredMessage({
  id,
  username,
  message,
  color,
  onRemove,
  lifetime = 18000, // 18 seconds default
  showTypewriter = true,
}: ScatteredMessageProps) {
  const [isExiting, setIsExiting] = useState(false);
  
  // Memoize position so it doesn't change on re-render
  const position = useMemo(() => generateRandomPosition(), []);

  // Typewriter effect - only for recent messages
  const { displayedText, isComplete } = useTypewriter({
    text: message,
    speed: showTypewriter ? 25 : 0,
  });

  // Auto-remove after lifetime
  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, lifetime - 500); // Start exit animation 500ms before removal

    const removeTimer = setTimeout(() => {
      onRemove(id);
    }, lifetime);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [id, lifetime, onRemove]);

  const displayText = showTypewriter ? displayedText : message;
  const showCursor = showTypewriter && !isComplete;

  return (
    <div
      className={`message-container ${isExiting ? 'message-exit' : 'message-enter'}`}
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
        color: color,
        borderColor: color,
        ['--rotation' as string]: `${position.rotation}deg`,
      }}
    >
      {/* Username */}
      <div className="message-username" style={{ color }}>
        {username}
      </div>

      {/* Message Text */}
      <div className="message-text chromatic-text">
        {displayText}
        {showCursor && <span className="cursor">▌</span>}
      </div>
    </div>
  );
}
