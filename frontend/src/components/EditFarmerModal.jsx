import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';

export default function EditFarmerModal({ isOpen, onClose, onSubmit, farmer }) {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (farmer) {
      setName(farmer.name || '');
      setVillage(farmer.village || '');
      setPhone(farmer.phone || '');
    }
  }, [farmer, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, village, phone });
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Edit Farmer Profile" size="md" zIndex="z-[200]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-label-bold text-on-surface-variant mb-1">Full Name</label>
          <input 
            required 
            type="text" 
            className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
        </div>
        <div>
          <label className="block font-label-bold text-on-surface-variant mb-1">Village / Region</label>
          <input 
            required 
            type="text" 
            className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded" 
            value={village} 
            onChange={e => setVillage(e.target.value)} 
          />
        </div>
        <div>
          <label className="block font-label-bold text-on-surface-variant mb-1">Phone Number</label>
          <input 
            required 
            type="text" 
            className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
          />
        </div>
        
        <div className="flex gap-4 mt-6">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 h-[48px] border-2 border-[#000000] font-label-bold hover:bg-surface-variant bg-surface text-on-surface transition-colors rounded"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex-1 h-[48px] bg-primary text-on-primary font-label-bold hover:opacity-90 border-2 border-[#000000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded"
          >
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
