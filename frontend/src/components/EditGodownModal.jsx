import React, { useState, useEffect } from 'react';

export default function EditGodownModal({ isOpen, onClose, onSubmit, godown }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (godown) {
      setName(godown.name || '');
      setLocation(godown.location || '');
    }
  }, [godown, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, location });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-on-surface/10 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface border-2 border-[#000000] relative flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-variant">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Edit Godown Profile</h2>
          <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-label-bold text-on-surface">Godown Name</label>
            <input required type="text" placeholder="e.g. Main Godown" value={name} onChange={e => setName(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-label-bold text-on-surface">Location</label>
            <input required type="text" placeholder="e.g. Industrial Area Phase 1" value={location} onChange={e => setLocation(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded-none" />
          </div>
          
          <div className="mt-2 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] border-2 border-[#000000] font-label-bold text-[#000000] hover:bg-surface-variant transition-colors rounded-none">
              Cancel
            </button>
            <button type="submit" className="flex-1 h-[48px] bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity border-2 border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none rounded-none">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
