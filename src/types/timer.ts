export type SpeakerStatus = 'waiting' | 'active' | 'completed';

export interface Speaker {
  id: string;
  name: string;
  topic?: string;
  allocatedSeconds: number;
  elapsedSeconds: number;
  status: SpeakerStatus;
}

export interface PenaltyConfig {
  enabled: boolean;
  pointsPerInterval: number; // e.g., 1 point
  intervalSeconds: number;  // e.g., 30 seconds
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface TimerState {
  roomCode: string;
  roomName: string;
  totalDurationSeconds: number; // e.g. 900 = 15 mins
  elapsedSeconds: number;
  status: TimerStatus;
  currentSpeakerIndex: number;
  speakers: Speaker[];
  penaltyConfig: PenaltyConfig;
  lastUpdated: number;
  hostId: string;
}

export type StageSignalType = 'wrap_up' | 'speak_louder' | 'next_slide' | 'one_min_left' | 'mental_block';

export interface StageSignal {
  id: string;
  type: StageSignalType;
  senderName: string;
  message: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSignal?: boolean;
  signalType?: StageSignalType;
}

export interface UserRole {
  isHost: boolean;
  userId: string;
  userName: string;
}
