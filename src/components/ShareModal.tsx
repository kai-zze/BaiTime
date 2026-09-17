import { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  roomName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  roomName,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    : `https://baitime.vercel.app/?room=${roomCode}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}&bgcolor=FFFFFF&color=FF5B00`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md flat-panel rounded-lg border p-6 overflow-hidden text-center transition-colors animate-modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Share Room Code</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{roomName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="p-3 bg-white rounded-lg border border-teal-500/30 mb-3 shadow-sm">
            <img src={qrImageUrl} alt="Room QR Code" className="w-44 h-44 rounded-lg object-contain" />
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            Scan with iPhone or Android camera to join room
          </p>
        </div>

        {/* Room Code Box */}
        <div className="flat-card rounded-lg p-3 border border-teal-200 dark:border-teal-900/50 mb-4 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase tracking-widest block">
              ROOM CODE
            </span>
            <span className="text-xl font-mono font-black text-teal-600 dark:text-teal-400 tracking-widest">
              {roomCode}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-xs font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Link Box */}
        <div className="flat-card rounded-lg p-3 border flex items-center justify-between gap-2">
          <input
            type="text"
            readOnly
            value={roomUrl}
            className="flex-1 bg-transparent text-xs font-mono text-gray-700 dark:text-gray-300 truncate focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold transition-colors shrink-0 shadow-sm"
          >
            {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
