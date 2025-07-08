// Firebase Cloud Messaging Types
declare global {
  interface Window {
    firebase: {
      messaging: () => unknown;
      initializeApp: (config: object) => unknown;
    };
  }
}

export interface PushNotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    image?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
  };
  data?: {
    [key: string]: string;
  };
}

export interface FCMMessage {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    image?: string;
  };
  data?: {
    [key: string]: string;
  };
  from?: string;
  messageId?: string;
  collapseKey?: string;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationOptions {
  body?: string;
  icon?: string;
  image?: string;
  badge?: string;
  sound?: string;
  tag?: string;
  data?: unknown;
  renotify?: boolean;
  silent?: boolean;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  timestamp?: number;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export {}; 