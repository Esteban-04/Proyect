import React from 'react';

interface ClubButtonProps {
  name: string;
  isSelected: boolean;
  onClick: (name: string) => void;
  isDhl?: boolean;
}

const ClubButton: React.FC<ClubButtonProps> = ({ name, isSelected, onClick, isDhl = false }) => {
  const baseClasses = "w-full text-left p-4 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Dynamic classes based on brand
  const focusRingClass = isDhl ? "focus:ring-[#D40511]" : "focus:ring-[#0d1a2e]";
  
  let stateClasses = "";

  if (isSelected) {
    // Selected State
    if (isDhl) {
      stateClasses = "bg-[#D40511] text-white border-[#D40511] font-semibold shadow-md";
    } else {
      stateClasses = "bg-[#0d1a2e] text-white border-[#0d1a2e] font-semibold shadow-md";
    }
  } else {
    // Unselected State
    stateClasses = "bg-white text-gray-800 border-gray-300 hover:bg-gray-50";
    if (isDhl) {
       stateClasses += " hover:border-[#D40511] text-gray-800";
    } else {
       stateClasses += " hover:border-gray-400";
    }
  }

  return (
    <button
      onClick={() => onClick(name)}
      className={`${baseClasses} ${focusRingClass} ${stateClasses}`}
    >
      {name}
    </button>
  );
};

export default ClubButton;