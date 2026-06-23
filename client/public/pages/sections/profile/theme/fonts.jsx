import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import React from 'react';
import useFont from './font';
import useFontIndex from './setFont';

const Fonts = () => {
  const fonts = useFont((state) => state.fonts);
  const fontIndex = useFontIndex((state) => state.index);
  const setFontIndex = useFontIndex((state) => state.setIndex);

  return (
    <div className="p-4 space-y-6 overflow-y-auto max-h-screen scrollbar-hide">
      <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white px-2">Font Style</h1> 
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
        {fonts.map((font, i) => {
          const isSelected = i === fontIndex;
          return (
            <button 
              key={i}
              onClick={() => setFontIndex(i)}
              className={`
                group relative flex flex-col items-start gap-4 p-6 rounded-3xl transition-all duration-300
                bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
                ${isSelected 
                  ? 'ring-2 ring-[var(--active-color)] shadow-lg scale-[1.02]' 
                  : 'hover:border-[var(--active-color)]/50 hover:shadow-md'}
              `}
            >
              <div className="absolute top-4 right-4 text-xl">
                {isSelected ? (
                  <MdRadioButtonChecked className="text-[var(--active-color)]" />
                ) : (
                  <MdRadioButtonUnchecked className="text-slate-300 dark:text-slate-600 group-hover:text-[var(--active-color)]/50" />
                )}
              </div>

              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sample Text</span>
              <span 
                className="text-2xl text-slate-900 dark:text-white truncate w-full" 
                style={{ fontFamily: font.name }}
              >
                {font.name}
              </span>

              {isSelected && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--active-color)] rounded-full animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Fonts;
