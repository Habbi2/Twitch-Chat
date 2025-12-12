'use client';

import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number; // ms per character
  startDelay?: number;
  onComplete?: () => void;
}

interface UseTypewriterReturn {
  displayedText: string;
  isComplete: boolean;
  isTyping: boolean;
}

export function useTypewriter({
  text,
  speed = 25,
  startDelay = 0,
  onComplete,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Reset state when text changes
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);
    setIsTyping(false);

    if (!text) {
      setIsComplete(true);
      return;
    }

    // Start delay before typing
    const startTimer = setTimeout(() => {
      setIsTyping(true);

      const typingInterval = setInterval(() => {
        if (indexRef.current < text.length) {
          indexRef.current++;
          setDisplayedText(text.slice(0, indexRef.current));
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setIsComplete(true);
          onCompleteRef.current?.();
        }
      }, speed);

      return () => clearInterval(typingInterval);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
    };
  }, [text, speed, startDelay]);

  return { displayedText, isComplete, isTyping };
}
