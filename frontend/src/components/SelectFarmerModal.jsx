import React, { useState, useEffect } from 'react';
import ModalShell from './ModalShell';
import QuickFarmerRegisterForm from './QuickFarmerRegisterForm';
import CustomSelect from './CustomSelect';

export default function SelectFarmerModal({ 
  isOpen, 
  onClose, 
  farmers, 
  onSelect, 
  onFarmerRegistered 
}) {
  const [farmerId, setFarmerId] = useState('');
  const [showQuickRegister, setShowQuickRegister] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFarmerId('');
      setShowQuickRegister(false);
    }
  }, [isOpen]);

  const handleFarmerRegistered = (newFarmer) => {
    if (onFarmerRegistered) {
      onFarmerRegistered();
    }
    onSelect(newFarmer.id);
    setShowQuickRegister(false);
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Select Farmer" size="md">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-label-bold text-on-surface-variant">Select Account</span>
          <button 
            type="button"
            onClick={() => setShowQuickRegister(!showQuickRegister)} 
            className="text-primary text-xs font-label-bold hover:underline"
          >
            {showQuickRegister ? 'Select Existing' : '+ Quick Register New'}
          </button>
        </div>

        {showQuickRegister ? (
          <QuickFarmerRegisterForm 
            onFarmerRegistered={handleFarmerRegistered} 
            onCancel={() => setShowQuickRegister(false)}
          />
        ) : (
          <div className="space-y-4">
            <CustomSelect 
              value={farmerId} 
              onChange={val => setFarmerId(val)}
              placeholder="-- Choose Farmer --"
              options={farmers.map(f => ({ value: f.id, label: `${f.name} (${f.village})` }))}
            />
            <button 
              onClick={() => onSelect(farmerId)} 
              disabled={!farmerId} 
              className="w-full h-[48px] bg-primary text-on-primary font-label-bold hover:opacity-90 transition-all disabled:opacity-50 rounded"
            >
              Proceed with Selected
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
