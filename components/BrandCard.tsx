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

  // Check if name is DHL or DHL GLOBAL
  const isDhl = lowerCaseName.includes('dhl');

  if (isDhl) {
    backgroundClass = 'bg-[#FFCC00]';
    // Text styles are not needed for image, but kept for border logic consistency
    hoverBorderClass = 'hover:border-[#D40511]';
  } else if (lowerCaseName === 'pricesmart') {
    backgroundClass = 'bg-[#0d1a2e]';
    textClass = 'text-white';
    hoverBorderClass = 'hover:border-gray-400';
    fontStyling = 'font-bold text-5xl tracking-wide';
  }

  return (
    <div
      onClick={onClick}
      className={`${backgroundClass} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${hoverBorderClass} ${className ?? 'border-2 border-transparent'}`}
      style={{ minHeight: '200px' }}
    >
      {isDhl ? (
        <img 
          src="https://www.dhl.com/content/dam/dhl/global/core/images/logos/dhl-logo.svg" 
          alt="DHL Logo" 
          className="w-48 md:w-64 h-auto object-contain"
        />
      ) : (
        <span className={`${textClass} ${fontStyling}`}>
          {name}
        </span>
      )}
    </div>
  );
};

export default BrandCard;