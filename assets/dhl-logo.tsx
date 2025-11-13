import React from 'react';

export const DhlLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="200" height="60" fill="#FFCC00"/>
    <text 
      x="100" 
      y="42" 
      fontFamily="'Delivery', sans-serif" 
      fontSize="50" 
      fontWeight="bold" 
      fill="#D40511" 
      textAnchor="middle"
      fontStyle="italic"
      letterSpacing="-2"
    >
      DHL
    </text>
  </svg>
);