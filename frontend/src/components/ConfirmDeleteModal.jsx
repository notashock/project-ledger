import React, { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message = "Are you sure? This action is permanent and will recalculate all balances." 
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

  return (
    <FocusTrap active={isOpen} focusTrapOptions={{ clickOutsideDeactivates: true }}>
      <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center p-4 z-[200] backdrop-blur-sm">
        <div className="bg-surface w-full max-w-md border-2 border-[#000000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded">
          
          {/* Header */}
          <div className="p-6 border-b-2 border-[#000000] bg-[#F8D7DA] text-[#842029]">
            <h3 className="text-headline-md font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              {title}
            </h3>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 bg-surface">
            <p className="font-body-md text-on-surface-variant font-medium">
              {message}
            </p>
            <div className="p-3 bg-[#FFF3CD] border border-[#664D03] text-[#664D03] font-label-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Warning: This cannot be undone!</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t-2 border-[#000000] flex gap-4 justify-end bg-surface-container-lowest">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 h-[48px] border-2 border-[#000000] text-on-surface hover:bg-surface-variant font-label-bold transition-colors cursor-pointer rounded"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={onConfirm}
              className="px-6 h-[48px] bg-[#DC3545] text-white border-2 border-[#000000] hover:bg-[#B52A37] font-label-bold transition-colors cursor-pointer rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
