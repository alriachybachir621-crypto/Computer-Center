import React, { useRef } from 'react';

export const BRAND_LOGO_PATH = '/assets/aistudio/image_0b9c65a5.png';

interface BrandMarkProps {
  label: string;
  onSecretTrigger: () => void;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  tone?: 'light' | 'dark';
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  label,
  onSecretTrigger,
  size = 'sm',
  showWordmark = true,
  tone = 'light',
}) => {
  const tapCountRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const handleTap = () => {
    tapCountRef.current += 1;

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      timerRef.current = null;
      onSecretTrigger();
      return;
    }

    timerRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
      timerRef.current = null;
    }, 1800);
  };

  const sizeClass =
    size === 'lg'
      ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl'
      : size === 'md'
        ? 'w-12 h-12 rounded-xl'
        : 'w-9 h-9 rounded-lg';

  return (
    <button
      type="button"
      onClick={handleTap}
      className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-start select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245A2A] rounded-xl py-0.5"
      aria-label={label}
    >
      <span
        className={`${sizeClass} overflow-hidden shrink-0 border ${
          tone === 'dark' ? 'border-[#5EE0A0]/40' : 'border-[#245A2A]/25'
        } bg-[#245A2A] shadow-xs inline-block`}
      >
        <img
          src={BRAND_LOGO_PATH}
          alt={label}
          className="w-full h-full object-cover object-center"
        />
      </span>
      {showWordmark && (
        <span
          className={`text-base sm:text-lg font-bold tracking-tight ${
            tone === 'dark' ? 'text-white' : 'text-[#1B2B1E]'
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
};
