import React from 'react';
import { Country } from '../types';

interface CountryCardProps {
  country: Country;
  isSelected: boolean;
  onSelect: (country: Country) => void;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, isSelected, onSelect }) => {
  // Conditionally apply a dark blue border if the card is selected.
  const borderClass = isSelected 
    ? 'border-2 border-blue-800' 
    : 'border border-gray-200';

  return (
    <div
      onClick={() => onSelect(country)}
      className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center ${borderClass}`}
    >
      <img
        src={`https://flagcdn.com/w40/${country.code}.png`}
        alt={`${country.name} flag`}
        className="w-8 h-auto mr-4 rounded-sm shadow-md"
      />
      <span className="text-gray-800 font-medium text-base">
        {country.name} ({country.count})
      </span>
    </div>
  );
};

export default CountryCard;