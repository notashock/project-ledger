import React, { useState, useEffect } from 'react';

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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, village, phone });
  };

  return (
    <div className="fixed inset-0 bg-on-surface/10 flex items-center justify-center p-4 z-[200] backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md border-2 border-[#000000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-none">
        <div className="flex justify-between items-center p-6 border-b-2 border-[#000000] bg-surface-variant">
          <h3 className="text-headline-md font-bold text-on-surface">Edit Farmer Profile</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Full Name</label>
            <input 
              required 
              type="text" 
              className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded-none" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Village / Region</label>
            <input 
              required 
              type="text" 
              className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded-none" 
              value={village} 
              onChange={e => setVillage(e.target.value)} 
            />
          </div>
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Phone Number</label>
            <input 
              required 
              type="text" 
              className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded-none" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>
          
          <div className="flex gap-4 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 h-[48px] border-2 border-[#000000] font-label-bold hover:bg-surface-variant transition-colors rounded-none"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 h-[48px] bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity rounded-none border-2 border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
