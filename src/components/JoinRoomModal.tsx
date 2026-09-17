import React, { useState, useEffect } from 'react';
import { X, LogIn, Key, User, ArrowLeft, Users, Check } from 'lucide-react';
import { RoomSyncService } from '../lib/supabase';

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
  currentRoomCode = '',
  availableSpeakers = [],
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [liveSpeakers, setLiveSpeakers] = useState<SpeakerItem[]>([]);

  const cleanRoomCode = roomCode.trim().toUpperCase();
  const isRoomCodeTyped = cleanRoomCode.length > 0;

  // Listen live to host room state when member types 6-character room code
  useEffect(() => {
    if (!isOpen || cleanRoomCode.length < 6) {
      setLiveSpeakers([]);
      return;
    }

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
          }
        }
      },
      () => {},
      () => {},
      () => {}
    );

    // Request state immediately and retry after short delay to ensure channel is ready
    syncService.broadcastRequestState();
    const timer = setTimeout(() => {
      syncService.broadcastRequestState();
    }, 300);

    return () => {
      clearTimeout(timer);
      syncService.unsubscribe();
    };
  }, [isOpen, cleanRoomCode]);

  if (!isOpen) return null;

  // Resolve speakers roster for typed room code
  const getSpeakersForTypedRoom = (): SpeakerItem[] => {
    if (!isRoomCodeTyped) return [];

    // 1. Live speakers received from host real-time channel
    if (liveSpeakers.length > 0) {
      return liveSpeakers;
    }

    // 2. Try cached room state from localStorage
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

    // 3. Fallback to availableSpeakers prop
    if (currentRoomCode && cleanRoomCode === currentRoomCode.trim().toUpperCase() && availableSpeakers.length > 0) {
      return availableSpeakers.map((n) => ({ name: n }));
    }

    // 4. Instant fallback roster cards while live channel connects
    return [
      { name: 'Member 1', topic: 'Introduction & Problem Statement' },
      { name: 'Member 2', topic: 'System Architecture & Methodology' },
      { name: 'Member 3', topic: 'Live Feature Demo & Implementation' },
      { name: 'Member 4', topic: 'Results, Conclusion & Defense Q&A' },
    ];
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
                <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400 italic">
                  Fetching host speaker roster... If host is ready, names will pop up here!
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
