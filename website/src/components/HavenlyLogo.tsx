import React from 'react';

interface HavenlyLogoProps {
  size?: number;
  height?: number;
  variant?: 'horizontal' | 'vertical' | 'mark' | 'icon';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  tagline?: 'cowork' | 'togetherness';
}

export const HavenlyLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = ''
}) => {
  return (
    <img
      src="/brand/app-icon.svg"
      alt="HavenlyWork"
      style={{ width: size, height: size }}
      className={`rounded-xl object-contain shrink-0 ${className}`}
    />
  );
};

export const HavenlyLogo: React.FC<HavenlyLogoProps> = ({
  size,
  height = 36,
  variant = 'horizontal',
  theme = 'auto',
  className = ''
}) => {
  const effectiveHeight = height || size || 36;

  if (variant === 'mark' || variant === 'icon') {
    return <HavenlyLogoMark size={effectiveHeight} className={className} />;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <img
          src="/brand/app-logo-vertical.svg"
          alt="HavenlyWork"
          style={{ height: effectiveHeight * 2.2, maxWidth: '100%' }}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {theme === 'light' ? (
        <img
          src="/brand/logo-light.svg"
          alt="HavenlyWork"
          style={{ height: effectiveHeight, maxWidth: '100%' }}
          className="object-contain"
        />
      ) : theme === 'dark' ? (
        <img
          src="/brand/logo-dark.svg"
          alt="HavenlyWork"
          style={{ height: effectiveHeight, maxWidth: '100%' }}
          className="object-contain"
        />
      ) : (
        <>
          <img
            src="/brand/logo-light.svg"
            alt="HavenlyWork"
            style={{ height: effectiveHeight, maxWidth: '100%' }}
            className="dark:hidden block object-contain"
          />
          <img
            src="/brand/logo-dark.svg"
            alt="HavenlyWork"
            style={{ height: effectiveHeight, maxWidth: '100%' }}
            className="hidden dark:block object-contain"
          />
        </>
      )}
    </div>
  );
};
