'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, SubEvent, CheerEvent, RaidEvent, FollowEvent } from './useTwitchChat';

interface UseTestModeOptions {
  enabled: boolean;
  onMessage?: (message: ChatMessage) => void;
  onSub?: (sub: SubEvent) => void;
  onCheer?: (cheer: CheerEvent) => void;
  onRaid?: (raid: RaidEvent) => void;
  onFollow?: (follow: FollowEvent) => void;
}

// Sample messages for testing
const TEST_MESSAGES = [
  { username: 'RetroGamer99', message: 'This overlay is AMAZING! 🎮' },
  { username: 'PixelQueen', message: 'WOW the CRT effects are so cool!' },
  { username: 'ArcadeMaster', message: 'Gives me nostalgia vibes' },
  { username: 'NeonNinja', message: 'The typewriter effect is sick!' },
  { username: 'BitBoss', message: 'HABBI3 LETS GOOO' },
  { username: 'GlitchWitch', message: 'Love the scanlines!' },
  { username: 'CyberPunk2077', message: 'This is giving me arcade feels' },
  { username: 'VaporWaveKid', message: 'aesthetic af' },
  { username: 'TwitchFan42', message: 'Best chat overlay I have ever seen' },
  { username: 'StreamSniper', message: 'How did you make this?!' },
  { username: 'LoFiBeats', message: 'The colors are perfect' },
  { username: 'ChipTune', message: 'Needs more 8-bit music lol' },
];

const ARCADE_COLORS = [
  '#FF0000', '#00FF00', '#FFFF00', '#00FFFF', 
  '#FF00FF', '#FF6600', '#39FF14', '#FFB8FF',
];

function generateId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getRandomColor(): string {
  return ARCADE_COLORS[Math.floor(Math.random() * ARCADE_COLORS.length)];
}

function getRandomMessage(): { username: string; message: string } {
  return TEST_MESSAGES[Math.floor(Math.random() * TEST_MESSAGES.length)];
}

export function useTestMode({
  enabled,
  onMessage,
  onSub,
  onCheer,
  onRaid,
  onFollow,
}: UseTestModeOptions) {
  const callbacksRef = useRef({ onMessage, onSub, onCheer, onRaid, onFollow });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbacksRef.current = { onMessage, onSub, onCheer, onRaid, onFollow };
  }, [onMessage, onSub, onCheer, onRaid, onFollow]);

  const sendTestMessage = useCallback(() => {
    const { username, message } = getRandomMessage();
    const chatMessage: ChatMessage = {
      id: generateId(),
      username,
      message,
      color: getRandomColor(),
      timestamp: Date.now(),
    };
    callbacksRef.current.onMessage?.(chatMessage);
  }, []);

  const sendTestSub = useCallback(() => {
    const subEvent: SubEvent = {
      id: generateId(),
      username: 'TestSubscriber',
      months: Math.floor(Math.random() * 24) + 1,
      message: 'Testing the sub alert!',
      tier: '1000',
      isGift: Math.random() > 0.5,
      gifter: 'GenerousGifter',
    };
    callbacksRef.current.onSub?.(subEvent);
  }, []);

  const sendTestBits = useCallback(() => {
    const bits = [100, 500, 1000, 5000, 10000][Math.floor(Math.random() * 5)];
    const cheerEvent: CheerEvent = {
      id: generateId(),
      username: 'BitsDonator',
      bits,
      message: `Here are ${bits} bits for you!`,
    };
    callbacksRef.current.onCheer?.(cheerEvent);
  }, []);

  const sendTestRaid = useCallback(() => {
    const raidEvent: RaidEvent = {
      id: generateId(),
      raider: 'CoolStreamer',
      viewers: Math.floor(Math.random() * 500) + 50,
    };
    callbacksRef.current.onRaid?.(raidEvent);
  }, []);

  const sendTestFollow = useCallback(() => {
    const names = ['NewViewer123', 'ArcadeFan', 'RetroLover', 'PixelHero', 'NeonDreamer'];
    const followEvent: FollowEvent = {
      id: generateId(),
      username: names[Math.floor(Math.random() * names.length)],
    };
    callbacksRef.current.onFollow?.(followEvent);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Send messages every 2-4 seconds
    intervalRef.current = setInterval(() => {
      sendTestMessage();
    }, 2000 + Math.random() * 2000);

    // Send initial message
    setTimeout(sendTestMessage, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, sendTestMessage]);

  return {
    sendTestMessage,
    sendTestSub,
    sendTestBits,
    sendTestRaid,
    sendTestFollow,
  };
}
