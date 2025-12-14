import React from 'react';
import { CardItem } from '../types';

interface CardProps {
  item: CardItem;
  onClick: () => void;
  selected: boolean;
  disabled: boolean;
}

const Card: React.FC<CardProps> = ({ item, onClick, selected, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || selected}
      className={`
        relative aspect-[3/4] w-full
        flex items-center justify-center p-2
        rounded-lg border-2 
        transition-all duration-300 transform
        ${selected 
          ? 'opacity-0 scale-90 cursor-default' 
          : 'opacity-100 scale-100 hover:-translate-y-1 hover:shadow-xl cursor-pointer active:scale-95'
        }
        ${disabled ? 'cursor-not-allowed' : ''}
        bg-paper text-ink border-wood
        card-shadow
      `}
    >
      <div className="absolute inset-1 border border-paper-dark opacity-50 rounded pointer-events-none"></div>
      <span className="text-lg md:text-xl font-bold text-center writing-mode-vertical-rl md:writing-mode-horizontal-tb select-none leading-tight">
        {item.text}
      </span>
    </button>
  );
};

export default Card;
