'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CRTContainer } from '@/components/CRTContainer';
import { ScatteredMessage } from '@/components/ScatteredMessage';
import { SubAlert } from '@/components/SubAlert';
import { BitsAlert } from '@/components/BitsAlert';
import { RaidAlert } from '@/components/RaidAlert';
import { FollowerAlert } from '@/components/FollowerAlert';
import {
  useTwitchChat,
  type ChatMessage,
  type SubEvent,
  type CheerEvent,
  type RaidEvent,
  type FollowEvent,
} from '@/hooks/useTwitchChat';
import { useStreamlabs } from '@/hooks/useStreamlabs';
import { useTestMode } from '@/hooks/useTestMode';

// Configuration
const TWITCH_CHANNEL = 'Habbi3';
const MAX_MESSAGES = 50;
const MAX_TYPING_MESSAGES = 5;
const MESSAGE_LIFETIME = 18000; // 18 seconds
const ALERT_DURATION = 8000; // 8 seconds

// Streamlabs Socket API Token (get from https://streamlabs.com/dashboard#/settings/api-settings)
// Pass via URL: ?streamlabs=YOUR_TOKEN or ?streamlabs=YOUR_TOKEN&test=true
const STREAMLABS_TOKEN_PARAM = 'streamlabs';

interface DisplayMessage extends ChatMessage {
  showTypewriter: boolean;
}

type AlertType =
  | { type: 'sub'; data: SubEvent }
  | { type: 'bits'; data: CheerEvent }
  | { type: 'raid'; data: RaidEvent }
  | { type: 'follow'; data: FollowEvent };

