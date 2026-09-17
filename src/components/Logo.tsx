import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showText?: boolean;
  className?: string;
  isDark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline: _showTagline = true,
  showText = true,
  className = '',
  isDark,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  // Determine dark text vs light text based on prop or Tailwind dark mode
  const baiColorClass =
    isDark === true
      ? 'text-white'
      : isDark === false
      ? 'text-black font-black'
      : 'text-black dark:text-white font-black';

  const accentFill =
    isDark === true
      ? '#38BDF8'
      : isDark === false
      ? '#0F172A'
      : undefined;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Stopwatch Speech Bubble Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 512 512" fill="none" className="w-full h-full drop-shadow-md">
          {/* Top Crown Button */}
          <rect
            x="236"
            y="24"
            width="40"
            height="32"
            rx="8"
            fill={accentFill}
            className={accentFill ? '' : 'fill-slate-900 dark:fill-sky-400'}
          />
          <rect
            x="246"
            y="56"
            width="20"
            height="20"
            fill={accentFill}
            className={accentFill ? '' : 'fill-slate-900 dark:fill-sky-400'}
          />
          
          {/* Left Button */}
          <g transform="rotate(-35, 120, 110)">
            <rect
              x="104"
              y="90"
              width="32"
              height="20"
              rx="6"
              fill={accentFill}
              className={accentFill ? '' : 'fill-slate-900 dark:fill-sky-400'}
            />
          </g>
          
          {/* Right Button */}
          <g transform="rotate(35, 392, 110)">
            <rect x="376" y="90" width="32" height="20" rx="6" fill="#FF5B00" />
          </g>

          {/* Outer Ring Left */}
          <path
            d="M 256 72 A 184 184 0 0 0 100 350 L 140 376 A 136 136 0 0 1 256 120 Z"
            fill={accentFill}
            className={accentFill ? '' : 'fill-slate-900 dark:fill-sky-400'}
          />
          
          {/* Outer Ring Right (Vibrant Orange) */}
          <path d="M 256 72 A 184 184 0 0 1 440 256 A 184 184 0 0 1 380 380 L 344 344 A 136 136 0 0 0 392 256 A 136 136 0 0 0 256 120 Z" fill="#FF5B00" />

          {/* Center Speech Bubble (Vibrant Orange) */}
          <path d="M 256 136 C 185 136 128 193 128 264 C 128 296 140 325 160 347 L 132 412 L 204 388 C 220 397 237 400 256 400 C 327 400 384 343 384 272 C 384 201 327 136 256 136 Z" fill="#FF5B00" />

          {/* 3 White Dots */}
          <circle cx="200" cy="268" r="16" fill="#FFFFFF" />
          <circle cx="256" cy="268" r="16" fill="#FFFFFF" />
          <circle cx="312" cy="268" r="16" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Text & Tagline */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className={`font-black tracking-tight ${textSizes[size]}`}>
            <span className={baiColorClass}>Bai</span>
            <span className="text-[#FF5B00]">Time</span>
          </div>
        </div>
      )}
    </div>
  );
};

