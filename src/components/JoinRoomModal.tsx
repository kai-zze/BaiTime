import React, { useState } from 'react';
import { X, LogIn, Key, User, ArrowLeft, Users } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToWelcome?: () => void;
  onJoinRoom: (code: string, userName: string) => void;
  currentUserName: string;
  currentRoomCode?: string;
  availableSpeakers?: string[];
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onBackToWelcome,
  onJoinRoom,
  currentUserName,
  currentRoomCode = '',
  availableSpeakers = [],
}) => {
  const [roomCode, setRoomCode] = useState(currentRoomCode);
  const [userName, setUserName] = useState(currentUserName);

  // Sync state when modal opens or props change
  React.useEffect(() => {
    if (isOpen) {
      if (currentRoomCode && !roomCode) {
        setRoomCode(currentRoomCode);
      }
      setUserName(currentUserName);
    }
  }, [isOpen, currentRoomCode, currentUserName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) return;
    onJoinRoom(cleanCode, userName.trim() || 'Teammate');
  };

  const cleanRoomCode = roomCode.trim().toUpperCase();
  const isRoomCodeTyped = cleanRoomCode.length > 0;

  // Dynamically resolve roster for the typed room code
  const getSpeakersForTypedRoom = (): string[] => {
    if (!isRoomCodeTyped) return [];

    // 1. Try to fetch cached room state from localStorage for the typed room code
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`baitime_room_state_${cleanRoomCode}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.speakers) && parsed.speakers.length > 0) {
            return parsed.speakers.map((s: { name: string }) => s.name);
          }
        } catch {
          // Fallback
        }
      }
    }

    // 2. If matching currently loaded room code, use availableSpeakers prop
    if (currentRoomCode && cleanRoomCode === currentRoomCode.trim().toUpperCase() && availableSpeakers.length > 0) {
      return availableSpeakers;
    }

    // 3. Fallback default roster
    return ['Member 1', 'Member 2', 'Member 3', 'Member 4'];
  };

  const activeRoster = getSpeakersForTypedRoom();

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
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Sync timer live with your capstone team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              6-Character Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g. DEF15M"
              maxLength={8}
              required
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-mono font-black text-center text-indigo-600 dark:text-indigo-400 uppercase tracking-widest placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            {!isRoomCodeTyped && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium italic mt-1.5 flex items-center gap-1">
                <Key className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Type room code above to reveal team members</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Your Name / Role
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Member 1 or Presenter Name"
              required
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />

            {/* Quick Pick Speaker Chips Configured by Host — ONLY APPEARS WHEN ROOM CODE IS TYPED */}
            {isRoomCodeTyped && activeRoster && activeRoster.length > 0 && (
              <div className="mt-3 p-3 bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2 animate-fade-in">
                <label className="block text-[11px] font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  Select your name from host's roster:
                </label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {activeRoster.map((spName) => (
                    <button
                      key={spName}
                      type="button"
                      onClick={() => setUserName(spName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 flex items-center gap-1 ${
                        userName === spName
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/50'
                          : 'bg-white dark:bg-gray-800 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/60'
                      }`}
                    >
                      <span>{spName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl transition-all active:scale-98 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            <span>Join Room & Start Live Sync</span>
          </button>
        </form>
      </div>
    </div>
  );
};
