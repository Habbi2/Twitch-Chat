'use client';

import { useEffect, useRef, useCallback } from 'react';
import tmi from 'tmi.js';

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  color: string;
  timestamp: number;
  badges?: tmi.Badges;
  emotes?: { [emoteid: string]: string[] };
}

export interface SubEvent {
  id: string;
  username: string;
  months: number;
  message?: string;
  tier: string;
  isGift: boolean;
  gifter?: string;
}

export interface CheerEvent {
  id: string;
  username: string;
  bits: number;
  message: string;
}

export interface RaidEvent {
  id: string;
  raider: string;
  viewers: number;
}

interface UseTwitchChatOptions {
  channel: string;
  onMessage?: (message: ChatMessage) => void;
  onSub?: (sub: SubEvent) => void;
  onCheer?: (cheer: CheerEvent) => void;
  onRaid?: (raid: RaidEvent) => void;
}

// Arcade color palette for users without custom colors
const ARCADE_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#FFFF00', // Yellow
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
  '#FF6600', // Orange
  '#39FF14', // Neon Green
  '#FFB8FF', // Pink
  '#BF00FF', // Purple
  '#FFFFFF', // White
];

function getColorForUser(username: string, providedColor?: string): string {
  if (providedColor) return providedColor;
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ARCADE_COLORS[hash % ARCADE_COLORS.length];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useTwitchChat({
  channel,
  onMessage,
  onSub,
  onCheer,
  onRaid,
}: UseTwitchChatOptions) {
  const clientRef = useRef<tmi.Client | null>(null);
  const callbacksRef = useRef({ onMessage, onSub, onCheer, onRaid });

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onMessage, onSub, onCheer, onRaid };
  }, [onMessage, onSub, onCheer, onRaid]);

  const connect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
    }

    const client = new tmi.Client({
      options: { debug: false },
      connection: {
        secure: true,
        reconnect: true,
      },
      channels: [channel],
    });

    // Chat message handler
    client.on('message', (_channel, tags, message, self) => {
      if (self) return; // Ignore own messages

      const chatMessage: ChatMessage = {
        id: tags.id || generateId(),
        username: tags['display-name'] || tags.username || 'Anonymous',
        message,
        color: getColorForUser(tags.username || '', tags.color),
        timestamp: Date.now(),
        badges: tags.badges || undefined,
        emotes: tags.emotes || undefined,
      };

      callbacksRef.current.onMessage?.(chatMessage);
    });

    // Subscription handler
    client.on('subscription', (_channel, username, _method, message, tags) => {
      const subEvent: SubEvent = {
        id: generateId(),
        username: tags['display-name'] || username,
        months: 1,
        message: message || undefined,
        tier: '1000',
        isGift: false,
      };

      callbacksRef.current.onSub?.(subEvent);
    });

    // Resub handler
    client.on('resub', (_channel, username, months, message, tags) => {
      const cumulativeMonths = tags['msg-param-cumulative-months'];
      const monthCount = months || (typeof cumulativeMonths === 'string' ? parseInt(cumulativeMonths) : 1);
      
      const subEvent: SubEvent = {
        id: generateId(),
        username: tags['display-name'] || username,
        months: monthCount,
        message: message || undefined,
        tier: tags['msg-param-sub-plan'] || '1000',
        isGift: false,
      };

      callbacksRef.current.onSub?.(subEvent);
    });

    // Gift sub handler
    client.on('subgift', (_channel, username, _streakMonths, recipient, _methods, tags) => {
      const subEvent: SubEvent = {
        id: generateId(),
        username: tags['msg-param-recipient-display-name'] || recipient,
        months: 1,
        tier: tags['msg-param-sub-plan'] || '1000',
        isGift: true,
        gifter: tags['display-name'] || username,
      };

      callbacksRef.current.onSub?.(subEvent);
    });

    // Cheer (bits) handler
    client.on('cheer', (_channel, tags, message) => {
      const cheerEvent: CheerEvent = {
        id: generateId(),
        username: tags['display-name'] || tags.username || 'Anonymous',
        bits: parseInt(tags.bits || '0'),
        message,
      };

      callbacksRef.current.onCheer?.(cheerEvent);
    });

    // Raid handler
    client.on('raided', (_channel, username, viewers) => {
      const raidEvent: RaidEvent = {
        id: generateId(),
        raider: username,
        viewers,
      };

      callbacksRef.current.onRaid?.(raidEvent);
    });

    // Connection events
    client.on('connected', (addr, port) => {
      console.log(`🎮 Connected to Twitch IRC: ${addr}:${port}`);
      console.log(`📺 Joined channel: ${channel}`);
    });

    client.on('disconnected', (reason) => {
      console.log(`❌ Disconnected: ${reason}`);
    });

    try {
      await client.connect();
      clientRef.current = client;
    } catch (error) {
      console.error('Failed to connect to Twitch:', error);
    }
  }, [channel]);

  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { connect, disconnect };
}
