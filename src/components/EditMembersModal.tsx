import React, { useState } from 'react';
import type { Speaker } from '../types/timer';
import { X, Users, Plus, Trash2, Clock, Sparkles, Check, ClipboardList } from 'lucide-react';

interface MemberEditEntry {
  id?: string;
  name: string;
  topic: string;
  minutes: number | string;
}

interface EditMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  speakers: Speaker[];
  totalDurationSeconds: number;
  onSaveMembers: (
    members: Array<{ id?: string; name: string; topic: string; minutes: number }>,
    totalMinutes?: number
  ) => void;
}

const EditMembersDialog: React.FC<Omit<EditMembersModalProps, 'isOpen'>> = ({
  onClose,
  roomCode,
  speakers,
  totalDurationSeconds,
  onSaveMembers,
}) => {
  const [members, setMembers] = useState<MemberEditEntry[]>(() => {
    if (speakers && speakers.length > 0) {
      return speakers.map((s) => ({
        id: s.id,
        name: s.name,
        topic: s.topic || '',
        minutes: Number((s.allocatedSeconds / 60).toFixed(1)),
      }));
    }
    return [
      { name: 'Member 1', topic: '', minutes: 3 },
      { name: 'Member 2', topic: '', minutes: 3 },
    ];
  });

  const [totalMinutes, setTotalMinutes] = useState<number | string>(() =>
    Math.max(1, Math.round(totalDurationSeconds / 60))
  );

  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      { name: `Member ${prev.length + 1}`, topic: '', minutes: 3 },
    ]);
  };

  const handleRemoveMember = (idx: number) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (idx: number, field: keyof MemberEditEntry, val: string | number) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
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
    const cleanMembers = members.map((m, idx) => ({
      id: m.id,
      name: m.name.trim() || `Speaker ${idx + 1}`,
      topic: m.topic.trim(),
      minutes: Math.max(0.2, Number(m.minutes) || 1),
    }));
    const numTotalMinutes = Math.max(1, Number(totalMinutes) || 15);
    onSaveMembers(cleanMembers, numTotalMinutes);
    onClose();
  };

  const allocatedTotal = members.reduce((sum, m) => sum + (Number(m.minutes) || 0), 0);
  const numTotalMins = Number(totalMinutes) || 15;
  const isMismatch = Math.abs(allocatedTotal - numTotalMins) > 0.1;

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-slate-900/80 backdrop-blur-sm text-gray-900 dark:text-white flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111C38] border border-gray-200 dark:border-indigo-900/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-message-pop">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/80 dark:bg-gray-900/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#FF5B00]/10 text-[#FF5B00] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-wide">
                  Edit Members & Presentation Topics
                </h2>
                <span className="text-[10px] font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/30">
                  ROOM: {roomCode}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Update speaker names, 2-line topics, and time allocations live without creating a new room.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Member List Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Total Defense Duration & Split Evenly Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-purple-500/5 dark:bg-purple-950/20 p-3.5 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Total Defense Time:</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={totalMinutes}
                  onChange={(e) => setTotalMinutes(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                  className="w-16 bg-white dark:bg-gray-900 border border-purple-300 dark:border-purple-700 rounded-lg px-2 py-1 text-xs font-mono font-black text-center text-purple-600 dark:text-purple-400 focus:outline-none"
                />
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">mins</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSplitEvenly}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-black border border-purple-500/30 hover:bg-purple-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Split Evenly ({Number((numTotalMins / Math.max(members.length, 1)).toFixed(1))}m each)</span>
            </button>
          </div>

          {/* Member Rows */}
          <div className="space-y-3">
            {members.map((m, idx) => (
              <div
                key={m.id || idx}
                className="bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 space-y-2.5 shadow-xs"
              >
                {/* Header row: Speaker # and Allocated minutes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Speaker Slot {idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 rounded-lg px-2 py-1">
                      <Clock className="w-3 h-3 text-purple-500" />
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        max="180"
                        value={m.minutes}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleChange(idx, 'minutes', val === '' ? '' : Math.max(0, Number(val)));
                        }}
                        onBlur={() => {
                          if (m.minutes === '' || Number(m.minutes) <= 0) {
                            handleChange(idx, 'minutes', 3);
                          }
                        }}
                        className="w-12 bg-transparent text-xs font-mono font-black text-center text-purple-600 dark:text-purple-400 focus:outline-none"
                      />
                      <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">min</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      disabled={members.length <= 1}
                      className="p-1 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-30 transition-colors rounded cursor-pointer"
                      title="Remove Speaker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Presenter Name
                  </label>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => handleChange(idx, 'name', e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Topic / Description Input (2-line support) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <ClipboardList className="w-3 h-3 text-purple-500" />
                      <span>Reporting Topic / Description (2 lines supported)</span>
                    </label>
                    <span className="text-[9px] font-mono text-gray-400">Press Enter for 2nd line</span>
                  </div>
                  <textarea
                    rows={2}
                    value={m.topic}
                    onChange={(e) => handleChange(idx, 'topic', e.target.value)}
                    placeholder="Presentation topic or description (e.g. Line 1: Main Focus&#10;Line 2: Specific Deliverables)"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500 whitespace-pre-wrap resize-y leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Speaker Button */}
          <button
            type="button"
            onClick={handleAddMember}
            className="w-full py-2.5 px-3 border border-dashed border-gray-400 dark:border-gray-700 hover:border-purple-500 hover:text-purple-600 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>+ Add Another Speaker</span>
          </button>

          {/* Allocation notice if mismatch */}
          {isMismatch && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-300 dark:border-amber-800">
              Note: Sum of member times ({allocatedTotal.toFixed(1)}m) does not equal total session duration ({numTotalMins}m).
            </p>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-[#FF5B00] hover:bg-[#E05000] text-white border border-[#FF5B00] shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Update Members Live</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditMembersModal: React.FC<EditMembersModalProps> = ({
  isOpen,
  ...rest
}) => {
  if (!isOpen) return null;
  return <EditMembersDialog {...rest} />;
};
