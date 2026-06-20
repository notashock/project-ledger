import React, { useState, useEffect } from 'react';
import { getFarmers, getAllGodowns, getMarketRates, logPurchase, logDebit, logBulkPurchase } from '../services/api';
import { useToast } from '../context/ToastContext';
import ModalShell from './ModalShell';
import QuickFarmerRegisterForm from './QuickFarmerRegisterForm';
import QuickGodownRegisterForm from './QuickGodownRegisterForm';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

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

  // Quick registration toggles
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [showQuickRegisterGodown, setShowQuickRegisterGodown] = useState(false);

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
    setShowQuickRegisterGodown(false);
  };

  const handleFarmerRegistered = async (newFarmer) => {
    const updatedFarmers = await getFarmers();
    setFarmers(updatedFarmers);
    setFarmerId(newFarmer.id);
    setShowQuickRegister(false);
  };

  const handleGodownRegistered = async (newGodown) => {
    const updatedGodowns = await getAllGodowns();
    setGodowns(updatedGodowns);
    setGodownId(newGodown.id);
    setShowQuickRegisterGodown(false);
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

  const getHeaderTitle = () => {
    if (tradeType === 'farmer_purchase') return 'Record Farmer Crop Purchase';
    if (tradeType === 'bulk_purchase') return 'Record Bulk Purchase';
    if (tradeType === 'farmer_debit') return 'Record Advance / Material';
    return 'New Trade Quick Entry';
  };

  return (
    <ModalShell 
      isOpen={isOpen} 
      onClose={() => { handleResetForm(); onClose(); }} 
      title={getHeaderTitle()} 
      size="2xl" 
      zIndex="z-[100]"
    >
      {/* Step 1: Select Trade Type */}
      {!tradeType ? (
        <div className="flex flex-col gap-6">
          <p className="font-body-md text-on-surface-variant text-center">Select the type of transaction you want to record quickly:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Farmer Purchase Option */}
            <button 
              onClick={() => setTradeType('farmer_purchase')}
              className="flex flex-col items-center justify-center p-6 border-2 border-outline hover:border-primary bg-surface hover:bg-surface-container-low cursor-pointer transition-all gap-4 text-center rounded"
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
              className="flex flex-col items-center justify-center p-6 border-2 border-outline hover:border-primary bg-surface hover:bg-surface-container-low cursor-pointer transition-all gap-4 text-center rounded"
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
              className="flex flex-col items-center justify-center p-6 border-2 border-outline hover:border-primary bg-surface hover:bg-surface-container-low cursor-pointer transition-all gap-4 text-center rounded"
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
        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* Global Fields: Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-label-bold text-on-surface">Date</label>
              <CustomDatePicker value={date} onChange={setDate} />
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
                  <QuickFarmerRegisterForm 
                    onFarmerRegistered={handleFarmerRegistered}
                    onCancel={() => setShowQuickRegister(false)}
                  />
                ) : (
                  farmers.length === 0 ? (
                    <div className="h-[48px] bg-error-container text-on-error-container flex items-center px-4 font-label-bold text-[14px] rounded border border-error">
                      No farmers registered yet.
                    </div>
                  ) : (
                    <CustomSelect 
                      value={farmerId} 
                      onChange={val => setFarmerId(val)}
                      options={farmers.map(f => ({ value: f.id, label: `${f.name} (${f.village})` }))}
                    />
                  )
                )}
              </div>
            )}

            {/* Godown Selection for Purchases */}
            {(tradeType === 'farmer_purchase' || tradeType === 'bulk_purchase') && (
              <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-bold text-label-bold text-on-surface">Unload Godown</label>
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
            )}
          </div>

          {/* FORM A: FARMER CROP PURCHASE */}
          {tradeType === 'farmer_purchase' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-outline-variant pt-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Crop Type</label>
                <CustomSelect 
                  value={cropType} 
                  onChange={val => setCropType(val)}
                  options={[
                    { value: 'rice', label: 'Rice (Basmati 1121)' },
                    { value: 'maize', label: 'Maize (Corn)' }
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Total Weight (Kg)</label>
                <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={weight} onChange={e => setWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right rounded" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Bag Weight (Kg)</label>
                <input required type="number" step="0.01" min="0.01" value={bagWeight} onChange={e => setBagWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right rounded" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Rate / Bag (₹)</label>
                <input required type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right rounded" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Calculated Bags</label>
                <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant rounded">
                  {calculatedBags.toFixed(2)} Bags
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Net Total Value (₹)</label>
                <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant font-bold rounded">
                  ₹{parseFloat(totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-label-bold text-label-bold text-on-surface">Remarks</label>
                <input type="text" placeholder="e.g. Quality grade, transport details" value={remarks} onChange={e => setRemarks(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded" />
              </div>

              {/* Machine Cost Toggle */}
              <div className="flex items-center gap-4 col-span-1 md:col-span-2 mt-2 p-3 bg-surface-container-lowest border border-outline-variant rounded">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-1 md:col-span-2 p-4 bg-surface-container-low border border-outline-variant rounded">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-sm text-on-surface">Machine Rate / Bag (₹)</label>
                    <input type="number" step="0.01" value={machineRate} onChange={e => setMachineRate(e.target.value)} className="h-[40px] px-4 border border-outline bg-surface outline-none text-right rounded" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-sm text-on-surface">Total Machine Cost (₹)</label>
                    <input type="number" step="0.01" value={machineCost} onChange={e => setMachineCost(e.target.value)} className="h-[40px] px-4 border border-outline bg-surface outline-none text-right rounded" />
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
                <input required type="text" placeholder="Enter supplier name" value={supplierName} onChange={e => setSupplierName(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Crop Type</label>
                <CustomSelect 
                  value={bulkCropType} 
                  onChange={val => setBulkCropType(val)}
                  options={[
                    { value: 'RICE', label: 'Rice (Basmati 1121)' },
                    { value: 'MAIZE', label: 'Maize (Corn)' }
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Total Weight (Kg)</label>
                <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={bulkWeight} onChange={e => setBulkWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right rounded" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Rate per Quintal (₹)</label>
                <input required type="number" step="0.01" min="0.00" placeholder="0.00" value={bulkRatePerQuintal} onChange={e => setBulkRatePerQuintal(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right rounded" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Bag Weight (Kg)</label>
                <input required type="number" step="0.01" min="0.01" value={bulkBagWeight} onChange={e => setBulkBagWeight(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right rounded" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Est. No. of Bags</label>
                <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant rounded">
                  {bulkNoOfBags}
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-label-bold text-label-bold text-on-surface">Est. Total Amount spent (₹)</label>
                <div className="h-[48px] px-4 border border-outline bg-surface-container flex items-center justify-end font-number-lg text-on-surface-variant font-bold rounded">
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
                <CustomSelect 
                  value={debitCategory} 
                  onChange={val => setDebitCategory(val)}
                  options={[
                    { value: 'cash', label: 'Cash Advance' },
                    { value: 'seeds', label: 'Seeds' },
                    { value: 'pesticides', label: 'Pesticides' },
                    { value: 'other', label: 'Other Material' }
                  ]}
                />
              </div>

              {debitCategory === 'other' && (
                <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                  <label className="font-label-bold text-label-bold text-on-surface">Specify Category</label>
                  <input required type="text" placeholder="e.g. Fertilizer, Equipment rental" value={otherCategorySpecify} onChange={e => setOtherCategorySpecify(e.target.value)} className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="font-label-bold text-label-bold text-on-surface">Cost / Amount (₹)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant">₹</span>
                  <input required type="number" min="0" placeholder="0.00" step="0.01" value={debitAmount} onChange={e => setDebitAmount(e.target.value)} className="h-[48px] pl-8 pr-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all text-right w-full rounded" />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-label-bold text-label-bold text-on-surface">Description</label>
                <textarea placeholder="Enter details..." rows="3" value={debitDescription} onChange={e => setDebitDescription(e.target.value)} className="p-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all w-full resize-y min-h-[96px] rounded"></textarea>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-outline-variant flex gap-4">
            <button type="button" onClick={() => setTradeType('')} className="flex-1 h-[48px] border-2 border-[#000000] font-label-bold text-[#000000] bg-surface hover:bg-surface-variant transition-colors rounded">
              Back
            </button>
            <button 
              type="submit" 
              disabled={(tradeType === 'farmer_purchase' && (!farmerId || !godownId)) || (tradeType === 'bulk_purchase' && !godownId) || (tradeType === 'farmer_debit' && !farmerId)} 
              className="flex-1 h-[48px] bg-primary text-on-primary font-label-bold hover:opacity-90 transition-opacity disabled:opacity-50 border-2 border-on-surface shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded"
            >
              Record {tradeType === 'farmer_purchase' && 'Purchase'}
              {tradeType === 'bulk_purchase' && 'Bulk Purchase'}
              {tradeType === 'farmer_debit' && 'Advance/Material'}
            </button>
          </div>

        </form>
      )}
    </ModalShell>
  );
}
