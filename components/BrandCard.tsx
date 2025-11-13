import React from 'react';

interface BrandCardProps {
  name: string;
  onClick: () => void;
}

const BrandCard: React.FC<BrandCardProps> = ({ name, onClick }) => {
  const lowerCaseName = name.toLowerCase();
  
  let backgroundClass = 'bg-white';
  let textClass = 'text-gray-800';
  let hoverBorderClass = 'hover:border-[#0d1a2e]';
  let fontSizeClass = 'text-2xl';

  if (lowerCaseName === 'dhl') {
    backgroundClass = 'bg-[#FFCC00]';
    textClass = 'text-[#D40511]';
    hoverBorderClass = 'hover:border-[#D40511]';
    fontSizeClass = 'text-3xl';
  } else if (lowerCaseName === 'pricesmart') {
    backgroundClass = 'bg-[#0d1a2e]';
    textClass = 'text-white';
    hoverBorderClass = 'hover:border-white';
    fontSizeClass = 'text-3xl';
  }

  return (
    <div
      onClick={onClick}
      className={`${backgroundClass} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center border-2 border-transparent ${hoverBorderClass}`}
      style={{ minHeight: '200px' }}
    >
      <span className={`${textClass} font-bold ${fontSizeClass} tracking-wide`}>
        {name}
      </span>
    </div>
  );
};

export default BrandCard;