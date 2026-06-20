import React, { useState, useEffect } from 'react';
import { getFarmers, getAllGodowns, getMarketRates, logPurchase, logDebit, logBulkPurchase, createFarmer } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function NewTradeModal({ isOpen, onClose }) {
  const [tradeType, setTradeType] = useState(''); // 'farmer_purchase', 'bulk_purchase', 'farmer_debit'
  const [farmers, setFarmers] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [marketRates, setMarketRates] = useState({});
  const toast = useToast();

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [farmerId, setFarmerId] = useState('');
  
  // Farmer Purchase fields
  const [cropType, setCropType] = useState('rice');
  const [weight, setWeight] = useState('');
  const [bagWeight, setBagWeight] = useState('101');
  const [rate, setRate] = useState('2450.00');
  const [remarks, setRemarks] = useState('');
  const [godownId, setGodownId] = useState('');
  const [applyMachineCost, setApplyMachineCost] = useState(false);
  const [machineRate, setMachineRate] = useState('110');
  const [machineCost, setMachineCost] = useState('0.00');

  // Quick registration state
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickVillage, setQuickVillage] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Bulk Purchase fields
  const [supplierName, setSupplierName] = useState('');
  const [bulkCropType, setBulkCropType] = useState('RICE');
  const [bulkWeight, setBulkWeight] = useState('');
  const [bulkRatePerQuintal, setBulkRatePerQuintal] = useState('');
  const [bulkBagWeight, setBulkBagWeight] = useState('101');

  // Debit fields
  const [debitCategory, setDebitCategory] = useState('cash');
  const [otherCategorySpecify, setOtherCategorySpecify] = useState('');
  const [debitAmount, setDebitAmount] = useState('');
  const [debitDescription, setDebitDescription] = useState('');

  // Calculations for Farmer Purchase
  let calculatedBags = parseFloat(weight || 0) / parseFloat(bagWeight || 101);
  const floorBags = Math.floor(calculatedBags);
  if (calculatedBags - floorBags > 0.90) {
    calculatedBags = Math.ceil(calculatedBags);
  }
  const grossValue = (calculatedBags * parseFloat(rate || 0)).toFixed(2);
  const totalValue = (parseFloat(grossValue) - (applyMachineCost ? parseFloat(machineCost || 0) : 0)).toFixed(2);

  // Calculations for Bulk Purchase
  const bulkNoOfBags = bulkWeight && bulkBagWeight ? (parseFloat(bulkWeight) / parseFloat(bulkBagWeight)).toFixed(2) : '0.00';
  const bulkEstTotalAmount = bulkWeight && bulkRatePerQuintal ? ((parseFloat(bulkWeight) / 100) * parseFloat(bulkRatePerQuintal)).toFixed(2) : '0.00';

  useEffect(() => {
    if (applyMachineCost) {
      const rateVal = parseFloat(machineRate || 0);
      const machineBags = Math.floor(calculatedBags);
      setMachineCost((machineBags * rateVal).toFixed(2));
    } else {
      setMachineCost('0.00');
    }
  }, [calculatedBags, machineRate, applyMachineCost]);

  // Fetch Farmers, Godowns, and Market Rates when opened
  useEffect(() => {
    if (isOpen) {
      setTradeType(''); // Reset step
      getFarmers().then(data => {
        setFarmers(data);
        if (data.length > 0) setFarmerId(data[0].id);
      }).catch(console.error);

      getAllGodowns().then(data => {
        setGodowns(data);
        if (data.length > 0) setGodownId(data[0].id);
      }).catch(console.error);

      getMarketRates().then(rates => {
        setMarketRates(rates);
        if (rates && rates[cropType]) {
          setRate(rates[cropType].buyRate?.toString() || '2450.00');
          setBagWeight(rates[cropType].bagWeight?.toString() || '101');
        }
      }).catch(console.error);
    }
  }, [isOpen, cropType]);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setWeight('');
    setRemarks('');
    setApplyMachineCost(false);
    setSupplierName('');
    setBulkWeight('');
    setBulkRatePerQuintal('');
    setDebitAmount('');
    setDebitDescription('');
    setOtherCategorySpecify('');
    setTradeType('');
    setShowQuickRegister(false);
    setQuickName('');
    setQuickVillage('');
    setQuickPhone('');
  };

  const handleQuickRegister = async () => {
    if (!quickName.trim() || !quickVillage.trim()) {
      toast.error('Name and Village are required.');
      return;
    }
    setIsRegistering(true);
    try {
      const newFarmer = await createFarmer({
        name: quickName.trim(),
        village: quickVillage.trim(),
        phone: quickPhone.trim()
      });
      toast.success('Farmer registered successfully!');
      
      const updatedFarmers = await getFarmers();
      setFarmers(updatedFarmers);
      setFarmerId(newFarmer.id);
      
      setQuickName('');
      setQuickVillage('');
      setQuickPhone('');
      setShowQuickRegister(false);
    } catch (err) {
      toast.error(err.message || 'Failed to register farmer');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tradeType === 'farmer_purchase') {
        if (!farmerId || !godownId) return;
        await logPurchase({
          farmerId,
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
          updateDailyRate: false
        });
      } else if (tradeType === 'bulk_purchase') {
        if (!godownId) return;
        await logBulkPurchase({
          date,
          supplierName,
          cropType: bulkCropType,
          weight: parseFloat(bulkWeight),
          ratePerQuintal: parseFloat(bulkRatePerQuintal),
          bagWeight: parseFloat(bulkBagWeight),
          noOfBags: parseFloat(bulkNoOfBags),
          godownId
        });
      } else if (tradeType === 'farmer_debit') {
        if (!farmerId) return;
        await logDebit({
          farmerId,
          date,
          category: debitCategory.toUpperCase(),
          otherCategorySpecify: debitCategory === 'other' ? otherCategorySpecify : '',
          costAmount: parseFloat(debitAmount),
          description: debitDescription
        });
      }
      toast.success('Transaction logged successfully!');
      handleResetForm();
      onClose();
      // Reload page to reflect new balances/inventory
      window.location.reload();
    } catch (err) {
      console.error('Error logging trade:', err);
      toast.error(err.message || 'Failed to log transaction. Please verify your inputs.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/10 backdrop-blur-sm p-4 md:p-container-margin overflow-y-auto">
      <div className="w-full max-w-2xl bg-surface border-2 border-[#000000] relative flex flex-col shadow-none max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant shrink-0">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {tradeType === 'farmer_purchase' && 'Record Farmer Crop Purchase'}
            {tradeType === 'bulk_purchase' && 'Record Bulk Purchase'}
            {tradeType === 'farmer_debit' && 'Record Advance / Material'}
            {!tradeType && 'New Trade Quick Entry'}
          </h2>
          <button type="button" onClick={() => { handleResetForm(); onClose(); }} className="w-12 h-12 flex items-center justify-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>

        {/* Step 1: Select Trade Type */}
        {!tradeType ? (
          <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
            <p className="font-body-md text-on-surface-variant text-center">Select the type of transaction you want to record quickly:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Farmer Purchase Option */}
              <button 
                onClick={() => setTradeType('farmer_purchase')}
                className="flex flex-col items-center justify-center p-6 border-2 border-outline hover:border-primary bg-surface hover:bg-surface-container-low cursor-pointer transition-all gap-4 text-center"
              >
                <span className="material-symbols-outlined text-primary text-4xl">agriculture</span>
                <div>
                  <h3 className="font-label-bold text-on-surface text-base">Farmer Purchase</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-2">Log crop purchased from a registered farmer</p>
                </div>
              </button>

              {/* Bulk Purchase Option */}
              <button 
                onClick={() => setTradeType('bulk_purchase')}
                className="flex flex-col items-center justify-center p-6 border-2 border-outline hover:border-primary bg-surface hover:bg-surface-container-low cursor-pointer transition-all gap-4 text-center"
              >
                <span className="material-symbols-outlined text-primary text-4xl">local_shipping</span>
                <div>
                  <h3 className="font-label-bold text-on-surface text-base">Bulk Purchase</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-2">Log crop bought in bulk from a supplier</p>
                </div>
              </button>

              {/* Farmer Debit Option */}
              <button 
                onClick={() => setTradeType('farmer_debit')}
                className="flex flex-col items-center justify-center p-6 border-2 border-outline hover:border-primary bg-surface hover:bg-surface-container-low cursor-pointer transition-all gap-4 text-center"
              >
                <span className="material-symbols-outlined text-error text-4xl">payments</span>
                <div>
                  <h3 className="font-label-bold text-on-surface text-base">Advance / Material</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-2">Record advances, seeds, or fertilizers given</p>
                </div>
              </button>

            </div>
          </div>
        ) : (
          /* Step 2: Render selected Form */
          <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
              
              {/* Global Fields: Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-label-bold text-on-surface">Date</label>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all" />
                </div>

                {/* Farmer Selection for Farmer-specific trades */}
                {(tradeType === 'farmer_purchase' || tradeType === 'farmer_debit') && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="font-label-bold text-label-bold text-on-surface">Select Farmer</label>
                      <button 
                        type="button" 
                        onClick={() => setShowQuickRegister(!showQuickRegister)} 
                        className="text-primary text-xs font-label-bold hover:underline"
                      >
                        {showQuickRegister ? 'Select Existing' : '+ Register New'}
                      </button>
                    </div>
                    {showQuickRegister ? (
                      <div className="border-2 border-outline p-4 bg-surface-container-low flex flex-col gap-3">
                        <div className="font-label-bold text-xs text-primary uppercase tracking-wider">Quick Register Farmer</div>
                        <div className="flex flex-col gap-2">
                          <input 
                            type="text" 
                            placeholder="Full Name *" 
                            value={quickName} 
                            onChange={e => setQuickName(e.target.value)}
                            className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none" 
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="text" 
                              placeholder="Village *" 
                              value={quickVillage} 
                              onChange={e => setQuickVillage(e.target.value)}
                              className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none" 
                            />
                            <input 
                              type="text" 
                              placeholder="Phone" 
                              value={quickPhone} 
                              onChange={e => setQuickPhone(e.target.value)}
                              className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none" 
                            />
                          </div>
                        </div>
                        <button 
                          type="button" 
                          disabled={isRegistering || !quickName.trim() || !quickVillage.trim()}
                          onClick={handleQuickRegister}
                          className="h-[36px] bg-primary text-on-primary font-label-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center gap-2 border border-transparent"
                        >
                          {isRegistering && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                          Register & Select
                        </button>
                      </div>
                    ) : (
                      farmers.length === 0 ? (
                        <div className="h-[48px] bg-error-container text-on-error-container flex items-center px-4 font-label-bold text-[14px]">
                          No farmers registered yet.
                        </div>
                      ) : (
                        <div className="relative">
                          <select required value={farmerId} onChange={e => setFarmerId(e.target.value)} className="appearance-none w-full h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded-none">
                            {farmers.map(f => (
                              <option key={f.id} value={f.id}>{f.name} ({f.village})</option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Godown Selection for Purchases */}
                {(tradeType === 'farmer_purchase' || tradeType === 'bulk_purchase') && (
                  <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Unload Godown</label>
                    {godowns.length === 0 ? (
                      <div className="h-[48px] bg-error-container text-on-error-container flex items-center px-4 font-label-bold text-[14px]">
                        Add a godown first.
                      </div>
                    ) : (
                      <div className="relative">
                        <select required value={godownId} onChange={e => setGodownId(e.target.value)} className="appearance-none w-full h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded-none">
                          {godowns.map(g => (
                            <option key={g.id} value={g.id}>{g.name} ({g.location})</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FORM A: FARMER CROP PURCHASE */}
              {tradeType === 'farmer_purchase' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-outline-variant pt-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Crop Type</label>
                    <div className="relative">
                      <select required value={cropType} onChange={e => setCropType(e.target.value)} className="appearance-none w-full h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded-none">
                        <option value="rice">Rice (Basmati 1121)</option>
                        <option value="maize">Maize (Corn)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Total Weight (Kg)</label>
                    <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={weight} onChange={e => setWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Bag Weight (Kg)</label>
                    <input required type="number" step="0.01" min="0.01" value={bagWeight} onChange={e => setBagWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Rate / Bag (₹)</label>
                    <input required type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Calculated Bags</label>
                    <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant">
                      {calculatedBags.toFixed(2)} Bags
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Net Total Value (₹)</label>
                    <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant font-bold">
                      ₹{parseFloat(totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Remarks</label>
                    <input type="text" placeholder="e.g. Quality grade, transport details" value={remarks} onChange={e => setRemarks(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all" />
                  </div>

                  {/* Machine Cost Toggle */}
                  <div className="flex items-center gap-4 col-span-1 md:col-span-2 mt-2 p-3 bg-surface-container-lowest border border-outline-variant">
                    <input 
                      type="checkbox" 
                      id="modal-apply-machine-cost" 
                      checked={applyMachineCost} 
                      onChange={e => setApplyMachineCost(e.target.checked)}
                      className="w-4 h-4 text-primary border-outline rounded cursor-pointer"
                    />
                    <label htmlFor="modal-apply-machine-cost" className="font-label-bold text-label-bold text-on-surface cursor-pointer select-none">
                      Apply Machine Cost Deduction
                    </label>
                  </div>

                  {applyMachineCost && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-1 md:col-span-2 p-4 bg-surface-container-low border border-outline-variant">
                      <div className="flex flex-col gap-2">
                        <label className="font-label-bold text-sm text-on-surface">Machine Rate / Bag (₹)</label>
                        <input type="number" step="0.01" value={machineRate} onChange={e => setMachineRate(e.target.value)} className="h-[40px] px-4 border border-outline bg-surface outline-none text-right" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-label-bold text-sm text-on-surface">Total Machine Cost (₹)</label>
                        <input type="number" step="0.01" value={machineCost} onChange={e => setMachineCost(e.target.value)} className="h-[40px] px-4 border border-outline bg-surface outline-none text-right" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FORM B: BULK PURCHASE */}
              {tradeType === 'bulk_purchase' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-outline-variant pt-6">
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Supplier Name</label>
                    <input required type="text" placeholder="Enter supplier name" value={supplierName} onChange={e => setSupplierName(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Crop Type</label>
                    <div className="relative">
                      <select required value={bulkCropType} onChange={e => setBulkCropType(e.target.value)} className="appearance-none w-full h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded-none">
                        <option value="RICE">Rice (Basmati 1121)</option>
                        <option value="MAIZE">Maize (Corn)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Total Weight (Kg)</label>
                    <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={bulkWeight} onChange={e => setBulkWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Rate per Quintal (₹)</label>
                    <input required type="number" step="0.01" min="0.00" placeholder="0.00" value={bulkRatePerQuintal} onChange={e => setBulkRatePerQuintal(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Bag Weight (Kg)</label>
                    <input required type="number" step="0.01" min="0.01" value={bulkBagWeight} onChange={e => setBulkBagWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Est. No. of Bags</label>
                    <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant">
                      {bulkNoOfBags}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Est. Total Amount spent (₹)</label>
                    <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant font-bold">
                      ₹{parseFloat(bulkEstTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}

              {/* FORM C: ADVANCE / MATERIAL DEBIT */}
              {tradeType === 'farmer_debit' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-outline-variant pt-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Category</label>
                    <div className="relative">
                      <select required value={debitCategory} onChange={e => setDebitCategory(e.target.value)} className="appearance-none w-full h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded-none">
                        <option value="cash">Cash Advance</option>
                        <option value="seeds">Seeds</option>
                        <option value="pesticides">Pesticides</option>
                        <option value="other">Other Material</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
                    </div>
                  </div>

                  {debitCategory === 'other' && (
                    <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                      <label className="font-label-bold text-label-bold text-on-surface">Specify Category</label>
                      <input required type="text" placeholder="e.g. Fertilizer, Equipment rental" value={otherCategorySpecify} onChange={e => setOtherCategorySpecify(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Cost / Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant">₹</span>
                      <input required type="number" min="0" placeholder="0.00" step="0.01" value={debitAmount} onChange={e => setDebitAmount(e.target.value)} className="h-[48px] pl-8 pr-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right w-full" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-label-bold text-label-bold text-on-surface">Description</label>
                    <textarea placeholder="Enter details..." rows="3" value={debitDescription} onChange={e => setDebitDescription(e.target.value)} className="p-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all w-full resize-y min-h-[96px]"></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-outline-variant flex gap-4 bg-surface-container-lowest shrink-0">
              <button type="button" onClick={() => setTradeType('')} className="flex-1 h-[48px] border-2 border-[#000000] font-label-bold text-[#000000] hover:bg-surface-variant transition-colors">
                Back
              </button>
              <button 
                type="submit" 
                disabled={(tradeType === 'farmer_purchase' && (!farmerId || !godownId)) || (tradeType === 'bulk_purchase' && !godownId) || (tradeType === 'farmer_debit' && !farmerId)} 
                className="flex-1 h-[48px] bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Record {tradeType === 'farmer_purchase' && 'Purchase'}
                {tradeType === 'bulk_purchase' && 'Bulk Purchase'}
                {tradeType === 'farmer_debit' && 'Advance/Material'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
