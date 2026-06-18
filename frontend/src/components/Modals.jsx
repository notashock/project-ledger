import React, { useState, useEffect } from 'react';
import { getMarketRates, getAllGodowns } from '../services/api';

export function NewFarmerModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, village, phone });
    setName('');
    setVillage('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 bg-on-surface/10 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md border-2 border-[#000000] shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b-2 border-[#000000] bg-surface-variant">
          <h3 className="text-headline-md font-bold text-on-surface">Register Farmer</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 0" }}>close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Full Name</label>
            <input required type="text" className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Village / Region</label>
            <input required type="text" className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" value={village} onChange={e => setVillage(e.target.value)} />
          </div>
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-1">Phone Number</label>
            <input required type="text" className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <button type="submit" className="w-full h-[48px] bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity mt-6">
            Register Account
          </button>
        </form>
      </div>
    </div>
  );
}

export function PurchaseModal({ isOpen, onClose, onSubmit, farmerName = "Current Farmer" }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cropType, setCropType] = useState('rice');
  const [weight, setWeight] = useState('');
  const [bagWeight, setBagWeight] = useState('101');
  const [rate, setRate] = useState('2450.00');
  const [remarks, setRemarks] = useState('');
  const [showConfirmRate, setShowConfirmRate] = useState(false);
  const [currentMarketRates, setCurrentMarketRates] = useState({});
  const [applyMachineCost, setApplyMachineCost] = useState(false);
  const [machineRate, setMachineRate] = useState('110');
  const [machineCost, setMachineCost] = useState('0.00');
  const [godowns, setGodowns] = useState([]);
  const [godownId, setGodownId] = useState('');

  useEffect(() => {
    if (isOpen) {
      getMarketRates().then(rates => {
        setCurrentMarketRates(rates);
        if (rates && rates[cropType]) {
          setRate(rates[cropType].buyRate?.toString() || '2450.00');
          setBagWeight(rates[cropType].bagWeight?.toString() || '101');
        }
      }).catch(console.error);
      
      getAllGodowns().then(data => {
        setGodowns(data);
        if (data.length > 0) {
          setGodownId(data[0].id);
        }
      }).catch(console.error);
    }
  }, [isOpen, cropType]);

  let calculatedBags = parseFloat(weight || 0) / parseFloat(bagWeight || 101);
  const floorBags = Math.floor(calculatedBags);
  if (calculatedBags - floorBags > 0.90) {
    calculatedBags = Math.ceil(calculatedBags);
  }

  useEffect(() => {
    if (applyMachineCost) {
      const rateVal = parseFloat(machineRate || 0);
      const machineBags = Math.floor(calculatedBags);
      setMachineCost((machineBags * rateVal).toFixed(2));
    } else {
      setMachineCost('0.00');
    }
  }, [calculatedBags, machineRate, applyMachineCost]);

  if (!isOpen) return null;

  const grossValue = (calculatedBags * parseFloat(rate || 0)).toFixed(2);
  const totalValue = (parseFloat(grossValue) - (applyMachineCost ? parseFloat(machineCost || 0) : 0)).toFixed(2);

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(totalValue).replace('₹', '₹ ');

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentRate = currentMarketRates[cropType]?.buyRate;
    const enteredRate = parseFloat(rate);

    if (currentRate !== undefined && currentRate !== null && currentRate !== enteredRate) {
      setShowConfirmRate(true);
    } else {
      submitPurchase(true);
    }
  };

  const submitPurchase = (updateDailyRate) => {
    if (godowns.length === 0) {
      return; // Handled in UI
    }
    onSubmit({
      date,
      cropType,
      weight: parseFloat(weight),
      bagWeight: parseFloat(bagWeight),
      noOfBags: parseFloat(calculatedBags),
      rateApplied: parseFloat(rate),
      machineCost: applyMachineCost ? parseFloat(machineCost) : 0.0,
      totalValue: parseFloat(totalValue),
      remarks,
      godownId,
      updateDailyRate
    });
    setWeight('');
    setRemarks('');
    setApplyMachineCost(false);
    setShowConfirmRate(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-on-surface/10 z-[100] flex items-center justify-center p-gutter backdrop-blur-sm">
        <div className="bg-surface w-full max-w-lg border-2 border-[#000000] shadow-none flex flex-col max-h-[95vh]">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-gutter border-b border-outline-variant shrink-0">
            <h2 className="font-headline-md text-headline-md text-on-surface">Add Crop Purchase</h2>
            <button type="button" onClick={onClose} aria-label="Close modal" className="h-[48px] w-[48px] flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
            </button>
          </div>
          {/* Modal Body (Form) */}
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden min-h-0">
            <div className="p-gutter flex flex-col gap-gutter overflow-y-auto">
              {/* Farmer Context (Static) */}
              <div className="bg-surface-container-lowest border border-outline-variant p-base flex items-center gap-base">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>person</span>
                <div>
                  <div className="font-label-bold text-label-bold text-on-surface">{farmerName}</div>
                  <div className="font-body-md text-body-md text-secondary">Ledger Profile</div>
                </div>
              </div>
              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {/* Godown Selection */}
                <div className="flex flex-col gap-base col-span-1 md:col-span-2">
                  <label className="font-label-bold text-label-bold text-on-surface" htmlFor="godown-select">Unload Godown</label>
                  {godowns.length === 0 ? (
                    <div className="h-[48px] bg-error-container text-on-error-container flex items-center px-base font-label-bold text-label-bold rounded-sm border border-error">
                      <span className="material-symbols-outlined mr-2">error</span>
                      Please add a godown first.
                    </div>
                  ) : (
                    <div className="relative">
                      <select required className="appearance-none w-full h-[48px] bg-surface border border-outline text-on-surface px-base pr-10 font-body-md text-body-md focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded-none" id="godown-select" value={godownId} onChange={e => setGodownId(e.target.value)}>
                        {godowns.map(g => (
                          <option key={g.id} value={g.id}>{g.name} ({g.location})</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
                    </div>
                  )}
                </div>
                {/* Date Input */}
                <div className="flex flex-col gap-base">
                  <label className="font-label-bold text-label-bold text-on-surface" htmlFor="purchase-date">Date</label>
                  <input required className="h-[48px] bg-surface border border-outline text-on-surface px-base font-body-md text-body-md focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" id="purchase-date" type="date" value={date} onChange={e => setDate(e.target.value)}/>
                </div>
                {/* Crop Type Dropdown */}
                <div className="flex flex-col gap-base">
                  <label className="font-label-bold text-label-bold text-on-surface" htmlFor="crop-type">Crop Type</label>
                  <div className="relative">
                    <select required className="appearance-none w-full h-[48px] bg-surface border border-outline text-on-surface px-base pr-10 font-body-md text-body-md focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded-none" id="crop-type" value={cropType} onChange={e => setCropType(e.target.value)}>
                      <option value="rice">Rice (Basmati 1121)</option>
                      <option value="maize">Maize (Corn)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
                  </div>
                </div>
                {/* Total Weight Input */}
                <div className="flex flex-col gap-base">
                  <label className="font-label-bold text-label-bold text-on-surface" htmlFor="weight">Total Weight (Kg)</label>
                  <input required className="h-[48px] bg-surface border border-outline text-on-surface px-base font-body-md text-body-md focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right" id="weight" placeholder="0.00" type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)}/>
                </div>
                {/* Single Bag Weight Input */}
                <div className="flex flex-col gap-base">
                  <label className="font-label-bold text-label-bold text-on-surface" htmlFor="bag-weight">Bag Weight (Kg)</label>
                  <input required className="h-[48px] bg-surface border border-outline text-on-surface px-base font-body-md text-body-md focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right" id="bag-weight" placeholder="101.00" type="number" step="0.01" value={bagWeight} onChange={e => setBagWeight(e.target.value)}/>
                </div>
                {/* Rate Input */}
                <div className="flex flex-col gap-base">
                  <label className="font-label-bold text-label-bold text-on-surface" htmlFor="rate">Rate / Bag (₹)</label>
                  <input required className="h-[48px] bg-surface border border-outline text-on-surface px-base font-body-md text-body-md focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right" id="rate" type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)}/>
                  <span className="font-body-md text-sm text-secondary">
                    Market Rate: ₹{currentMarketRates[cropType] !== undefined && currentMarketRates[cropType] !== null ? currentMarketRates[cropType].buyRate : '2450'}
                  </span>
                </div>
                {/* Bags Display */}
                <div className="flex flex-col gap-base bg-surface-container-lowest p-3 border border-outline-variant rounded-sm text-center justify-center">
                  <span className="font-label-bold text-label-bold text-secondary">Calculated Bags</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface mt-1">
                    {calculatedBags.toFixed(2)} Bags
                  </span>
                </div>
              </div>
              
              {/* Remarks Input */}
              <div className="flex flex-col gap-base mt-2">
                <label className="font-label-bold text-label-bold text-on-surface font-body-sm text-sm" htmlFor="purchase-remarks">Remarks (Optional)</label>
                <input className="h-[48px] bg-surface border border-outline text-on-surface px-base font-body-md text-body-md focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" id="purchase-remarks" placeholder="e.g. Quality grade, transport details" type="text" value={remarks} onChange={e => setRemarks(e.target.value)}/>
              </div>

              {/* Machine Cost Toggle */}
              <div className="flex items-center gap-base mt-2 p-3 bg-surface-container-lowest border border-outline-variant rounded-sm">
                <input 
                  type="checkbox" 
                  id="apply-machine-cost" 
                  checked={applyMachineCost} 
                  onChange={e => setApplyMachineCost(e.target.checked)}
                  className="w-4 h-4 text-primary border-outline rounded focus:ring-primary focus:ring-1 cursor-pointer"
                />
                <label htmlFor="apply-machine-cost" className="font-label-bold text-label-bold text-on-surface cursor-pointer select-none">
                  Apply Machine Cost / Deduction
                </label>
              </div>

              {/* Machine Cost Options */}
              {applyMachineCost && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mt-2 p-3 bg-surface-container-low border border-outline-variant rounded-sm">
                  {/* Machine Cost Rate */}
                  <div className="flex flex-col gap-base">
                    <label className="font-label-bold text-sm text-on-surface" htmlFor="machine-rate">Machine Rate / Bag (₹)</label>
                    <input 
                      className="h-[40px] bg-surface border border-outline text-on-surface px-base font-body-sm text-sm focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right" 
                      id="machine-rate" 
                      type="number" 
                      step="0.01" 
                      value={machineRate} 
                      onChange={e => setMachineRate(e.target.value)}
                    />
                  </div>
                  {/* Machine Cost Amount */}
                  <div className="flex flex-col gap-base">
                    <label className="font-label-bold text-sm text-on-surface" htmlFor="machine-cost">Total Machine Cost (₹)</label>
                    <input 
                      className="h-[40px] bg-surface border border-outline text-on-surface px-base font-body-sm text-sm focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all text-right" 
                      id="machine-cost" 
                      type="number" 
                      step="0.01" 
                      value={machineCost} 
                      onChange={e => setMachineCost(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Value Summary Display */}
              <div className="mt-base border border-outline-variant p-gutter flex flex-col gap-base bg-surface-bright">
                {applyMachineCost && (
                  <>
                    <div className="flex justify-between items-center font-body-md text-secondary">
                      <span>Gross Value:</span>
                      <span className="font-bold">₹ {parseFloat(grossValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center font-body-md text-error">
                      <span>Machine Cost Deduction:</span>
                      <span className="font-bold">- ₹ {parseFloat(machineCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <hr className="border-outline-variant" />
                  </>
                )}
                <div className="flex flex-col items-center justify-center">
                  <span className="font-label-bold text-label-bold text-secondary uppercase tracking-widest">
                    {applyMachineCost ? 'Net Value' : 'Total Value'}
                  </span>
                  <div className="font-number-xl text-number-xl text-[#000000] mt-2">{formattedTotal}</div>
                </div>
              </div>
            </div>
            {/* Modal Footer (Actions) */}
            <div className="p-gutter border-t border-outline-variant flex gap-base justify-end bg-surface-container-lowest shrink-0">
              <button type="button" onClick={onClose} className="h-[48px] px-gutter border-2 border-[#000000] bg-transparent text-[#000000] font-label-bold text-label-bold hover:bg-surface-variant transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={godowns.length === 0} className="h-[48px] px-gutter bg-primary-container text-on-primary font-label-bold text-label-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                Save Purchase
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog overlay for rate mismatches */}
      {showConfirmRate && (
        <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center p-4 z-[200] backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md border-2 border-[#000000] shadow-none overflow-hidden">
            <div className="p-6 border-b-2 border-[#000000] bg-surface-variant">
              <h3 className="text-headline-md font-bold text-on-surface">Update Daily Market Rate?</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="font-body-md text-on-surface-variant">
                The price you entered (<strong>₹{rate}</strong>) differs from today's official daily rate (<strong>₹{currentMarketRates[cropType]?.buyRate}</strong>).
              </p>
              <p className="font-body-md text-on-surface-variant">
                Would you like to update the official market rate for today to match this purchase, or apply it to this purchase only?
              </p>
            </div>
            <div className="p-6 border-t-2 border-[#000000] flex flex-col gap-2 sm:flex-row sm:justify-end bg-surface-container-lowest">
              <button 
                type="button" 
                onClick={() => setShowConfirmRate(false)}
                className="px-4 h-[48px] border-2 border-[#000000] text-on-surface hover:bg-surface-variant font-label-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => submitPurchase(false)}
                className="px-4 h-[48px] bg-secondary text-on-primary hover:opacity-90 font-label-bold transition-opacity"
              >
                Purchase Only
              </button>
              <button 
                type="button" 
                onClick={() => submitPurchase(true)}
                className="px-4 h-[48px] bg-primary-container text-on-primary hover:opacity-90 font-label-bold transition-opacity"
              >
                Update Official Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function DebitModal({ isOpen, onClose, onSubmit }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('cash');
  const [costAmount, setCostAmount] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      date,
      category: category.toUpperCase(),
      costAmount: parseFloat(costAmount),
      description
    });
    setCostAmount('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-container-margin">
      {/* Modal Overlay */}
      <div aria-hidden="true" className="absolute inset-0 bg-secondary/50 backdrop-blur-sm" onClick={onClose}></div>
      {/* Modal Container */}
      <div aria-labelledby="modal-title" aria-modal="true" className="relative bg-surface w-full max-w-lg border-2 border-on-surface rounded-none z-50 shadow-none flex flex-col" role="dialog">
        {/* Header */}
        <div className="flex items-center justify-between p-gutter border-b border-secondary-fixed">
          <h2 className="font-headline-md text-headline-md text-on-surface" id="modal-title">Record Advance/Material</h2>
          <button type="button" onClick={onClose} aria-label="Close modal" className="h-touch-target-min w-touch-target-min flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
          </button>
        </div>
        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-gutter flex flex-col gap-gutter overflow-y-auto max-h-[716px]">
            {/* Date Field */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface" htmlFor="date-input">Date</label>
              <input required className="h-touch-target-min bg-surface border border-secondary-fixed text-on-surface font-body-md text-body-md px-4 focus:outline-none focus:border-on-surface focus:border-2 transition-all w-full" id="date-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            {/* Category Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface" htmlFor="category-select">Category</label>
              <div className="relative">
                <select required className="appearance-none h-touch-target-min bg-surface border border-secondary-fixed text-on-surface font-body-md text-body-md px-4 pr-10 focus:outline-none focus:border-on-surface focus:border-2 transition-all w-full rounded-none" id="category-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="seeds">Seeds</option>
                  <option value="pesticides">Pesticides</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                  <span className="material-symbols-outlined">arrow_drop_down</span>
                </div>
              </div>
            </div>
            {/* Cost/Amount Field */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface" htmlFor="amount-input">Cost / Amount</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant font-body-md text-body-md">₹</span>
                <input required className="h-touch-target-min bg-surface border border-secondary-fixed text-on-surface font-body-md text-body-md pl-8 pr-4 focus:outline-none focus:border-on-surface focus:border-2 transition-all w-full text-right" id="amount-input" min="0" placeholder="0.00" step="0.01" type="number" value={costAmount} onChange={e => setCostAmount(e.target.value)} />
              </div>
            </div>
            {/* Description Text Area */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface" htmlFor="description-input">Description</label>
              <textarea className="bg-surface border border-secondary-fixed text-on-surface font-body-md text-body-md p-4 focus:outline-none focus:border-on-surface focus:border-2 transition-all w-full resize-y min-h-[96px]" id="description-input" placeholder="Enter details..." rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
            </div>
          </div>
          {/* Footer / Action */}
          <div className="p-gutter border-t border-secondary-fixed bg-surface-container-lowest">
            <button type="submit" className="w-full h-touch-target-min bg-error text-on-error font-label-bold text-label-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all rounded-none border border-transparent">
              <span className="material-symbols-outlined">remove</span>
              Deduct from Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
