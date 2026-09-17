import React, { useState, useEffect } from 'react';
import { X, LogIn, Key, User, ArrowLeft, Users, Check, RefreshCw } from 'lucide-react';
import { RoomSyncService, supabase } from '../lib/supabase';

interface SpeakerItem {
  name: string;
  topic?: string;
}

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToWelcome?: () => void;
  onJoinRoom: (code: string, userName: string) => void;
  currentUserName?: string;
  currentRoomCode?: string;
  availableSpeakers?: string[];
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onBackToWelcome,
  onJoinRoom,
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [liveSpeakers, setLiveSpeakers] = useState<SpeakerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cleanRoomCode = roomCode.trim().toUpperCase();
  const isRoomCodeTyped = cleanRoomCode.length > 0;

  // Directly fetch from Supabase DB when a complete 6-char room code is entered
  useEffect(() => {
    if (!isOpen || cleanRoomCode.length < 6) {
      if (cleanRoomCode.length < 6) setLiveSpeakers([]);
      return;
    }

    setIsLoading(true);

    // 1. Direct DB fetch (works across ANY device, any network, no WebSocket needed)
    const fetchFromDB = async () => {
      try {
        if (!supabase) return false;
        const { data, error } = await supabase
          .from('rooms')
          .select('state')
          .eq('code', cleanRoomCode)
          .maybeSingle();

        if (!error && data && data.state && Array.isArray(data.state.speakers)) {
          const items: SpeakerItem[] = data.state.speakers.map((s: any) => ({
            name: s.name,
            topic: s.topic,
          }));
          if (items.length > 0) {
            setLiveSpeakers(items);
            setIsLoading(false);
            return true;
          }
        }
      } catch {
        // Supabase table may not exist yet, fall through to WebSocket
      }
      return false;
    };

    // 2. WebSocket subscription for live updates after host changes state
    const syncService = new RoomSyncService(cleanRoomCode);
    syncService.subscribe(
      (incomingState: any) => {
        if (incomingState && Array.isArray(incomingState.speakers)) {
          const items: SpeakerItem[] = incomingState.speakers.map((s: any) => ({
            name: s.name,
            topic: s.topic,
          }));
          if (items.length > 0) {
            setLiveSpeakers(items);
            setIsLoading(false);
          }
        }
      },
      () => {},
      () => {},
      () => {}
    );

    // Try DB first, then fall back to WebSocket request
    fetchFromDB().then((found) => {
      if (!found) {
        // Retry WebSocket requests since DB had no data (host might not have saved yet)
        syncService.broadcastRequestState();
        const t1 = setTimeout(() => syncService.broadcastRequestState(), 300);
        const t2 = setTimeout(() => syncService.broadcastRequestState(), 800);
        const t3 = setTimeout(() => { syncService.broadcastRequestState(); setIsLoading(false); }, 2000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
      }
    });

    return () => {
      syncService.unsubscribe();
    };
  }, [isOpen, cleanRoomCode]);

  if (!isOpen) return null;

  // Resolve speakers roster for typed room code
  const getSpeakersForTypedRoom = (): SpeakerItem[] => {
    if (!isRoomCodeTyped || cleanRoomCode.length < 3) return [];

    // 1. Live speakers received from host real-time channel
    if (liveSpeakers.length > 0) {
      return liveSpeakers;
    }

    // 2. Try cached room state from localStorage (if host created on same device/browser)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`baitime_room_state_${cleanRoomCode}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.speakers) && parsed.speakers.length > 0) {
            return parsed.speakers.map((s: any) => ({
              name: s.name,
              topic: s.topic,
            }));
          }
        } catch {
          // Fallback
        }
      }
    }

    // Return empty array while waiting for live host response (do NOT populate fake Member 1..4)
    return [];
  };

  const activeRoster = getSpeakersForTypedRoom();

  const handleSelectAndJoin = (nameToJoin: string) => {
    if (!cleanRoomCode) return;
    onJoinRoom(cleanRoomCode, nameToJoin.trim() || 'Teammate');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetName = showCustomInput ? customName : selectedName;
    if (!cleanRoomCode || !targetName.trim()) return;
    onJoinRoom(cleanRoomCode, targetName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md flat-panel rounded-2xl border border-gray-200 dark:border-gray-800 p-6 overflow-hidden transition-colors shadow-2xl animate-modal-pop">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700/80">
          <div className="flex items-center gap-2.5">
            {onBackToWelcome && (
              <button
                type="button"
                onClick={onBackToWelcome}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Back to Role Chooser"
              >
                <ArrowLeft className="w-5 h-5 text-indigo-500" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-sm shrink-0">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Join Presentation Room</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Select your name to sync timer live</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          
          {/* Step 1: 6-Character Room Code */}
          <div>
            <label className="block text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              6-Character Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                setSelectedName('');
              }}
              placeholder="e.g. DEF15M"
              maxLength={8}
              required
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-mono font-black text-center text-indigo-600 dark:text-indigo-400 uppercase tracking-widest placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            {!isRoomCodeTyped && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium italic mt-1.5 flex items-center gap-1">
                <Key className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Type 6-character room code above to load host roster</span>
              </p>
            )}
          </div>

          {/* Step 2: Directly Select Name from Host Roster */}
          {isRoomCodeTyped && (
            <div className="p-3.5 bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                  Select Your Name:
                </label>
                {liveSpeakers.length > 0 ? (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Host Roster Live
                  </span>
                ) : cleanRoomCode.length >= 6 ? (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/30 animate-pulse">
                    Syncing Host Roster...
                  </span>
                ) : null}
              </div>

              {activeRoster.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-0.5">
                  {activeRoster.map((sp) => {
                    const isSelected = selectedName === sp.name;
                    return (
                      <button
                        key={sp.name}
                        type="button"
                        onClick={() => {
                          setSelectedName(sp.name);
                          handleSelectAndJoin(sp.name);
                        }}
                        className={`w-full p-3 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between gap-2 active:scale-98 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg ring-2 ring-indigo-400/50'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <User className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                            <span className="font-extrabold text-sm truncate">{sp.name}</span>
                          </div>
                          {sp.topic && (
                            <span className={`text-[11px] font-semibold block truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-purple-600 dark:text-purple-300'}`}>
                              📋 {sp.topic}
                            </span>
                          )}
                        </div>

                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          <span>Tap to Join</span>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-white/60 dark:bg-gray-900/60 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700/60 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 animate-spin">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {cleanRoomCode.length < 6
                        ? 'Type the full 6-character room code'
                        : <>Syncing Host Roster for Room <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">{cleanRoomCode}</span></>
                      }
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {cleanRoomCode.length >= 6
                        ? 'If the host has created this room, their custom names will pop up automatically.'
                        : 'Ask your host for the 6-character room code.'}
                    </p>
                  </div>
                  {cleanRoomCode.length >= 6 && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!cleanRoomCode) return;
                        setIsLoading(true);
                        try {
                          if (supabase) {
                            const { data } = await supabase.from('rooms').select('state').eq('code', cleanRoomCode).maybeSingle();
                            if (data && data.state?.speakers?.length > 0) {
                              setLiveSpeakers(data.state.speakers.map((s: any) => ({ name: s.name, topic: s.topic })));
                              setIsLoading(false);
                              return;
                            }
                          }
                        } catch { /* fallback */ }
                        const svc = new RoomSyncService(cleanRoomCode);
                        svc.subscribe(
                          (st: any) => {
                            if (st?.speakers?.length > 0) {
                              setLiveSpeakers(st.speakers.map((s: any) => ({ name: s.name, topic: s.topic })));
                              setIsLoading(false);
                              svc.unsubscribe();
                            }
                          },
                          () => {}, () => {}, () => {}
                        );
                        svc.broadcastRequestState();
                        setTimeout(() => { setIsLoading(false); svc.unsubscribe(); }, 3000);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{isLoading ? 'Syncing...' : 'Re-sync Host Roster'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Optional Custom Name Toggle */}
              <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center">
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    + Name not listed? Type custom name
                  </button>
                ) : (
                  <form onSubmit={handleCustomSubmit} className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Type your custom name..."
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!customName.trim()}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black disabled:opacity-40 cursor-pointer"
                    >
                      Join as {customName.trim() || 'Custom Presenter'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
