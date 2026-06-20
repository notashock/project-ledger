import React, { useState } from 'react';
import CustomSelect from './CustomSelect';

export function PurchaseModal({ isOpen, onClose, onSubmit }) {
  const [cropType, setCropType] = useState('Rice');
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');

  if (!isOpen) return null;

  const totalValue = (parseFloat(weight || 0) * parseFloat(rate || 0)).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      cropType,
      weight: parseFloat(weight),
      rateApplied: parseFloat(rate),
      totalValue: parseFloat(totalValue)
    });
    setWeight('');
    setRate('');
  };

  return (
    <div className="fixed inset-0 bg-on-surface/10 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md border-2 border-[#000000] shadow-none overflow-hidden rounded">
        <div className="flex justify-between items-center p-6 border-b-2 border-[#000000] bg-surface-variant">
          <h3 className="text-headline-md font-bold text-on-surface">Add Crop Purchase</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors rounded border-2 border-[#000000] bg-surface">
            <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Crop Type</label>
            <CustomSelect 
              value={cropType} 
              onChange={val => setCropType(val)}
              options={[
                { value: 'Rice', label: 'Rice' },
                { value: 'Corn', label: 'Corn (Maize)' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-bold text-on-surface-variant mb-1">Weight (kg)</label>
              <input type="number" required className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right rounded" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div>
              <label className="block font-label-bold text-on-surface-variant mb-1">Rate (₹/kg)</label>
              <input type="number" required className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right rounded" value={rate} onChange={e => setRate(e.target.value)} />
            </div>
          </div>
          <div className="border border-outline-variant p-4 flex justify-between items-center bg-surface-bright rounded">
            <span className="font-label-bold text-secondary uppercase tracking-widest">Total Value</span>
            <span className="font-number-xl text-[24px] text-[#000000]">₹{totalValue}</span>
          </div>
          <button type="submit" className="w-full h-[48px] bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity mt-6 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            Confirm Purchase
          </button>
        </form>
      </div>
    </div>
  );
}

export function DebitModal({ isOpen, onClose, onSubmit }) {
  const [category, setCategory] = useState('CASH');
  const [costAmount, setCostAmount] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      category,
      costAmount: parseFloat(costAmount),
      description
    });
    setCostAmount('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-on-surface/10 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md border-2 border-[#000000] shadow-none overflow-hidden rounded">
        <div className="flex justify-between items-center p-6 border-b-2 border-[#000000] bg-surface-variant">
          <h3 className="text-headline-md font-bold text-on-surface">Record Advance/Material</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors rounded border-2 border-[#000000] bg-surface">
            <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Category</label>
            <CustomSelect 
              value={category} 
              onChange={val => setCategory(val)}
              options={[
                { value: 'CASH', label: 'Cash Advance' },
                { value: 'SEEDS', label: 'Seeds' },
                { value: 'PESTICIDES', label: 'Pesticides' },
                { value: 'OTHER', label: 'Other Materials' }
              ]}
            />
          </div>
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Cost Amount (₹)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant text-sm font-semibold">₹</span>
              <input type="number" required className="w-full h-[48px] pl-8 pr-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right rounded" value={costAmount} onChange={e => setCostAmount(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Description (Optional)</label>
            <input type="text" className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded" placeholder="E.g., 2 bags of urea" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="w-full h-[48px] bg-error text-on-error font-label-bold hover:opacity-90 transition-opacity mt-6 flex items-center justify-center gap-2 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <span className="material-symbols-outlined">remove</span>
            Record Debit
          </button>
        </form>
      </div>
    </div>
  );
}
