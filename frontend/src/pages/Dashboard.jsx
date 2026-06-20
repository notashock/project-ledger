import React, { useEffect, useState } from 'react';
import { getFarmers, createFarmer, logPurchase, getRecentTransactions } from '../services/api';
import { Link } from 'react-router-dom';
import { NewFarmerModal, PurchaseModal } from '../components/Modals';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SelectFarmerModal from '../components/SelectFarmerModal';

export default function Dashboard() {
  const [farmers, setFarmers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewFarmerOpen, setIsNewFarmerOpen] = useState(false);
  const [isSelectFarmerOpen, setIsSelectFarmerOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const toast = useToast();

  const loadData = () => {
    Promise.all([getFarmers(), getRecentTransactions(5)]).then(([farmersData, transactionsData]) => {
      setFarmers(farmersData);
      setRecentTransactions(transactionsData);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load dashboard data');
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalFarmers = farmers.length;
  const totalReceivables = farmers.reduce((sum, farmer) => {
    return farmer.netBalance < 0 ? sum + Math.abs(farmer.netBalance) : sum;
  }, 0);
  const totalPayables = farmers.reduce((sum, farmer) => {
    return farmer.netBalance > 0 ? sum + farmer.netBalance : sum;
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
    return <LoadingSpinner message="Loading Dashboard..." />;
  }

  return (
    <div className="p-container-margin flex-1 space-y-section-gap max-w-[1400px] mx-auto w-full">

      {/* Combined Metrics & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Total Farmers Card */}
        <div className="border-2 border-[#000000] bg-surface-container-lowest flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded overflow-hidden">
          <div className="bg-surface-variant p-4 border-b-2 border-[#000000] flex items-center justify-between gap-2 h-[56px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface">people</span>
              <span className="font-label-bold text-on-surface-variant uppercase tracking-wider text-xs">Total Farmers</span>
            </div>
            <button 
              onClick={() => setIsNewFarmerOpen(true)}
              className="px-3 py-1 bg-primary text-on-primary font-label-bold text-xs border-2 border-[#000000] hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 rounded cursor-pointer"
              title="Quick Register Farmer"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">add</span> Register
            </button>
          </div>
          <div className="p-6 text-center flex-1 flex items-center justify-center">
            <div className="font-number-xl text-[36px] font-bold text-primary">{totalFarmers}</div>
          </div>
        </div>

        {/* Total Receivables (Inflow) Card */}
        <div className="border-2 border-[#000000] bg-surface-container-lowest flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded overflow-hidden">
          <div className="bg-surface-variant p-4 border-b-2 border-[#000000] flex items-center gap-2 h-[56px]">
            <span className="material-symbols-outlined text-on-surface">trending_up</span>
            <span className="font-label-bold text-on-surface-variant uppercase tracking-wider text-xs">Total Inflow</span>
          </div>
          <div className="p-6 text-center flex-1 flex items-center justify-center">
            <div className="font-number-xl text-[36px] font-bold text-primary-container">{formatCurrency(totalReceivables)}</div>
          </div>
        </div>

        {/* Total Payables (Outflow) & Purchase Card */}
        <div className="border-2 border-[#000000] bg-surface-container-lowest flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded overflow-hidden">
          <div className="bg-surface-variant p-4 border-b-2 border-[#000000] flex items-center justify-between gap-2 h-[56px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface">trending_down</span>
              <span className="font-label-bold text-on-surface-variant uppercase tracking-wider text-xs">Total Outflow</span>
            </div>
            <button 
              onClick={() => setIsSelectFarmerOpen(true)}
              className="px-3 py-1 bg-primary text-on-primary font-label-bold text-xs border-2 border-[#000000] hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 rounded cursor-pointer"
              title="New Crop Purchase"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">shopping_cart</span> Purchase
            </button>
          </div>
          <div className="p-6 text-center flex-1 flex items-center justify-center">
            <div className="font-number-xl text-[36px] font-bold text-error">{formatCurrency(totalPayables)}</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <section>
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-2">
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Recent Activity</h3>
          <Link to="/farmers" className="text-primary font-label-bold text-sm hover:underline flex items-center gap-1">
            View Directories <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="bg-surface-container-lowest border-2 border-[#000000] p-8 text-center text-on-surface-variant rounded">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2">history</span>
            <p className="font-body-md">No recent transactions recorded yet.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border-2 border-[#000000] divide-y divide-[#000000] rounded overflow-hidden">
            {recentTransactions.map((tx) => {
              const isPurchase = tx.type === 'PURCHASE';
              return (
                <div key={tx.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 border-2 border-[#000000] flex items-center justify-center shrink-0 rounded ${isPurchase ? 'bg-[#F8D7DA]' : 'bg-[#D1E7DD]'}`}>
                      <span className={`material-symbols-outlined text-[20px] ${isPurchase ? 'text-[#842029]' : 'text-[#0F5132]'}`}>
                        {isPurchase ? 'payments' : 'eco'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-bold text-xs text-on-surface-variant">
                          {new Date(tx.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                        <span className="text-xs text-on-surface-variant">•</span>
                        <span className="font-label-bold text-xs text-primary">
                          {tx.farmerName}
                        </span>
                      </div>
                      <h4 className="font-body-md font-bold text-on-surface mt-1">{isPurchase ? 'Crop Purchase' : 'Advance / Material'}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{tx.description}</p>
                    </div>
                  </div>
                  <div className={`font-headline-md text-[18px] font-bold ${isPurchase ? 'text-error' : 'text-primary-container'}`}>
                    {isPurchase ? '-' : '+'} ₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
        onFarmerRegistered={loadData}
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
