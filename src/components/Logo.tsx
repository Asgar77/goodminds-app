import React from 'react';

interface LogoProps {
  size?: number;
  alt?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 48, alt = 'GoodMind Logo', className }) => (
  <img
    src="/logo-main.png"
    alt={alt}
    width={size}
    height={size}
    className={className}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export default Logo; 