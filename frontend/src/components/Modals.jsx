import React, { useState, useEffect } from 'react';
import { getMarketRates, getAllGodowns } from '../services/api';
import { useToast } from '../context/ToastContext';
import ModalShell from './ModalShell';
import QuickGodownRegisterForm from './QuickGodownRegisterForm';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import { useAuth } from '../context/AuthContext';

export function NewFarmerModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, village, phone });
    setName('');
    setVillage('');
    setPhone('');
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Register Farmer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-label-bold text-on-surface-variant mb-1">Full Name</label>
          <input required type="text" className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block font-label-bold text-on-surface-variant mb-1">Village / Region</label>
          <input required type="text" className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded" value={village} onChange={e => setVillage(e.target.value)} />
        </div>
        <div>
          <label className="block font-label-bold text-on-surface-variant mb-1">Phone Number</label>
          <input required type="text" className="w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <button type="submit" className="w-full h-[48px] bg-primary text-on-primary font-label-bold border-2 border-on-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:opacity-90 mt-6 rounded">
          Register Account
        </button>
      </form>
    </ModalShell>
  );
}

export function PurchaseModal({ isOpen, onClose, onSubmit, farmerName = "Current Farmer", purchase = null }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const toast = useToast();
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

  // Quick godown registration state
  const [showQuickRegisterGodown, setShowQuickRegisterGodown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getMarketRates().then(rates => {
        setCurrentMarketRates(rates);
        if (!purchase && rates && rates[cropType]) {
          setRate(rates[cropType].buyRate?.toString() || '2450.00');
          setBagWeight(rates[cropType].bagWeight?.toString() || '101');
        }
      }).catch(console.error);
      
      getAllGodowns().then(data => {
        setGodowns(data);
        if (!purchase && data.length > 0) {
          setGodownId(data[0].id);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !purchase) {
      if (currentMarketRates && currentMarketRates[cropType]) {
        setRate(currentMarketRates[cropType].buyRate?.toString() || '2450.00');
        setBagWeight(currentMarketRates[cropType].bagWeight?.toString() || '101');
      }
    }
  }, [cropType, currentMarketRates, isOpen, purchase]);

  useEffect(() => {
    if (isOpen) {
      if (purchase) {
        setDate(purchase.date || new Date().toISOString().split('T')[0]);
        setCropType(purchase.cropType?.toLowerCase() || 'rice');
        setWeight(purchase.weight?.toString() || '');
        setBagWeight(purchase.bagWeight?.toString() || '101');
        setRate(purchase.rateApplied?.toString() || '2450.00');
        setRemarks(purchase.remarks || '');
        const hasMachineCost = parseFloat(purchase.machineCost || 0) > 0;
        setApplyMachineCost(hasMachineCost);
        if (hasMachineCost) {
          setMachineCost(purchase.machineCost?.toString() || '0.00');
          let calculatedBags = parseFloat(purchase.weight || 0) / parseFloat(purchase.bagWeight || 101);
          const floorBags = Math.floor(calculatedBags);
          if (calculatedBags - floorBags > 0.90) {
            calculatedBags = Math.ceil(calculatedBags);
          } else {
            calculatedBags = floorBags;
          }
          if (calculatedBags > 0) {
            setMachineRate((parseFloat(purchase.machineCost) / calculatedBags).toFixed(2));
          } else {
            setMachineRate('110');
          }
        } else {
          setMachineCost('0.00');
          setMachineRate('110');
        }
        if (purchase.godownId) {
          setGodownId(purchase.godownId);
        } else if (purchase.godown?.id) {
          setGodownId(purchase.godown.id);
        }
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setCropType('rice');
        setWeight('');
        setRemarks('');
        setApplyMachineCost(false);
        setMachineCost('0.00');
        setMachineRate('110');
      }
      setShowQuickRegisterGodown(false);
    }
  }, [isOpen, purchase]);

  const handleGodownRegistered = async (newGodown) => {
    const updatedGodowns = await getAllGodowns();
    setGodowns(updatedGodowns);
    setGodownId(newGodown.id);
    setShowQuickRegisterGodown(false);
  };

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
      return;
    }
    onSubmit({
      id: purchase?.id,
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
      <ModalShell 
        isOpen={isOpen} 
        onClose={onClose} 
        title={purchase ? 'Edit Crop Purchase' : 'Add Crop Purchase'} 
        size="lg" 
        zIndex="z-[100]"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farmer Context */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 flex items-center gap-3 rounded">
            <span className="material-symbols-outlined text-primary">person</span>
            <div>
              <div className="font-label-bold text-on-surface">{farmerName}</div>
              <div className="font-body-md text-secondary text-xs">Ledger Profile</div>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Godown Select */}
            <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
              <div className="flex justify-between items-center">
                <label className="font-label-bold text-on-surface" htmlFor="godown-select">Unload Godown</label>
                {isAdmin && (
                  <button 
                    type="button" 
                    onClick={() => setShowQuickRegisterGodown(!showQuickRegisterGodown)} 
                    className="text-primary text-xs font-label-bold hover:underline"
                  >
                    {showQuickRegisterGodown ? 'Select Existing' : '+ Register New'}
                  </button>
                )}
              </div>
              {showQuickRegisterGodown ? (
                <QuickGodownRegisterForm 
                  onGodownRegistered={handleGodownRegistered}
                  onCancel={() => setShowQuickRegisterGodown(false)}
                />
              ) : (
                godowns.length === 0 ? (
                  <div className="h-[48px] bg-error-container text-on-error-container flex items-center px-4 font-label-bold border border-error rounded">
                    <span className="material-symbols-outlined mr-2">error</span>
                    Please add a godown first.
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

            {/* Date */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-on-surface" htmlFor="purchase-date">Date</label>
              <CustomDatePicker value={date} onChange={setDate} />
            </div>

            {/* Crop Type */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-on-surface" htmlFor="crop-type">Crop Type</label>
              <CustomSelect 
                value={cropType} 
                onChange={val => setCropType(val)}
                options={[
                  { value: 'rice', label: 'Rice (Basmati 1121)' },
                  { value: 'maize', label: 'Maize (Corn)' }
                ]}
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-on-surface" htmlFor="weight">Total Weight (Kg)</label>
              <input required className="h-[48px] bg-surface border border-outline text-on-surface px-4 font-body-md focus:border-on-surface focus:border-2 focus:ring-0 outline-none transition-all text-right rounded" id="weight" placeholder="0.00" type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)}/>
            </div>

            {/* Bag Weight */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-on-surface" htmlFor="bag-weight">Bag Weight (Kg)</label>
              <input required className="h-[48px] bg-surface border border-outline text-on-surface px-4 font-body-md focus:border-on-surface focus:border-2 focus:ring-0 outline-none transition-all text-right rounded" id="bag-weight" placeholder="101.00" type="number" step="0.01" value={bagWeight} onChange={e => setBagWeight(e.target.value)}/>
            </div>

            {/* Rate */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-on-surface" htmlFor="rate">Rate / Bag (₹)</label>
              <input required className="h-[48px] bg-surface border border-outline text-on-surface px-4 font-body-md focus:border-on-surface focus:border-2 focus:ring-0 outline-none transition-all text-right rounded" id="rate" type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)}/>
              <span className="font-body-sm text-xs text-secondary">
                Market Rate: ₹{currentMarketRates[cropType] ? currentMarketRates[cropType].buyRate : '2450'}
              </span>
            </div>

            {/* Bags Display */}
            <div className="flex flex-col gap-1 bg-surface-container-lowest p-3 border border-outline-variant rounded text-center justify-center">
              <span className="font-label-bold text-xs text-secondary">Calculated Bags</span>
              <span className="font-headline-sm text-headline-sm text-on-surface mt-1">
                {calculatedBags.toFixed(2)} Bags
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-on-surface text-sm" htmlFor="purchase-remarks">Remarks (Optional)</label>
            <input className="h-[48px] bg-surface border border-outline text-on-surface px-4 font-body-md focus:border-on-surface focus:border-2 focus:ring-0 outline-none transition-all rounded" id="purchase-remarks" placeholder="e.g. Quality grade, transport details" type="text" value={remarks} onChange={e => setRemarks(e.target.value)}/>
          </div>

          {/* Machine Cost */}
          <div className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-outline-variant rounded">
            <input 
              type="checkbox" 
              id="apply-machine-cost" 
              checked={applyMachineCost} 
              onChange={e => setApplyMachineCost(e.target.checked)}
              className="w-4 h-4 text-primary border-outline rounded cursor-pointer"
            />
            <label htmlFor="apply-machine-cost" className="font-label-bold text-on-surface cursor-pointer select-none">
              Apply Machine Cost / Deduction
            </label>
          </div>

          {applyMachineCost && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface-container-low border border-outline-variant rounded">
              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-xs text-on-surface" htmlFor="machine-rate">Machine Rate / Bag (₹)</label>
                <input 
                  className="h-[40px] bg-surface border border-outline text-on-surface px-4 font-body-sm text-sm focus:border-on-surface focus:border-2 focus:ring-0 outline-none transition-all text-right rounded" 
                  id="machine-rate" 
                  type="number" 
                  step="0.01" 
                  value={machineRate} 
                  onChange={e => setMachineRate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-xs text-on-surface" htmlFor="machine-cost">Total Machine Cost (₹)</label>
                <input 
                  className="h-[40px] bg-surface border border-outline text-on-surface px-4 font-body-sm text-sm focus:border-on-surface focus:border-2 focus:ring-0 outline-none transition-all text-right rounded" 
                  id="machine-cost" 
                  type="number" 
                  step="0.01" 
                  value={machineCost} 
                  onChange={e => setMachineCost(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Summary Display */}
          <div className="border border-outline-variant p-4 flex flex-col gap-2 bg-surface-bright rounded">
            {applyMachineCost && (
              <>
                <div className="flex justify-between items-center font-body-sm text-secondary text-sm">
                  <span>Gross Value:</span>
                  <span className="font-bold">₹ {parseFloat(grossValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center font-body-sm text-error text-sm">
                  <span>Machine Cost Deduction:</span>
                  <span className="font-bold">- ₹ {parseFloat(machineCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <hr className="border-outline-variant" />
              </>
            )}
            <div className="flex flex-col items-center justify-center">
              <span className="font-label-bold text-xs text-secondary uppercase tracking-widest">
                {applyMachineCost ? 'Net Value' : 'Total Value'}
              </span>
              <div className="font-number-xl text-number-xl text-[#000000] mt-2">{formattedTotal}</div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-outline/30">
            <button type="button" onClick={onClose} className="h-[48px] px-6 border-2 border-on-surface bg-surface text-on-surface font-label-bold hover:bg-surface-variant transition-colors rounded">
              Cancel
            </button>
            <button type="submit" disabled={godowns.length === 0} className="h-[48px] px-6 bg-primary text-on-primary border-2 border-on-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-label-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded">
              Save Purchase
            </button>
          </div>
        </form>
      </ModalShell>

      {/* Confirmation Dialog overlay for rate mismatches */}
      <ModalShell 
        isOpen={showConfirmRate} 
        onClose={() => setShowConfirmRate(false)} 
        title="Update Daily Market Rate?" 
        size="md" 
        zIndex="z-[200]"
      >
        <div className="space-y-4">
          <p className="font-body-md text-on-surface-variant text-sm">
            The price you entered (<strong>₹{rate}</strong>) differs from today's official daily rate (<strong>₹{currentMarketRates[cropType]?.buyRate}</strong>).
          </p>
          <p className="font-body-md text-on-surface-variant text-sm">
            Would you like to update the official market rate for today to match this purchase, or apply it to this purchase only?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-outline/30">
            <button 
              type="button" 
              onClick={() => setShowConfirmRate(false)}
              className="px-4 h-[48px] border-2 border-on-surface bg-surface text-on-surface hover:bg-surface-variant font-label-bold transition-colors rounded"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => submitPurchase(false)}
              className="px-4 h-[48px] bg-secondary text-on-primary hover:opacity-90 font-label-bold border-2 border-on-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded"
            >
              Purchase Only
            </button>
            <button 
              type="button" 
              onClick={() => submitPurchase(true)}
              className="px-4 h-[48px] bg-primary text-on-primary hover:opacity-90 font-label-bold border-2 border-on-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded"
            >
              Update Rate
            </button>
          </div>
        </div>
      </ModalShell>
    </>
  );
}

export function DebitModal({ isOpen, onClose, onSubmit, debit = null }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('cash');
  const [otherCategorySpecify, setOtherCategorySpecify] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (debit) {
        setDate(debit.date || new Date().toISOString().split('T')[0]);
        setCategory(debit.category?.toLowerCase() || 'cash');
        setOtherCategorySpecify(debit.otherCategorySpecify || '');
        setCostAmount(debit.costAmount?.toString() || debit.amount?.toString() || '');
        setDescription(debit.rawDescription || debit.description || '');
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setCategory('cash');
        setOtherCategorySpecify('');
        setCostAmount('');
        setDescription('');
      }
    }
  }, [isOpen, debit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: debit?.id,
      date,
      category: category.toUpperCase(),
      otherCategorySpecify: category === 'other' ? otherCategorySpecify : '',
      costAmount: parseFloat(costAmount),
      description
    });
    setCostAmount('');
    setDescription('');
    setOtherCategorySpecify('');
  };

  return (
    <ModalShell 
      isOpen={isOpen} 
      onClose={onClose} 
      title={debit ? 'Edit Advance/Material' : 'Record Advance/Material'} 
      size="md" 
      zIndex="z-[100]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-on-surface" htmlFor="date-input">Date</label>
           <CustomDatePicker value={date} onChange={setDate} />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-on-surface" htmlFor="category-select">Category</label>
          <CustomSelect 
            value={category} 
            onChange={val => setCategory(val)}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'seeds', label: 'Seeds' },
              { value: 'pesticides', label: 'Pesticides' },
              { value: 'other', label: 'Other' }
            ]}
          />
        </div>

        {/* Specify */}
        {category === 'other' && (
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-on-surface" htmlFor="other-specify-input">Specify Category</label>
            <input required className="h-[48px] bg-surface border border-outline text-on-surface font-body-md px-4 focus:outline-none focus:border-on-surface focus:border-2 transition-all w-full rounded" id="other-specify-input" type="text" placeholder="e.g. Fertilizer, Equipment rental" value={otherCategorySpecify} onChange={e => setOtherCategorySpecify(e.target.value)} />
          </div>
        )}

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-on-surface" htmlFor="amount-input">Cost / Amount</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant font-body-md font-bold">₹</span>
            <input required className="h-[48px] bg-surface border border-outline text-on-surface font-body-md pl-8 pr-4 focus:outline-none focus:border-on-surface focus:border-2 transition-all w-full text-right rounded" id="amount-input" min="0" placeholder="0.00" step="0.01" type="number" value={costAmount} onChange={e => setCostAmount(e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="font-label-bold text-on-surface" htmlFor="description-input">Description</label>
          <textarea className="bg-surface border border-outline text-on-surface font-body-md p-4 focus:outline-none focus:border-on-surface focus:border-2 transition-all w-full resize-y min-h-[96px] rounded" id="description-input" placeholder="Enter details..." rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
        </div>

        <button type="submit" className="w-full h-[48px] bg-primary text-on-primary font-label-bold flex items-center justify-center gap-2 hover:opacity-90 border-2 border-on-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded">
          <span className="material-symbols-outlined">{debit ? 'save' : 'remove'}</span>
          {debit ? 'Save Changes' : 'Deduct from Balance'}
        </button>
      </form>
    </ModalShell>
  );
}
