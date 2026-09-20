import React, { useState } from 'react';
import { X, Plus, Trash2, Clock, Users, Sparkles, ArrowLeft, Key, User } from 'lucide-react';

interface MemberEntry {
  name: string;
  topic: string;
  minutes: number | string;
}

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToWelcome?: () => void;
  onCreateRoom: (
    roomName: string,
    totalMinutes: number,
    members: Array<{ name: string; topic: string; minutes: number }>,
    hostName?: string,
    roomCode?: string
  ) => void;
  onReenterRoom?: (code: string, hostName?: string) => void;
  currentRoomCode?: string;
  currentHostName?: string;
}

const DEFAULT_MEMBERS: MemberEntry[] = [
  { name: 'Member 1', topic: 'Introduction & Problem Statement', minutes: 3 },
  { name: 'Member 2', topic: 'System Architecture & Methodology', minutes: 3 },
  { name: 'Member 3', topic: 'Live Feature Demo & Implementation', minutes: 3 },
  { name: 'Member 4', topic: 'Results, Conclusion & Defense Q&A', minutes: 3 },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onBackToWelcome,
  onCreateRoom,
  onReenterRoom,
  currentRoomCode = '',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'reenter'>('create');
  const [hostName, setHostName] = useState('');
  const [createRoomCode, setCreateRoomCode] = useState<string>(() => {
    return currentRoomCode || 'DEF15M';
  });
  const [roomName, setRoomName] = useState('Capstone Mock Defense');
  const [totalMinutes, setTotalMinutes] = useState<number | string>(15);
  const [members, setMembers] = useState<MemberEntry[]>(DEFAULT_MEMBERS);
  const [reenterCode, setReenterCode] = useState<string>(() => {
    return localStorage.getItem('baitime_last_created_room') || currentRoomCode || '';
  });

  if (!isOpen) return null;

  const handleGenerateNewCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateRoomCode(code);
  };

  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      { name: `Member ${prev.length + 1}`, topic: '', minutes: 3 },
    ]);
  };

  const handleAddMyself = () => {
    const hName = hostName.trim() || 'Host Leader';
    setMembers((prev) => [
      ...prev,
      { name: hName, topic: '', minutes: 3 },
    ]);
  };

  const handleRemove = (i: number) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleChange = (i: number, key: keyof MemberEntry, val: string | number) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: val };
      return copy;
    });
  };

  const handleSplitEvenly = () => {
    if (!members.length) return;
    const numTotal = Number(totalMinutes) || 15;
    const split = Number((numTotal / members.length).toFixed(1));
    setMembers((prev) => prev.map((m) => ({ ...m, minutes: split })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHostName = hostName.trim() || 'Host Leader';
    if (activeTab === 'reenter') {
      if (!reenterCode.trim()) return;
      if (onReenterRoom) onReenterRoom(reenterCode.trim(), cleanHostName);
      return;
    }

    if (!roomName.trim()) return;
    const numTotalMinutes = Math.max(1, Number(totalMinutes) || 15);
    const cleanMembers = members.map((m) => ({
      name: m.name.trim() || 'Speaker',
      topic: m.topic.trim(),
      minutes: Math.max(0.5, Number(m.minutes) || 1),
    }));
    const cleanCode = createRoomCode.trim().toUpperCase() || currentRoomCode || 'DEF15M';
    onCreateRoom(roomName.trim(), numTotalMinutes, cleanMembers, cleanHostName, cleanCode);
  };

  const allocatedTotal = members.reduce((s, m) => s + (Number(m.minutes) || 0), 0);
  const numTotalMins = Number(totalMinutes) || 15;
  const isMismatch = Math.abs(allocatedTotal - numTotalMins) > 0.1;

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-slate-50 text-gray-900 dark:bg-[#0B132B] dark:text-white flex flex-col justify-between overflow-hidden transition-colors duration-200">
      <div className="w-full max-w-3xl mx-auto flex flex-col h-full justify-between p-3 sm:p-6 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-white/60 dark:bg-[#111C38]/60 backdrop-blur-md rounded-2xl mb-2">
          <div className="flex items-center gap-2">
            {onBackToWelcome && (
              <button
                type="button"
                onClick={onBackToWelcome}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl bg-gray-200/80 dark:bg-gray-800/80 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors mr-1 cursor-pointer"
                title="Back to Role Chooser"
              >
                <ArrowLeft className="w-5 h-5 text-[#FF5B00]" />
              </button>
            )}
            <div>
              <h2 className="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-wide flex items-center gap-2">
                <span>Host Defense Session & Speaker Management</span>
                {currentRoomCode && (
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                    ROOM: {currentRoomCode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Configure room title, defense total duration, and speaker slot allocations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onBackToWelcome) {
                onBackToWelcome();
              } else {
                onClose();
              }
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl bg-gray-200/80 dark:bg-gray-800/80 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Close & Go Back"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Mode Tab Toggle ── */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/80 p-1.5 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Room</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reenter')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'reenter'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Re-enter Room Number</span>
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-4">
            {activeTab === 'reenter' ? (
              <div className="space-y-4 py-2">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <p className="font-black text-purple-600 dark:text-purple-400 text-sm mb-1 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-purple-500" />
                    <span>Returning Host Session</span>
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    Already created a defense session? Enter your 6-character Room Code below to resume full host controls.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5">
                    Room Code / Number
                  </label>
                  <input
                    type="text"
                    value={reenterCode}
                    onChange={(e) => setReenterCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DEF15M or BAI-8941"
                    required
                    maxLength={10}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-mono font-black text-center text-purple-600 dark:text-purple-400 tracking-wider placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500 uppercase shadow-inner"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Host Name + Room Code + Room title + total time */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-purple-500/5 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-500/20">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-500" />
                      <span>Your Host Name</span>
                    </label>
                    <input
                      type="text"
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="e.g. Host Leader"
                      required
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-purple-500" />
                        <span>6-Character Room Code</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateNewCode}
                        className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Random Code</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={createRoomCode}
                      onChange={(e) => setCreateRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="e.g. DEF15M"
                      maxLength={6}
                      required
                      className="w-full bg-white dark:bg-gray-900 border border-purple-300 dark:border-purple-700/80 rounded-xl px-3 py-2 text-base font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest focus:outline-none focus:border-purple-500 shadow-inner"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5">
                      Session Title & Description
                    </label>
                    <textarea
                      rows={2}
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Capstone Mock Defense (Press Enter for new line)"
                      required
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 whitespace-pre-wrap resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5">
                      Total (min)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max="180"
                      value={totalMinutes}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTotalMinutes(val === '' ? '' : Math.max(0, Number(val)));
                      }}
                      onBlur={() => {
                        if (totalMinutes === '' || Number(totalMinutes) < 1) {
                          setTotalMinutes(15);
                        }
                      }}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-mono font-black text-purple-600 dark:text-purple-400 text-center focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Members section header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wide">
                      Speakers ({members.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSplitEvenly}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-black border border-purple-500/30 hover:bg-purple-500/20 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Split evenly ({Number((numTotalMins / Math.max(members.length, 1)).toFixed(1))}m)
                  </button>
                </div>

                {/* Member Cards */}
                <div className="space-y-2">
                  {members.map((m, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2"
                    >
                      {/* Row: slot number + delete */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Speaker {i + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Minutes */}
                          <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 rounded-lg px-2 py-1">
                            <input
                              type="number"
                              step="any"
                              min="0.1"
                              max="180"
                              value={m.minutes}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleChange(i, 'minutes', val === '' ? '' : Math.max(0, Number(val)));
                              }}
                              onBlur={() => {
                                if (m.minutes === '' || Number(m.minutes) <= 0) {
                                  handleChange(i, 'minutes', 3);
                                }
                              }}
                              className="w-12 bg-transparent text-xs font-mono font-black text-center text-purple-600 dark:text-purple-400 focus:outline-none"
                            />
                            <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">min</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(i)}
                            disabled={members.length <= 1}
                            className="p-1 text-gray-500 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-30 transition-colors rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Name */}
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleChange(i, 'name', e.target.value)}
                        placeholder="Speaker name"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />

                      {/* Topic & Description (Multi-line enabled) */}
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                          Topic / Description (Press Enter for 2nd line)
                        </label>
                        <textarea
                          rows={2}
                          value={m.topic}
                          onChange={(e) => handleChange(i, 'topic', e.target.value)}
                          placeholder="Presentation topic or description (e.g. 2 lines — press Enter for line 2)"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/60 whitespace-pre-wrap resize-y"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Speaker Action Buttons: Add Myself as Presenter & Add Another Speaker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAddMyself}
                    className="py-2.5 px-3 border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-xl text-xs font-black text-purple-700 dark:text-purple-300 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>+ Add Myself ({hostName.trim() || 'Host'}) as Presenter</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="py-2.5 px-3 border border-dashed border-gray-400 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-purple-600 hover:border-purple-500 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>+ Add Another Speaker</span>
                  </button>
                </div>

                {/* Time mismatch warning */}
                {isMismatch && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                      <span className="text-gray-800 dark:text-gray-200">
                        Speaker times total <strong className="text-amber-600 dark:text-amber-400">{allocatedTotal}m</strong> — limit is <strong className="text-amber-600 dark:text-amber-400">{totalMinutes}m</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSplitEvenly}
                      className="font-black underline ml-2 shrink-0 text-amber-600 dark:text-amber-400"
                    >
                      Fix
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sticky Footer ── */}
          <div className="px-5 pb-5 pt-2 border-t border-gray-200 dark:border-gray-700 shrink-0 sticky bottom-0 bg-inherit">
            {activeTab === 'reenter' ? (
              <button
                type="submit"
                disabled={!reenterCode.trim()}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-black tracking-wide transition-all active:scale-98 shadow-md disabled:opacity-40"
              >
                <span className="flex items-center justify-center gap-2">
                  <Key className="w-4 h-4" />
                  Re-enter & Resume Host Session
                </span>
              </button>
            ) : (
              <button
                type="submit"
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-black tracking-wide transition-all active:scale-98 shadow-md"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="msym text-lg">workspace_premium</span>
                  Create Room & Claim Host
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
