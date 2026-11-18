import React, { useState } from 'react';
import { Monitor } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/60 text-slate-400 p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Monitor className="w-8 h-8 text-emerald-600/60 mb-2" strokeWidth={1.5} />
        {fallbackTitle && (
          <span className="text-xs font-medium text-slate-500 line-clamp-2 max-w-[180px]">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
};
