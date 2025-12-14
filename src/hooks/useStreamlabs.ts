'use client';

import { useEffect, useRef, useCallback } from 'react';

interface StreamlabsEvent {
  type: string;
  message: Array<{
    name: string;
    // For follows
    isTest?: boolean;
    // For subscriptions
    months?: number;
    message?: string;
    sub_plan?: string;
    gifter?: string;
    // For bits
    amount?: number;
    // For raids
    raiders?: number;
  }>;
  for?: string;
}

interface UseStreamlabsOptions {
  token: string | null;
  onFollow?: (username: string) => void;
  onSub?: (data: { username: string; months: number; message?: string; tier: string; isGift: boolean; gifter?: string }) => void;
  onBits?: (data: { username: string; amount: number; message?: string }) => void;
  onRaid?: (data: { raider: string; viewers: number }) => void;
}

export function useStreamlabs({
  token,
  onFollow,
  onSub,
  onBits,
  onRaid,
}: UseStreamlabsOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const callbacksRef = useRef({ onFollow, onSub, onBits, onRaid });

  useEffect(() => {
    callbacksRef.current = { onFollow, onSub, onBits, onRaid };
  }, [onFollow, onSub, onBits, onRaid]);

  const connect = useCallback(() => {
    if (!token) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`wss://sockets.streamlabs.com/socket.io/?token=${token}&EIO=3&transport=websocket`);

    ws.onopen = () => {
      console.log('🎮 Connected to Streamlabs');
    };

    ws.onmessage = (event) => {
      const data = event.data;
      
      // Socket.io protocol - messages start with a number
      if (typeof data !== 'string') return;
      
      // Handle ping
      if (data === '2') {
        ws.send('3'); // Pong
        return;
      }

      // Parse event messages (start with "42")
      if (data.startsWith('42')) {
        try {
          const parsed = JSON.parse(data.slice(2));
          if (Array.isArray(parsed) && parsed[0] === 'event') {
            const eventData = parsed[1] as StreamlabsEvent;
            handleStreamlabsEvent(eventData);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    };

    ws.onerror = (error) => {
      console.error('Streamlabs WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Streamlabs WebSocket closed, reconnecting in 5s...');
      setTimeout(connect, 5000);
    };

    wsRef.current = ws;
  }, [token]);

  const handleStreamlabsEvent = useCallback((event: StreamlabsEvent) => {
    if (!event.message || !Array.isArray(event.message)) return;

    for (const msg of event.message) {
      switch (event.type) {
        case 'follow':
          callbacksRef.current.onFollow?.(msg.name);
          break;

        case 'subscription':
          callbacksRef.current.onSub?.({
            username: msg.name,
            months: msg.months || 1,
            message: msg.message,
            tier: msg.sub_plan || '1000',
            isGift: !!msg.gifter,
            gifter: msg.gifter,
          });
          break;

        case 'bits':
        case 'cheer':
          callbacksRef.current.onBits?.({
            username: msg.name,
            amount: msg.amount || 0,
            message: msg.message,
          });
          break;

        case 'raid':
          callbacksRef.current.onRaid?.({
            raider: msg.name,
            viewers: msg.raiders || 0,
          });
          break;
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return { connect, disconnect };
}
