import React, { useState } from 'react';
import { createGodown } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function QuickGodownRegisterForm({ onGodownRegistered, onCancel }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const toast = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      toast.error('Godown Name and Location are required.');
      return;
    }
    setIsRegistering(true);
    try {
      const newGodown = await createGodown({
        name: name.trim(),
        location: location.trim()
      });
      toast.success('Godown registered successfully!');
      if (onGodownRegistered) {
        onGodownRegistered(newGodown);
      }
      // Reset form
      setName('');
      setLocation('');
    } catch (err) {
      toast.error(err.message || 'Failed to register godown');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="border border-outline p-4 bg-surface-container-low flex flex-col gap-3 rounded">
      <div className="font-label-bold text-xs text-primary uppercase tracking-wider">Quick Register Godown</div>
      <div className="flex flex-col gap-2">
        <input 
          type="text" 
          placeholder="Godown Name *" 
          value={name} 
          onChange={e => setName(e.target.value)}
          required
          className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none w-full rounded" 
        />
        <input 
          type="text" 
          placeholder="Location *" 
          value={location} 
          onChange={e => setLocation(e.target.value)}
          required
          className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none w-full rounded" 
        />
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
          disabled={isRegistering || !name.trim() || !location.trim()}
          className="flex-1 h-[36px] bg-primary text-on-primary font-label-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center gap-2 rounded"
        >
          {isRegistering && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
          Register Godown
        </button>
      </div>
    </form>
  );
}
