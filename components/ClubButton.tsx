import React from 'react';

interface ClubButtonProps {
  name: string;
  isSelected: boolean;
  onClick: (name: string) => void;
}

const ClubButton: React.FC<ClubButtonProps> = ({ name, isSelected, onClick }) => {
  const baseClasses = "w-full text-left p-4 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700";
  
  const selectedClasses = "bg-blue-800 text-white border-blue-800 font-semibold shadow-md";
  const unselectedClasses = "bg-white text-gray-800 border-gray-300 hover:bg-gray-50 hover:border-gray-400";

  return (
    <button
      onClick={() => onClick(name)}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
    >
      {name}
    </button>
  );
};

export default ClubButton;