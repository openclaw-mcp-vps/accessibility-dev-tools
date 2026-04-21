export type SubscriptionStatus = "active" | "canceled";

export interface IDEExtension {
  id: string;
  name: string;
  editor: string;
  summary: string;
  includes: string[];
  installSteps: string[];
  downloadFile: string;
  category: "screen-reader" | "audio-navigation" | "tactile-feedback";
  packageSize: string;
}

export interface NavigationCue {
  gesture: string;
  spokenFeedback: string;
  tactileFeedback: string;
  useCase: string;
}

export interface AudioPlaybackPreference {
  rate: number;
  pitch: number;
  announceLineNumbers: boolean;
  expandSymbols: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface StoredSubscription {
  email: string;
  status: SubscriptionStatus;
  source: "stripe" | "manual";
  customerId?: string;
  lastEventId?: string;
  updatedAt: string;
}

export interface StoredSession {
  tokenHash: string;
  email: string;
  createdAt: string;
  expiresAt: number;
}

export interface DatabaseSchema {
  subscriptions: StoredSubscription[];
  sessions: StoredSession[];
  webhookEvents: string[];
}
