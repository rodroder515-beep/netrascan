import React from 'react';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 28,
  showWordmark = true,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="NetraScan logo"
    >
      {/* Retinal Fundus & Scan Line SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer retina perimeter circle */}
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="var(--rule)"
          strokeWidth="1.25"
          className="transition-colors"
        />
        
        {/* Optic Disc (slightly offset to nasal quadrant) */}
        <circle
          cx="11"
          cy="16"
          r="3"
          stroke="var(--teal)"
          strokeWidth="1"
          strokeDasharray="2 1"
          fill="none"
          opacity="0.85"
        />
        <circle
          cx="11"
          cy="16"
          r="1.2"
          fill="var(--teal)"
          opacity="0.9"
        />

        {/* Retinal vascular arcades (superior and inferior branches) */}
        <path
          d="M11 15C12 11 15 9 19 8.5M19 8.5C21 8.2 23 7.5 25 6M19 8.5C22 10.5 26 11 27 12"
          stroke="var(--teal)"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M11 17C12 21 15 23 19 23.5M19 23.5C21 23.8 23 24.5 25 26M19 23.5C22 21.5 26 21 27 20"
          stroke="var(--teal)"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Foveal avascular zone marker */}
        <circle
          cx="20.5"
          cy="16"
          r="0.9"
          fill="var(--amber)"
          opacity="0.6"
        />

        {/* Amber screening scan line (precision horizontal beam across retina) */}
        <line
          x1="3"
          y1="16"
          x2="29"
          y2="16"
          stroke="var(--amber)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle
          cx="20.5"
          cy="16"
          r="2.2"
          stroke="var(--amber)"
          strokeWidth="1"
          opacity="0.85"
        />
      </svg>

      {/* Wordmark: Netra (medium) + Scan (light) */}
      {showWordmark && (
        <span className="font-heading tracking-tight text-[17px] leading-none">
          <span className="font-medium text-[var(--fg)]">Netra</span>
          <span className="font-light text-[var(--fg-soft)] ml-[1px]">Scan</span>
        </span>
      )}
    </div>
  );
};
