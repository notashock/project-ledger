import React, { useState, useEffect } from 'react';
import { getFarmers, logDebit, createFarmer } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function SmartScanReviewModal({ isOpen, onClose, scannedData, onSuccess, defaultFarmerId }) {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState(defaultFarmerId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const { showToast } = useToast();

  // Quick registration state
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickVillage, setQuickVillage] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFarmers();
      // Initialize items with the scanned data
      setScannedItems(scannedData || []);
      setSelectedFarmerId(defaultFarmerId || '');
      setShowQuickRegister(false);
      setQuickName('');
      setQuickVillage('');
      setQuickPhone('');
    }
  }, [isOpen, scannedData, defaultFarmerId]);

  const loadFarmers = async () => {
    try {
      const data = await getFarmers();
      setFarmers(data);
    } catch (err) {
      showToast('error', 'Failed to load farmers list');
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...scannedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setScannedItems(newItems);
  };

  const removeItem = (index) => {
    setScannedItems(scannedItems.filter((_, i) => i !== index));
  };

  const handleQuickRegister = async () => {
    if (!quickName.trim() || !quickVillage.trim()) {
      showToast('error', 'Name and Village are required.');
      return;
    }
    setIsRegistering(true);
    try {
      const newFarmer = await createFarmer({
        name: quickName.trim(),
        village: quickVillage.trim(),
        phone: quickPhone.trim()
      });
      showToast('success', 'Farmer registered successfully!');
      
      const updatedFarmers = await getFarmers();
      setFarmers(updatedFarmers);
      setSelectedFarmerId(newFarmer.id);
      
      setQuickName('');
      setQuickVillage('');
      setQuickPhone('');
      setShowQuickRegister(false);
    } catch (err) {
      showToast('error', err.message || 'Failed to register farmer');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFarmerId) {
      showToast('error', 'Please select a farmer to map these receipts to.');
      return;
    }
    
    if (scannedItems.length === 0) {
      showToast('error', 'No items to save.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save each parsed debit
      for (const item of scannedItems) {
        let cleanCat = (item.category || '').trim();
        const lowerCat = cleanCat.toLowerCase();
        
        if (lowerCat.startsWith('other') && cleanCat.endsWith(')')) {
          const openParen = cleanCat.indexOf('(');
          if (openParen !== -1) {
            cleanCat = cleanCat.substring(openParen + 1, cleanCat.length - 1).trim();
          }
        } else if (lowerCat.startsWith('other')) {
          const remainder = cleanCat.substring(5).trim();
          if (remainder.startsWith('-') || remainder.startsWith(':')) {
            cleanCat = remainder.substring(1).trim();
          }
        }

        const catUpper = cleanCat.toUpperCase();
        const isStandard = ['SEEDS', 'PESTICIDES', 'CASH'].includes(catUpper);
        
        await logDebit({
          farmerId: selectedFarmerId,
          date: new Date().toISOString().split('T')[0],
          category: isStandard ? catUpper : 'OTHER',
          otherCategorySpecify: isStandard ? '' : cleanCat,
          costAmount: item.costAmount,
          description: item.description
        });
      }
      showToast('success', 'Smart Scan receipts saved successfully!');
      onSuccess(selectedFarmerId);
      onClose();
    } catch (err) {
      showToast('error', err.message || 'Failed to save scanned receipts');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-2xl rounded border-2 border-outline shadow-brutal flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b-2 border-outline bg-surface-container">
          <h2 className="font-headline-sm font-bold text-on-surface">Review Smart Scan</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-variant rounded">
            <span className="material-symbols-outlined font-bold">close</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="block font-label-bold text-on-surface-variant">
                Map to Farmer *
              </label>
              <button 
                type="button" 
                onClick={() => setShowQuickRegister(!showQuickRegister)} 
                className="text-primary text-xs font-label-bold hover:underline"
              >
                {showQuickRegister ? 'Select Existing' : '+ Register New Farmer'}
              </button>
            </div>
            
            {showQuickRegister ? (
              <div className="border border-outline p-4 bg-surface-container-low flex flex-col gap-3">
                <div className="font-label-bold text-xs text-primary uppercase tracking-wider">Quick Register Farmer</div>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="Full Name *" 
                    value={quickName} 
                    onChange={e => setQuickName(e.target.value)}
                    className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none w-full" 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Village *" 
                      value={quickVillage} 
                      onChange={e => setQuickVillage(e.target.value)}
                      className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none w-full" 
                    />
                    <input 
                      type="text" 
                      placeholder="Phone" 
                      value={quickPhone} 
                      onChange={e => setQuickPhone(e.target.value)}
                      className="h-[36px] px-3 border border-outline bg-surface text-sm outline-none w-full" 
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  disabled={isRegistering || !quickName.trim() || !quickVillage.trim()}
                  onClick={handleQuickRegister}
                  className="w-full h-[36px] bg-primary text-on-primary font-label-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center gap-2"
                >
                  {isRegistering && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Register & Map Farmer
                </button>
              </div>
            ) : (
              <>
                <select
                  className="w-full h-touch-target-min px-3 rounded border-2 border-outline bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none font-body-md"
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  required
                >
                  <option value="">-- Select Farmer --</option>
                  {farmers.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.village})</option>
                  ))}
                </select>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  Select an existing farmer or use the quick register option.
                </p>
              </>
            )}
          </div>

          <div>
            <h3 className="font-label-bold text-on-surface mb-3 border-b border-outline pb-1">Extracted Receipts</h3>
            {scannedItems.length === 0 ? (
              <p className="text-body-md text-on-surface-variant italic">No valid items found.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {scannedItems.map((item, idx) => (
                  <div key={idx} className="border-2 border-outline rounded p-3 bg-surface-container-low flex flex-col gap-2 relative">
                    <button 
                      onClick={() => removeItem(idx)}
                      className="absolute top-2 right-2 text-error hover:bg-error/10 rounded p-1"
                      title="Remove Item"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">delete</span>
                    </button>
                    <div className="font-label-bold text-primary mb-1">Item {idx + 1}</div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-label-sm text-on-surface-variant mb-1">Category</label>
                        <input 
                          type="text"
                          value={item.category || ''}
                          onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                          className="w-full px-2 py-1 border border-outline rounded bg-surface font-body-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-label-sm text-on-surface-variant mb-1">Cost Amount</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={item.costAmount || ''}
                          onChange={(e) => handleItemChange(idx, 'costAmount', e.target.value)}
                          className="w-full px-2 py-1 border border-outline rounded bg-surface font-body-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-label-sm text-on-surface-variant mb-1">Description</label>
                      <input 
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-outline rounded bg-surface font-body-sm"
                      />
                    </div>
                    {item.farmerName && (
                      <div className="text-label-sm text-on-surface-variant italic mt-1 border-t border-outline/30 pt-1">
                        Detected Name: <span className="font-bold text-on-surface">{item.farmerName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t-2 border-outline bg-surface-container flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 h-touch-target-min font-label-bold rounded border-2 border-outline hover:bg-surface-variant transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || scannedItems.length === 0}
            className="px-6 h-touch-target-min bg-primary text-on-primary font-label-bold rounded border-2 border-[#000000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            )}
            Save Receipts
          </button>
        </div>
      </div>
    </div>
  );
}
