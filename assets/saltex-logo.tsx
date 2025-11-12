import React from 'react';

export const SaltexLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 480 100" // Wider viewBox for horizontal layout
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    preserveAspectRatio="xMidYMid meet"
  >
    <g fill="#004494">
      <text 
        x="50%" 
        y="50%" 
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
        fontSize="65" 
        fontWeight="700"
        letterSpacing="2"
      >
        SALTEX GROUP
      </text>
    </g>
  </svg>
);