import React from 'react';

interface HavenlyLogoProps {
  size?: number;
  variant?: 'horizontal' | 'vertical' | 'mark';
  theme?: 'dark' | 'light';
  className?: string;
  tagline?: 'cowork' | 'togetherness';
}

export const HavenlyLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="hwPillarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#00A859" />
        </linearGradient>
        <linearGradient id="hwLeafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#00A859" />
        </linearGradient>
      </defs>

      {/* Ground arc */}
      <path
        d="M 12 98 Q 60 88 108 98"
        stroke="#00A859"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Left pillar of H */}
      <path
        d="M 28 98 L 28 32 C 28 22 34 18 42 18 C 50 18 56 22 56 32 L 56 98 Z"
        fill="url(#hwPillarGrad)"
      />

      {/* Right pillar of H */}
      <path
        d="M 64 98 L 64 32 C 64 22 70 18 78 18 C 86 18 92 22 92 32 L 92 98 Z"
        fill="url(#hwPillarGrad)"
      />

      {/* Interior arch cutout */}
      <path
        d="M 44 98 L 44 62 C 44 50 50 44 60 44 C 70 44 76 50 76 62 L 76 98 Z"
        fill="#FFFFFF"
        className="fill-white dark:fill-[#0A0F1D]"
      />

      {/* Sweeping Vine Stem */}
      <path
        d="M 28 62 C 34 50 48 40 68 44 C 84 48 94 40 102 34"
        stroke="#00A859"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Elegant Leaf at vine tip */}
      <path
        d="M 98 34 C 104 22 116 26 116 32 C 116 42 104 44 98 34 Z"
        fill="url(#hwLeafGrad)"
      />

      {/* Pendant Lamp */}
      <line x1="60" y1="44" x2="60" y2="52" stroke="#00A859" strokeWidth="2" strokeLinecap="round" />
      <path d="M 54 57 C 54 53 66 53 66 57 Z" fill="#00A859" />
      <circle cx="60" cy="58" r="1.5" fill="#F59E0B" />

      {/* Center Table */}
      <ellipse cx="60" cy="74" rx="10" ry="2.5" fill="#00A859" />
      <line x1="60" y1="76" x2="60" y2="88" stroke="#00A859" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="88" x2="68" y2="88" stroke="#00A859" strokeWidth="2.5" strokeLinecap="round" />

      {/* Potted Plant */}
      <path d="M 58 72 L 62 72 L 61 74 L 59 74 Z" fill="#00A859" />
      <circle cx="60" cy="70" r="1.5" fill="#10B981" />

      {/* Left Chair */}
      <path d="M 46 68 C 46 64 49 64 49 68 L 49 76 L 46 76 Z" fill="#00A859" />
      <line x1="46" y1="76" x2="52" y2="76" stroke="#00A859" strokeWidth="2" strokeLinecap="round" />
      <line x1="47" y1="78" x2="45" y2="88" stroke="#00A859" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="78" x2="51" y2="88" stroke="#00A859" strokeWidth="2" strokeLinecap="round" />

      {/* Right Chair */}
      <path d="M 74 68 C 74 64 71 64 71 68 L 71 76 L 74 76 Z" fill="#00A859" />
      <line x1="68" y1="76" x2="74" y2="76" stroke="#00A859" strokeWidth="2" strokeLinecap="round" />
      <line x1="73" y1="78" x2="75" y2="88" stroke="#00A859" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="78" x2="69" y2="88" stroke="#00A859" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const HavenlyLogo: React.FC<HavenlyLogoProps> = ({
  size = 40,
  variant = 'horizontal',
  className = '',
  tagline = 'togetherness'
}) => {
  if (variant === 'mark') {
    return <HavenlyLogoMark size={size} className={className} />;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <HavenlyLogoMark size={size} />
        <div className="mt-2.5">
          <span className="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-white">
            Havenly<span className="text-[#00A859]">Work</span>
          </span>
          <div className="flex items-center justify-center space-x-2 mt-1">
            <span className="w-5 h-[1px] bg-slate-300 dark:bg-slate-700" />
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
              {tagline === 'togetherness' ? 'SPACE FOR TOGETHERNESS' : 'COWORK • CONNECT • GROW'}
            </span>
            <span className="w-5 h-[1px] bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`flex items-center space-x-3.5 ${className}`}>
      <HavenlyLogoMark size={size} className="shrink-0" />
      <div className="h-7 w-[1px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />
      <div className="min-w-0">
        <div className="flex items-baseline space-x-1">
          <span className="font-display font-black text-xl tracking-tight text-slate-900 dark:text-white">
            Havenly<span className="text-[#00A859]">Work</span>
          </span>
        </div>
        <div className="flex items-center space-x-1.5 -mt-0.5">
          <span className="w-3 h-[1px] bg-slate-300 dark:bg-slate-700" />
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 truncate">
            {tagline === 'togetherness' ? 'SPACE FOR TOGETHERNESS' : 'COWORK • CONNECT • GROW'}
          </span>
          <span className="w-3 h-[1px] bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
};
