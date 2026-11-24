import { useState } from 'react';
import { Code2 } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  title?: string;
  className?: string;
  imgClassName?: string;
}

export function ResilientImage({
  src,
  alt,
  title,
  className = '',
  imgClassName = '',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#F3EDE4] via-[#FAF7F2] to-[#EBE2D6] dark:from-[#1C1814] dark:via-[#141210] dark:to-[#0E0C0A] text-[#574E44] dark:text-[#A89F94] overflow-hidden ${className}`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_30%_25%,rgba(212,155,84,0.28),transparent_60%)]"
        />
        <Code2 className="w-8 h-8 text-[#A66824] dark:text-[#D49B54]/80 mb-2 relative z-10" strokeWidth={1.5} />
        {title && (
          <span
            dir="ltr"
            className="text-xs font-mono-tech text-[#433B33] dark:text-[#C8BEB2] px-4 text-center truncate max-w-full relative z-10"
          >
            {title}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F3EDE4] dark:bg-[#141210] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
