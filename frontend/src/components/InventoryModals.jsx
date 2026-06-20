import React, { useState, useEffect } from 'react';
import { getAllGodowns } from '../services/api';
import { useToast } from '../context/ToastContext';
import ModalShell from './ModalShell';
import QuickGodownRegisterForm from './QuickGodownRegisterForm';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

export function BulkPurchaseModal({ isOpen, onClose, onSubmit, bulkPurchase = null }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [cropType, setCropType] = useState('RICE');
  const [weight, setWeight] = useState('');
  const [ratePerQuintal, setRatePerQuintal] = useState('');
  const [bagWeight, setBagWeight] = useState('101');
  const [godowns, setGodowns] = useState([]);
  const [godownId, setGodownId] = useState('');

  // Quick godown registration toggle
  const [showQuickRegisterGodown, setShowQuickRegisterGodown] = useState(false);

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
      setShowQuickRegisterGodown(false);
    }
  }, [isOpen, bulkPurchase]);

  const handleGodownRegistered = async (newGodown) => {
    const updatedGodowns = await getAllGodowns();
    setGodowns(updatedGodowns);
    setGodownId(newGodown.id);
    setShowQuickRegisterGodown(false);
  };

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
    <ModalShell 
      isOpen={isOpen} 
      onClose={onClose} 
      title={bulkPurchase ? 'Edit Bulk Purchase' : 'Record Bulk Purchase'} 
      size="xl" 
      zIndex="z-[100]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-on-surface">Date</label>
            <CustomDatePicker value={date} onChange={setDate} />
          </div>

          {/* Crop Type */}
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-on-surface">Crop Type</label>
            <CustomSelect 
              value={cropType} 
              onChange={val => setCropType(val)}
              options={[
                { value: 'RICE', label: 'Rice (Basmati 1121)' },
                { value: 'MAIZE', label: 'Maize (Corn)' }
              ]}
            />
          </div>

          {/* Supplier Name */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-label-bold text-on-surface">Supplier Name</label>
            <input required type="text" placeholder="Enter supplier name" value={supplierName} onChange={e => setSupplierName(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded" />
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-on-surface">Total Weight (Kg)</label>
            <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={weight} onChange={e => setWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right rounded" />
          </div>

          {/* Rate per Quintal */}
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-on-surface">Rate per Quintal (₹)</label>
            <input required type="number" step="0.01" min="0.00" placeholder="0.00" value={ratePerQuintal} onChange={e => setRatePerQuintal(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right rounded" />
          </div>

          {/* Bag Weight */}
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-on-surface">Bag Weight (Kg)</label>
            <input required type="number" step="0.01" min="0.01" value={bagWeight} onChange={e => setBagWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right rounded" />
          </div>

          {/* No of Bags */}
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-on-surface">Est. No. of Bags</label>
            <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant rounded">
              {noOfBags}
            </div>
          </div>

          {/* Est Total Amount */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-label-bold text-on-surface">Est. Total Amount spent (₹)</label>
            <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant font-bold rounded">
              ₹{parseFloat(estTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Unload Godown */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex justify-between items-center">
              <label className="font-label-bold text-on-surface">Unload Godown</label>
              <button 
                type="button" 
                onClick={() => setShowQuickRegisterGodown(!showQuickRegisterGodown)} 
                className="text-primary text-xs font-label-bold hover:underline"
              >
                {showQuickRegisterGodown ? 'Select Existing' : '+ Register New'}
              </button>
            </div>
            {showQuickRegisterGodown ? (
              <QuickGodownRegisterForm 
                onGodownRegistered={handleGodownRegistered}
                onCancel={() => setShowQuickRegisterGodown(false)}
              />
            ) : (
              godowns.length === 0 ? (
                <div className="h-[48px] bg-error-container text-on-error-container flex items-center px-4 font-label-bold text-[14px] rounded border border-error">
                  Add a godown first.
                </div>
              ) : (
                <CustomSelect 
                  value={godownId} 
                  onChange={val => setGodownId(val)}
                  options={godowns.map(g => ({ value: g.id, label: `${g.name} (${g.location})` }))}
                />
              )
            )}
          </div>
        </div>
        
        <div className="flex gap-4 justify-end pt-4 border-t border-outline/30">
          <button type="button" onClick={onClose} className="h-[48px] px-6 border-2 border-on-surface bg-surface text-on-surface font-label-bold hover:bg-surface-variant transition-colors rounded">
            Cancel
          </button>
          <button type="submit" disabled={godowns.length === 0} className="h-[48px] px-6 bg-primary text-on-primary border-2 border-on-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-label-bold transition-all hover:opacity-90 disabled:opacity-50 rounded">
            {bulkPurchase ? 'Save Changes' : 'Record Bulk Purchase'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function GodownModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, location });
    setName('');
    setLocation('');
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Add Godown" size="md" zIndex="z-[100]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-on-surface">Godown Name</label>
          <input required type="text" placeholder="e.g. Main Godown" value={name} onChange={e => setName(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-on-surface">Location</label>
          <input required type="text" placeholder="e.g. Industrial Area Phase 1" value={location} onChange={e => setLocation(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded" />
        </div>
        
        <div className="flex gap-4 justify-end pt-4 border-t border-outline/30">
          <button type="button" onClick={onClose} className="h-[48px] px-6 border-2 border-on-surface bg-surface text-on-surface font-label-bold hover:bg-surface-variant transition-colors rounded">
            Cancel
          </button>
          <button type="submit" className="h-[48px] px-6 bg-primary text-on-primary border-2 border-on-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-label-bold hover:opacity-90 transition-all rounded">
            Add Godown
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
