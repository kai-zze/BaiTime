import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-url')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to broadcast events via Supabase Realtime Channel or fallback to Local Storage / BroadcastChannel
export class RoomSyncService {
  private channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
  private localBroadcastChannel: BroadcastChannel | null = null;
  private roomCode: string;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    
    // Fallback local broadcast channel for multi-tab support when Supabase key isn't added yet
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.localBroadcastChannel = new BroadcastChannel(`baitime-room-${roomCode}`);
    }
  }

  public async fetchPersistedRoomState(): Promise<any | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('state')
        .eq('code', this.roomCode)
        .maybeSingle();

      if (!error && data && data.state) {
        return data.state;
      }
    } catch {
      // Fallback if table is not created yet
    }
    return null;
  }

  public async persistRoomState(state: any) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('rooms').upsert({
        code: this.roomCode,
        state: state,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Ignore if database table is not created yet
    }
  }

  public subscribe(
    onStateUpdate: (state: any) => void,
    onChatMessage: (msg: any) => void,
    onStageSignal: (sig: any) => void,
    onRequestState?: () => void
  ) {
    if (isSupabaseConfigured && supabase) {
      // Fetch persisted state from Postgres DB immediately upon subscribing
      this.fetchPersistedRoomState().then((persistedState) => {
        if (persistedState) {
          onStateUpdate(persistedState);
        }
      });

      this.channel = supabase.channel(`room:${this.roomCode}`, {
        config: { broadcast: { self: false } },
      });

      this.channel
        .on('broadcast', { event: 'timer-state' }, ({ payload }) => {
          onStateUpdate(payload);
        })
        .on('broadcast', { event: 'chat-message' }, ({ payload }) => {
          onChatMessage(payload);
        })
        .on('broadcast', { event: 'stage-signal' }, ({ payload }) => {
          onStageSignal(payload);
        })
        .on('broadcast', { event: 'request-state' }, () => {
          if (onRequestState) onRequestState();
        })
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${this.roomCode}` },
          (payload: any) => {
            if (payload.new && payload.new.state) {
              onStateUpdate(payload.new.state);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && this.channel) {
            this.channel.send({
              type: 'broadcast',
              event: 'request-state',
              payload: {},
            });
          }
        });
    }

    // Listen to local BroadcastChannel as fallback
    if (this.localBroadcastChannel) {
      this.localBroadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'timer-state') onStateUpdate(payload);
        if (type === 'chat-message') onChatMessage(payload);
        if (type === 'stage-signal') onStageSignal(payload);
        if (type === 'request-state' && onRequestState) onRequestState();
      };
    }
  }

  public broadcastState(state: any) {
    this.persistRoomState(state);
    if (this.channel && isSupabaseConfigured) {
      this.channel.send({
        type: 'broadcast',
        event: 'timer-state',
        payload: state,
      });
    }
    if (this.localBroadcastChannel) {
      this.localBroadcastChannel.postMessage({
        type: 'timer-state',
        payload: state,
      });
    }
  }

  public broadcastChatMessage(msg: any) {
    if (this.channel && isSupabaseConfigured) {
      this.channel.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: msg,
      });
    }
    if (this.localBroadcastChannel) {
      this.localBroadcastChannel.postMessage({
        type: 'chat-message',
        payload: msg,
      });
    }
  }

  public broadcastStageSignal(signal: any) {
    if (this.channel && isSupabaseConfigured) {
      this.channel.send({
        type: 'broadcast',
        event: 'stage-signal',
        payload: signal,
      });
    }
    if (this.localBroadcastChannel) {
      this.localBroadcastChannel.postMessage({
        type: 'stage-signal',
        payload: signal,
      });
    }
  }

  public broadcastRequestState(onState?: (state: any) => void) {
    // Actually USE the persisted state result
    this.fetchPersistedRoomState().then((state) => {
      if (state && onState) onState(state);
    });
    if (this.channel && isSupabaseConfigured) {
      this.channel.send({
        type: 'broadcast',
        event: 'request-state',
        payload: {},
      });
    }
    if (this.localBroadcastChannel) {
      this.localBroadcastChannel.postMessage({
        type: 'request-state',
        payload: {},
      });
    }
  }

  public unsubscribe() {
    if (this.channel && supabase) {
      supabase.removeChannel(this.channel);
    }
    if (this.localBroadcastChannel) {
      this.localBroadcastChannel.close();
    }
  }
}
