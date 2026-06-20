import React, { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';

export default function ModalShell({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  zIndex = 'z-[150]' 
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <FocusTrap active={isOpen} focusTrapOptions={{ clickOutsideDeactivates: true }}>
      <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in`}>
        <div className={`bg-surface w-full ${sizeClasses[size] || 'max-w-md'} border-2 border-[#000000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden rounded`}>
          <div className="flex justify-between items-center p-6 border-b-2 border-[#000000] bg-surface-variant shrink-0">
            <h3 className="text-headline-md font-bold text-on-surface">{title}</h3>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors border-2 border-[#000000] bg-surface text-on-surface rounded"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined font-bold">close</span>
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[75vh]">
            {children}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
