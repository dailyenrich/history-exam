import React from 'react';
import { CardItem } from '../types';

interface DockProps {
  slots: (CardItem | null)[];
  onRemove: (index: number) => void;
  isVerifying: boolean;
}

const Dock: React.FC<DockProps> = ({ slots, onRemove, isVerifying }) => {
  return (
    <div className="w-full max-w-3xl bg-[#5d4037] p-4 rounded-xl shadow-2xl border-4 border-[#3e2723] relative mt-4">
        {/* Decorative elements */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#8d6e63]"></div>
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#8d6e63]"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#8d6e63]"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#8d6e63]"></div>

      <div className="flex justify-center gap-2 md:gap-4">
        {slots.map((item, index) => (
          <div
            key={index}
            className={`
              w-16 h-20 md:w-24 md:h-32 
              rounded-lg border-2 
              flex items-center justify-center
              transition-all duration-200 relative
              ${item 
                ? 'bg-paper border-wood card-shadow' 
                : 'bg-black/30 border-[#8d6e63]/50'
              }
            `}
          >
            {item ? (
              <button
                onClick={() => !isVerifying && onRemove(index)}
                disabled={isVerifying}
                className="w-full h-full flex items-center justify-center p-1 cursor-pointer hover:bg-paper-dark/20 rounded-lg animate-fadeIn group"
              >
                 <div className="absolute inset-1 border border-paper-dark opacity-50 rounded pointer-events-none group-hover:border-seal-red/30 transition-colors"></div>
                 {/* Visual hint for removal */}
                 <div className="absolute -top-2 -right-2 bg-seal-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10">
                    ✕
                 </div>
                <span className="text-sm md:text-lg font-bold text-ink writing-mode-vertical-rl md:writing-mode-horizontal-tb leading-tight select-none">
                  {item.text}
                </span>
              </button>
            ) : (
                <div className="text-[#8d6e63]/30 font-bold text-2xl select-none">+</div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-2 text-[#d7ccc8] text-sm font-serif">
        {isVerifying ? "正在验明正身..." : "点击上方卡片填入，点击此处卡片撤回"}
      </div>
    </div>
  );
};

export default Dock;