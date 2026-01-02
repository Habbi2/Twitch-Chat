'use client';

import { useEffect, useRef, useCallback } from 'react';

interface StreamlabsMessage {
  name?: string;
  // For follows
  isTest?: boolean;
  // For subscriptions
  months?: number;
  message?: string;
  sub_plan?: string;
  gifter?: string;
  gifter_display_name?: string;
  // For bits/cheers
  amount?: number | string;
  // For raids
  raiders?: number | string;
  viewers?: number | string;
  // Alternative field names used in some events
  from?: string;
  display_name?: string;
}

interface StreamlabsEvent {
  type: string;
  message: StreamlabsMessage[] | StreamlabsMessage;
  for?: string;
  event_id?: string;
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

      // Log all non-ping messages for debugging
      if (data !== '3' && !data.startsWith('0')) {
        console.log('📨 Streamlabs raw message:', data.substring(0, 200));
      }

      // Parse event messages (start with "42")
      if (data.startsWith('42')) {
        try {
          const parsed = JSON.parse(data.slice(2));
          console.log('🔍 Parsed Streamlabs data:', JSON.stringify(parsed, null, 2));
          if (Array.isArray(parsed) && parsed[0] === 'event') {
            const eventData = parsed[1] as StreamlabsEvent;
            handleStreamlabsEvent(eventData);
          }
        } catch (e) {
          console.error('❌ Failed to parse Streamlabs message:', e);
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
    console.log('📥 Streamlabs event received:', JSON.stringify(event, null, 2));
    
    // Normalize message to always be an array
    const messages: StreamlabsMessage[] = Array.isArray(event.message) 
      ? event.message 
      : event.message 
        ? [event.message] 
        : [];
    
    if (messages.length === 0) {
      console.log('⚠️ No messages in event');
      return;
    }

    // Get the event type - Streamlabs uses 'type' for the event type
    // and 'for' to indicate the platform (twitch_account, youtube_account, etc.)
    const eventType = event.type;
    console.log(`🎯 Processing event type: ${eventType}, for: ${event.for || 'unknown'}`);

    for (const msg of messages) {
      console.log('📋 Message data:', JSON.stringify(msg, null, 2));
      
      // Get the username from various possible fields
      const username = msg.name || msg.display_name || msg.from || 'Unknown';
      
      switch (eventType) {
        case 'follow':
          console.log('✅ Triggering follow alert for:', username);
          callbacksRef.current.onFollow?.(username);
          break;

        case 'subscription':
        case 'resub':
          console.log('✅ Triggering sub alert for:', username);
          callbacksRef.current.onSub?.({
            username: username,
            months: Number(msg.months) || 1,
            message: msg.message,
            tier: msg.sub_plan || '1000',
            isGift: !!(msg.gifter || msg.gifter_display_name),
            gifter: msg.gifter_display_name || msg.gifter,
          });
          break;

        case 'bits':
        case 'cheer':
          const bitsAmount = Number(msg.amount) || 0;
          console.log('✅ Triggering bits alert for:', username, 'amount:', bitsAmount);
          callbacksRef.current.onBits?.({
            username: username,
            amount: bitsAmount,
            message: msg.message,
          });
          break;

        case 'raid':
          const viewerCount = Number(msg.raiders) || Number(msg.viewers) || 0;
          console.log('✅ Triggering raid alert for:', username, 'viewers:', viewerCount);
          callbacksRef.current.onRaid?.({
            raider: username,
            viewers: viewerCount,
          });
          break;

        case 'donation':
          // Streamlabs donations (not Twitch-native) - could add support later
          console.log('💰 Donation event (not handled):', username);
          break;

        case 'host':
          // Host events - treat similar to raid
          const hostViewers = Number(msg.viewers) || 0;
          console.log('✅ Triggering raid alert for host:', username, 'viewers:', hostViewers);
          callbacksRef.current.onRaid?.({
            raider: username,
            viewers: hostViewers,
          });
          break;

        default:
          console.log('❓ Unknown event type:', eventType);
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
