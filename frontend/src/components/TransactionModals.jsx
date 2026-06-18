import React, { useState } from 'react';

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
      <div className="bg-surface w-full max-w-md border-2 border-[#000000] shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b-2 border-[#000000] bg-surface-variant">
          <h3 className="text-headline-md font-bold text-on-surface">Add Crop Purchase</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Crop Type</label>
            <div className="relative">
              <select className="appearance-none w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded-none" value={cropType} onChange={e => setCropType(e.target.value)}>
                <option value="Rice">Rice</option>
                <option value="Corn">Corn (Maize)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-bold text-on-surface-variant mb-1">Weight (kg)</label>
              <input type="number" required className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div>
              <label className="block font-label-bold text-on-surface-variant mb-1">Rate (₹/kg)</label>
              <input type="number" required className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right" value={rate} onChange={e => setRate(e.target.value)} />
            </div>
          </div>
          <div className="border border-outline-variant p-4 flex justify-between items-center bg-surface-bright">
            <span className="font-label-bold text-secondary uppercase tracking-widest">Total Value</span>
            <span className="font-number-xl text-[24px] text-[#000000]">₹{totalValue}</span>
          </div>
          <button type="submit" className="w-full h-[48px] bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity mt-6">
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
      <div className="bg-surface w-full max-w-md border-2 border-[#000000] shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b-2 border-[#000000] bg-surface-variant">
          <h3 className="text-headline-md font-bold text-on-surface">Record Advance/Material</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Category</label>
            <div className="relative">
              <select className="appearance-none w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded-none" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="CASH">Cash Advance</option>
                <option value="SEEDS">Seeds</option>
                <option value="PESTICIDES">Pesticides</option>
                <option value="OTHER">Other Materials</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
            </div>
          </div>
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Cost Amount (₹)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant">₹</span>
              <input type="number" required className="w-full h-[48px] pl-8 pr-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right" value={costAmount} onChange={e => setCostAmount(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Description (Optional)</label>
            <input type="text" className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" placeholder="E.g., 2 bags of urea" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button type="submit" className="w-full h-[48px] bg-error text-on-error font-label-bold hover:opacity-90 transition-opacity mt-6 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">remove</span>
            Record Debit
          </button>
        </form>
      </div>
    </div>
  );
}