function ChatOverlay() {
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('test') === 'true';
  const streamlabsToken = searchParams.get(STREAMLABS_TOKEN_PARAM);
  
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  // Handle new chat message
  const handleMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const newMessages = [...prev, { ...message, showTypewriter: true }];

      // Cap total messages
      if (newMessages.length > MAX_MESSAGES) {
        return newMessages.slice(-MAX_MESSAGES);
      }

      // Only newest N messages get typewriter effect
      return newMessages.map((msg, index) => ({
        ...msg,
        showTypewriter: index >= newMessages.length - MAX_TYPING_MESSAGES,
      }));
    });
  }, []);

  // Handle message removal
  const handleRemoveMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  // Handle subscription event
  const handleSub = useCallback((sub: SubEvent) => {
    setAlerts((prev) => [...prev, { type: 'sub', data: sub }]);
  }, []);

  // Handle bits/cheer event
  const handleCheer = useCallback((cheer: CheerEvent) => {
    setAlerts((prev) => [...prev, { type: 'bits', data: cheer }]);
  }, []);

  // Handle raid event
  const handleRaid = useCallback((raid: RaidEvent) => {
    setAlerts((prev) => [...prev, { type: 'raid', data: raid }]);
  }, []);

  // Handle follow event
  const handleFollow = useCallback((follow: FollowEvent) => {
    setAlerts((prev) => [...prev, { type: 'follow', data: follow }]);
  }, []);

  // Handle alert completion
  const handleAlertComplete = useCallback(() => {
    setAlerts((prev) => prev.slice(1)); // Remove first alert
  }, []);

  // Helper to generate unique IDs
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Connect to Twitch chat for messages (subs/bits/raids come from Streamlabs if token provided)
  useTwitchChat({
    channel: isTestMode ? '' : TWITCH_CHANNEL, // Empty channel disables connection
    onMessage: isTestMode ? undefined : handleMessage,
    // Only use tmi.js for subs/bits/raids if Streamlabs is NOT connected
    onSub: isTestMode || streamlabsToken ? undefined : handleSub,
    onCheer: isTestMode || streamlabsToken ? undefined : handleCheer,
    onRaid: isTestMode || streamlabsToken ? undefined : handleRaid,
    onFollow: undefined, // Follows not available via tmi.js
  });

  // Connect to Streamlabs for all alerts (pass token via URL: ?streamlabs=YOUR_TOKEN)
  useStreamlabs({
    token: streamlabsToken,
    onFollow: (username) => {
      handleFollow({ id: generateId(), username });
    },
    onSub: (data) => {
      handleSub({
        id: generateId(),
        username: data.username,
        months: data.months,
        message: data.message,
        tier: data.tier,
        isGift: data.isGift,
        gifter: data.gifter,
      });
    },
    onBits: (data) => {
      handleCheer({
        id: generateId(),
        username: data.username,
        bits: data.amount,
        message: data.message || '',
      });
    },
    onRaid: (data) => {
      handleRaid({
        id: generateId(),
        raider: data.raider,
        viewers: data.viewers,
      });
    },
  });

  // Test mode for previewing without live chat
  const { sendTestSub, sendTestBits, sendTestRaid, sendTestFollow } = useTestMode({
    enabled: isTestMode,
    onMessage: handleMessage,
    onSub: handleSub,
    onCheer: handleCheer,
    onRaid: handleRaid,
    onFollow: handleFollow,
  });

  // Get current alert (only show one at a time)
  const currentAlert = alerts[0];

  return (
    <CRTContainer>
      {/* Test Mode Controls (only visible in test mode) */}
      {isTestMode && (
        <div className="fixed top-4 right-4 z-[300] flex gap-2 pixel-text text-xs flex-wrap justify-end">
          <button
            onClick={sendTestFollow}
            className="px-3 py-2 bg-green-500 text-black rounded hover:bg-green-400"
          >
            TEST FOLLOW
          </button>
          <button
            onClick={sendTestSub}
            className="px-3 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400"
          >
            TEST SUB
          </button>
          <button
            onClick={sendTestBits}
            className="px-3 py-2 bg-orange-500 text-black rounded hover:bg-orange-400"
          >
            TEST BITS
          </button>
          <button
            onClick={sendTestRaid}
            className="px-3 py-2 bg-red-500 text-black rounded hover:bg-red-400"
          >
            TEST RAID
          </button>
        </div>
      )}

      {/* Scattered Chat Messages */}
      {messages.map((msg) => (
        <ScatteredMessage
          key={msg.id}
          id={msg.id}
          username={msg.username}
          message={msg.message}
          color={msg.color}
          onRemove={handleRemoveMessage}
          lifetime={MESSAGE_LIFETIME}
          showTypewriter={msg.showTypewriter}
        />
      ))}

      {/* Event Alerts */}
      {currentAlert?.type === 'sub' && (
        <SubAlert
          key={currentAlert.data.id}
          username={currentAlert.data.username}
          months={currentAlert.data.months}
          message={currentAlert.data.message}
          isGift={currentAlert.data.isGift}
          gifter={currentAlert.data.gifter}
          onComplete={handleAlertComplete}
          duration={ALERT_DURATION}
        />
      )}

      {currentAlert?.type === 'bits' && (
        <BitsAlert
          key={currentAlert.data.id}
          username={currentAlert.data.username}
          bits={currentAlert.data.bits}
          message={currentAlert.data.message}
          onComplete={handleAlertComplete}
          duration={ALERT_DURATION}
        />
      )}

      {currentAlert?.type === 'raid' && (
        <RaidAlert
          key={currentAlert.data.id}
          raider={currentAlert.data.raider}
          viewers={currentAlert.data.viewers}
          onComplete={handleAlertComplete}
          duration={ALERT_DURATION}
        />
      )}

      {currentAlert?.type === 'follow' && (
        <FollowerAlert
          key={currentAlert.data.id}
          username={currentAlert.data.username}
          onComplete={handleAlertComplete}
          duration={ALERT_DURATION}
        />
      )}
    </CRTContainer>
  );
}

// Wrap in Suspense for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={<div className="crt-container" />}>
      <ChatOverlay />
    </Suspense>
  );
}
