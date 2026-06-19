import React, { useEffect, useState } from 'react';
import { getFarmers, createFarmer, logPurchase } from '../services/api';
import { Link } from 'react-router-dom';
import { NewFarmerModal, PurchaseModal } from '../components/Modals';
import { useToast } from '../context/ToastContext';

// Local helper modal to select a farmer before making a purchase
function SelectFarmerModal({ isOpen, onClose, farmers, onSelect }) {
  const [farmerId, setFarmerId] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-on-surface/10 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md border-2 border-[#000000] shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b-2 border-[#000000] bg-surface-variant">
          <h3 className="text-headline-md font-bold text-on-surface">Select Farmer</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block font-label-bold text-on-surface-variant mb-2">Choose Farmer</label>
            <div className="relative">
              <select 
                value={farmerId} 
                onChange={e => setFarmerId(e.target.value)}
                className="appearance-none w-full h-[48px] px-4 border border-outline bg-surface focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all rounded-none"
              >
                <option value="">-- Select Farmer --</option>
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.village})</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
            </div>
          </div>
          <button 
            disabled={!farmerId}
            onClick={() => onSelect(farmerId)}
            className="w-full h-[48px] bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity mt-6 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewFarmerOpen, setIsNewFarmerOpen] = useState(false);
  const [isSelectFarmerOpen, setIsSelectFarmerOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const toast = useToast();

  const loadData = () => {
    getFarmers().then(data => {
      setFarmers(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load farmers data');
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalFarmers = farmers.length;
  const totalReceivables = farmers.reduce((sum, farmer) => {
    return farmer.netBalance > 0 ? sum + farmer.netBalance : sum;
  }, 0);
  const totalPayables = farmers.reduce((sum, farmer) => {
    return farmer.netBalance < 0 ? sum + Math.abs(farmer.netBalance) : sum;
  }, 0);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val).replace('₹', '₹ ');

  const handleNewFarmerSubmit = (data) => {
    createFarmer(data).then(() => {
      toast.success('Farmer registered successfully!');
      setIsNewFarmerOpen(false);
      loadData();
    }).catch(err => {
      console.error(err);
      toast.error(err.message || 'Failed to register farmer');
    });
  };

  const handleSelectFarmer = (farmerId) => {
    setSelectedFarmerId(farmerId);
    setIsSelectFarmerOpen(false);
    setIsPurchaseOpen(true);
  };

  const handlePurchaseSubmit = (payload) => {
    logPurchase({ farmerId: selectedFarmerId, ...payload }).then(() => {
      toast.success('Crop purchase recorded successfully!');
      setIsPurchaseOpen(false);
      setSelectedFarmerId('');
      loadData();
    }).catch(err => {
      console.error(err);
      toast.error(err.message || 'Failed to record crop purchase');
    });
  };

  const selectedFarmer = farmers.find(f => f.id === selectedFarmerId);

  if (isLoading) {
    return <div className="p-16 text-center text-on-surface-variant">Loading Dashboard...</div>;
  }

  return (
    <div className="p-container-margin flex-1 space-y-section-gap max-w-[1400px] mx-auto w-full">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant pb-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Dashboard Overview</h2>
          <p className="font-body-lg text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">dashboard</span> At-a-glance metrics and quick actions
          </p>
        </div>
      </section>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="border-2 border-[#000000] bg-surface-container-lowest flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:-translate-y-1">
          <div className="bg-surface-variant p-4 border-b-2 border-[#000000] flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface">people</span>
            <span className="font-label-bold text-on-surface-variant uppercase tracking-wider">Total Farmers</span>
          </div>
          <div className="p-6 text-center">
            <div className="font-number-xl text-[32px] text-primary">{totalFarmers}</div>
          </div>
        </div>
        <div className="border-2 border-[#000000] bg-surface-container-lowest flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:-translate-y-1">
          <div className="bg-surface-variant p-4 border-b-2 border-[#000000] flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface">trending_up</span>
            <span className="font-label-bold text-on-surface-variant uppercase tracking-wider">Total Receivables</span>
          </div>
          <div className="p-6 text-center">
            <div className="font-number-xl text-[32px] text-primary-container">{formatCurrency(totalReceivables)}</div>
          </div>
        </div>
        <div className="border-2 border-[#000000] bg-surface-container-lowest flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:-translate-y-1">
          <div className="bg-surface-variant p-4 border-b-2 border-[#000000] flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface">trending_down</span>
            <span className="font-label-bold text-on-surface-variant uppercase tracking-wider">Total Payables</span>
          </div>
          <div className="p-6 text-center">
            <div className="font-number-xl text-[32px] text-error">{formatCurrency(totalPayables)}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <section>
        <h3 className="font-headline-lg text-headline-lg text-on-surface mb-6 border-b border-outline-variant pb-2">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
          <button 
            onClick={() => setIsNewFarmerOpen(true)}
            className="flex items-center justify-center gap-3 h-[56px] bg-primary-container text-on-primary font-label-bold border-2 border-[#000000] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all text-lg"
          >
            <span className="material-symbols-outlined text-[24px]">person_add</span>
            Quick Register Farmer
          </button>
          <button 
            onClick={() => setIsSelectFarmerOpen(true)}
            className="flex items-center justify-center gap-3 h-[56px] border-2 border-[#000000] text-[#000000] font-label-bold hover:bg-surface-variant hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all text-lg"
          >
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            New Crop Purchase
          </button>
        </div>
      </section>

      {/* Analytics Placeholder */}
      <div className="bg-surface-container-lowest border-2 border-[#000000] p-6 md:p-12 text-center text-on-surface-variant flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-[48px] text-primary-container mb-4">analytics</span>
        <p className="mb-6 font-body-lg text-on-surface">Advanced Dashboard Analytics coming soon.</p>
        <Link to="/farmers" className="inline-flex items-center gap-2 h-[48px] px-6 bg-primary-container text-on-primary font-label-bold hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined">person_book</span>
          Manage Farmers Directory
        </Link>
      </div>

      {/* Modals */}
      <NewFarmerModal 
        isOpen={isNewFarmerOpen}
        onClose={() => setIsNewFarmerOpen(false)}
        onSubmit={handleNewFarmerSubmit}
      />

      <SelectFarmerModal 
        isOpen={isSelectFarmerOpen}
        onClose={() => setIsSelectFarmerOpen(false)}
        farmers={farmers}
        onSelect={handleSelectFarmer}
      />

      <PurchaseModal 
        isOpen={isPurchaseOpen}
        onClose={() => {
          setIsPurchaseOpen(false);
          setSelectedFarmerId('');
        }}
        onSubmit={handlePurchaseSubmit}
        farmerName={selectedFarmer ? selectedFarmer.name : 'Selected Farmer'}
      />
    </div>
  );
}
