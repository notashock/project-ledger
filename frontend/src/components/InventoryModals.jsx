import React, { useState, useEffect } from 'react';
import { getAllGodowns } from '../services/api';
import { useToast } from '../context/ToastContext';

export function BulkPurchaseModal({ isOpen, onClose, onSubmit, bulkPurchase = null }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [cropType, setCropType] = useState('RICE');
  const [weight, setWeight] = useState('');
  const [ratePerQuintal, setRatePerQuintal] = useState('');
  const [bagWeight, setBagWeight] = useState('101');
  const [godowns, setGodowns] = useState([]);
  const [godownId, setGodownId] = useState('');

  const noOfBags = weight && bagWeight ? (parseFloat(weight) / parseFloat(bagWeight)).toFixed(2) : '0.00';
  const estTotalAmount = weight && ratePerQuintal ? ((parseFloat(weight) / 100) * parseFloat(ratePerQuintal)).toFixed(2) : '0.00';

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      getAllGodowns().then(data => {
        setGodowns(data);
        if (!bulkPurchase && data.length > 0) {
          setGodownId(data[0].id);
        }
      }).catch(err => {
        console.error(err);
        toast.error('Failed to load godowns');
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (bulkPurchase) {
        setDate(bulkPurchase.date || new Date().toISOString().split('T')[0]);
        setSupplierName(bulkPurchase.supplierName || '');
        setCropType(bulkPurchase.cropType?.toUpperCase() || 'RICE');
        setWeight(bulkPurchase.weight?.toString() || '');
        setRatePerQuintal(bulkPurchase.ratePerQuintal?.toString() || '');
        setBagWeight(bulkPurchase.bagWeight?.toString() || '101');
        if (bulkPurchase.godownId) {
          setGodownId(bulkPurchase.godownId);
        } else if (bulkPurchase.godown?.id) {
          setGodownId(bulkPurchase.godown.id);
        }
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setSupplierName('');
        setCropType('RICE');
        setWeight('');
        setRatePerQuintal('');
        setBagWeight('101');
      }
    }
  }, [isOpen, bulkPurchase]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!godownId) return;

    onSubmit({
      id: bulkPurchase?.id,
      date,
      supplierName,
      cropType,
      weight: parseFloat(weight),
      ratePerQuintal: parseFloat(ratePerQuintal),
      bagWeight: parseFloat(bagWeight),
      noOfBags: parseFloat(noOfBags),
      godownId
    });
    setSupplierName('');
    setWeight('');
    setRatePerQuintal('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/10 backdrop-blur-sm p-4 md:p-container-margin overflow-y-auto">
      <div className="w-full max-w-xl bg-surface border-2 border-[#000000] relative flex flex-col shadow-none">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">{bulkPurchase ? 'Edit Bulk Purchase' : 'Record Bulk Purchase'}</h2>
          <button type="button" onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface">Date</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface">Crop Type</label>
              <div className="relative">
                <select required value={cropType} onChange={e => setCropType(e.target.value)} className="appearance-none w-full h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded-none">
                  <option value="RICE">Rice (Basmati 1121)</option>
                  <option value="MAIZE">Maize (Corn)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label-bold text-label-bold text-on-surface">Supplier Name</label>
              <input required type="text" placeholder="Enter supplier name" value={supplierName} onChange={e => setSupplierName(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface">Total Weight (Kg)</label>
              <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={weight} onChange={e => setWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface">Rate per Quintal (₹)</label>
              <input required type="number" step="0.01" min="0.00" placeholder="0.00" value={ratePerQuintal} onChange={e => setRatePerQuintal(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface">Bag Weight (Kg)</label>
              <input required type="number" step="0.01" min="0.01" value={bagWeight} onChange={e => setBagWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface">Est. No. of Bags</label>
              <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant">
                {noOfBags}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label-bold text-label-bold text-on-surface">Est. Total Amount spent (₹)</label>
              <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant">
                ₹{estTotalAmount}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label-bold text-label-bold text-on-surface">Unload Godown</label>
              {godowns.length === 0 ? (
                <div className="h-[48px] bg-error-container text-on-error-container flex items-center px-4 font-label-bold text-[14px]">
                  Add a godown first.
                </div>
              ) : (
                <div className="relative">
                  <select required value={godownId} onChange={e => setGodownId(e.target.value)} className="appearance-none w-full h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded-none">
                    {godowns.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] border-2 border-[#000000] font-label-bold text-[#000000] hover:bg-surface-variant transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={godowns.length === 0} className="flex-1 h-[48px] bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              {bulkPurchase ? 'Save Changes' : 'Record Bulk Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GodownModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, location });
    setName('');
    setLocation('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/10 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface border-2 border-[#000000] relative flex flex-col shadow-none">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Add Godown</h2>
          <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-label-bold text-on-surface">Godown Name</label>
            <input required type="text" placeholder="e.g. Main Godown" value={name} onChange={e => setName(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-label-bold text-on-surface">Location</label>
            <input required type="text" placeholder="e.g. Industrial Area Phase 1" value={location} onChange={e => setLocation(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all" />
          </div>
          
          <div className="mt-2 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] border-2 border-[#000000] font-label-bold text-[#000000] hover:bg-surface-variant transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 h-[48px] bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity">
              Add Godown
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
