import { useState } from 'react';

export const Avatar = ({ src, alt = '', size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const fallbackBgColors = [
    'bg-red-600',
    'bg-blue-600',
    'bg-green-600',
    'bg-yellow-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-indigo-600',
  ];

  // Pick a color deterministically based on name letters to keep it consistent
  const getFallbackBg = (name) => {
    if (!name) return 'bg-bg-tertiary';
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbackBgColors[charCodeSum % fallbackBgColors.length];
  };

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white border border-border select-none ${sizes[size]} ${className}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center uppercase ${getFallbackBg(alt)}`}>
          {getInitials(alt)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
