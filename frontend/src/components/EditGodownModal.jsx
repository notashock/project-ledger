import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';

export default function EditGodownModal({ isOpen, onClose, onSubmit, godown }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (godown) {
      setName(godown.name || '');
      setLocation(godown.location || '');
    }
  }, [godown, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, location });
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Edit Godown Profile" size="md" zIndex="z-[200]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-label-bold text-on-surface">Godown Name</label>
          <input required type="text" placeholder="e.g. Main Godown" value={name} onChange={e => setName(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-label-bold text-on-surface">Location</label>
          <input required type="text" placeholder="e.g. Industrial Area Phase 1" value={location} onChange={e => setLocation(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded" />
        </div>
        
        <div className="mt-2 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 h-[48px] border-2 border-[#000000] font-label-bold text-[#000000] hover:bg-surface-variant bg-surface transition-colors rounded">
            Cancel
          </button>
          <button type="submit" className="flex-1 h-[48px] bg-primary text-on-primary font-label-bold hover:opacity-90 border-2 border-[#000000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded">
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
