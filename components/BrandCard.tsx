import React from 'react';

interface BrandCardProps {
  name: string;
  onClick: () => void;
  className?: string;
}

const BrandCard: React.FC<BrandCardProps> = ({ name, onClick, className }) => {
  const lowerCaseName = name.toLowerCase();
  
  let backgroundClass = 'bg-white';
  let textClass = 'text-gray-800';
  let hoverBorderClass = 'hover:border-[#0d1a2e]';
  let fontStyling = 'font-bold text-2xl tracking-wide';

  if (lowerCaseName === 'dhl') {
    backgroundClass = 'bg-[#FFCC00]';
    textClass = 'text-[#D40511]';
    hoverBorderClass = 'hover:border-[#D40511]';
    // Match the style from ClubLocations for a consistent, bold look
    fontStyling = 'text-5xl font-black italic tracking-tighter';
  } else if (lowerCaseName === 'pricesmart') {
    backgroundClass = 'bg-[#0d1a2e]';
    textClass = 'text-white';
    hoverBorderClass = 'hover:border-white';
    fontStyling = 'font-bold text-5xl tracking-wide';
  }

  return (
    <div
      onClick={onClick}
      className={`${backgroundClass} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${hoverBorderClass} ${className ?? 'border-2 border-transparent'}`}
      style={{ minHeight: '200px' }}
    >
      <span className={`${textClass} ${fontStyling}`}>
        {name}
      </span>
    </div>
  );
};

export default BrandCard;