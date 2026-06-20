import React, { useState, useEffect, useRef } from 'react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select option', 
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[48px] px-4 bg-surface border-2 border-[#000000] text-on-surface font-semibold flex items-center justify-between transition-colors hover:bg-surface-container-high rounded cursor-pointer focus:outline-none"
        type="button"
      >
        <span>{displayText}</span>
        <span className="material-symbols-outlined transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          arrow_drop_down
        </span>
      </button>
      
      {isOpen && (
        <div className="relative mt-1 w-full bg-surface border-2 border-[#000000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col max-h-60 overflow-y-auto rounded divide-y divide-[#000000]">
          {options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-label-bold font-semibold hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer ${String(opt.value) === String(value) ? 'bg-surface-container-high' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
