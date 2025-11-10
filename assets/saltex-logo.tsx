import React from 'react';

export const SaltexLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 280 100" // Adjusted viewBox for text-only logo
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    preserveAspectRatio="xMidYMid meet"
  >
    <g fill="#004494">
      {/* Monogram has been removed */}
      
      {/* Text - Repositioned for centering */}
      <text 
        x="0" 
        y="45" 
        fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
        fontSize="46" 
        fontWeight="700"
        letterSpacing="1"
      >
        SALTEX
      </text>
      <text 
        x="0" 
        y="92" 
        fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
        fontSize="46" 
        fontWeight="700"
        letterSpacing="1"
      >
        GROUP
      </text>
    </g>
  </svg>
);