import React, { useState } from 'react';
import { createFarmer } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function QuickFarmerRegisterForm({ onFarmerRegistered, onCancel }) {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const toast = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !village.trim()) {
      toast.error('Name and Village are required.');
      return;
    }
    setIsRegistering(true);
    try {
      const newFarmer = await createFarmer({
        name: name.trim(),
        village: village.trim(),
        phone: phone.trim()
      });
      toast.success('Farmer registered successfully!');
      if (onFarmerRegistered) {
        onFarmerRegistered(newFarmer);
      }
      // Reset form
      setName('');
      setVillage('');
      setPhone('');
    } catch (err) {
      toast.error(err.message || 'Failed to register farmer');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="border border-outline p-4 bg-surface-container-low flex flex-col gap-3 rounded">
      <div className="font-label-bold text-xs text-primary uppercase tracking-wider">Quick Register Farmer</div>
      <div className="flex flex-col gap-2">
        <input 
          type="text" 
          placeholder="Full Name *" 
          value={name} 
          onChange={e => setName(e.target.value)}
          required
          className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none w-full rounded" 
        />
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="text" 
            placeholder="Village *" 
            value={village} 
            onChange={e => setVillage(e.target.value)}
            required
            className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none w-full rounded" 
          />
          <input 
            type="text" 
            placeholder="Phone" 
            value={phone} 
            onChange={e => setPhone(e.target.value)}
            className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none w-full rounded" 
          />
        </div>
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-[36px] border border-outline bg-surface font-label-bold text-xs hover:bg-surface-variant transition-colors rounded"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={isRegistering || !name.trim() || !village.trim()}
          className="flex-1 h-[36px] bg-primary text-on-primary font-label-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center gap-2 rounded"
        >
          {isRegistering && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
          Register Farmer
        </button>
      </div>
    </form>
  );
}
