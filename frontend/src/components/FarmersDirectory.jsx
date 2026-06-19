import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFarmers, createFarmer } from '../services/api';
import { NewFarmerModal } from './Modals';
import { useToast } from '../context/ToastContext';

export default function FarmersDirectory() {
  const navigate = useNavigate();
  const [farmersList, setFarmersList] = useState([]);
  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = () => {
    getFarmers().then(setFarmersList).catch(err => {
      console.error(err);
      toast.error('Failed to load farmers');
    });
  };

  const handleRegister = (payload) => {
    createFarmer(payload).then(() => {
      toast.success('Farmer registered successfully!');
      setModalOpen(false);
      loadFarmers();
    }).catch(err => {
      console.error(err);
      toast.error(err.message || 'Failed to register farmer');
    });
  };

  const filteredFarmers = farmersList.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(search.toLowerCase()) || 
                          (farmer.phone && farmer.phone.includes(search));
    const matchesVillage = villageFilter ? farmer.village === villageFilter : true;
    return matchesSearch && matchesVillage;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Get unique villages for the filter dropdown
  const uniqueVillages = [...new Set(farmersList.map(f => f.village).filter(Boolean))];

  return (
    <>
      {/* Header & Search */}
      <div className="mb-section-gap pt-6 md:pt-10 p-container-margin md:px-16 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Farmers Directory</h2>
            <p className="font-body-lg text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person_book</span> Manage registered producers and track net balances.
            </p>
          </div>
          {/* Search Bar */}
          <div className="w-full md:w-96 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
            <input 
              className="w-full h-[56px] pl-12 pr-4 bg-transparent border-2 border-[#000000] text-on-surface font-body-md text-body-md focus:ring-0 transition-all placeholder:text-on-surface-variant" 
              placeholder="Search farmers by name or phone..." 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        {/* Toolbar: Filters & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b-2 border-[#000000]">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative">
              <select 
                className="appearance-none bg-surface border-2 border-[#000000] h-touch-target-min pl-4 pr-10 font-label-bold text-label-bold text-on-surface focus:ring-0 cursor-pointer"
                value={villageFilter}
                onChange={e => setVillageFilter(e.target.value)}
              >
                <option value="">Filter by Village</option>
                {uniqueVillages.map((v, i) => <option key={i} value={v}>{v}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">arrow_drop_down</span>
            </div>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="h-touch-target-min px-6 bg-primary-container text-on-primary font-label-bold text-label-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Register Farmer
          </button>
        </div>
      </div>

      {/* Farmers Directory Table/List */}
      <div className="px-container-margin md:px-16 w-full max-w-7xl mx-auto mb-16">
        <div className="bg-surface-container-lowest border-2 border-[#000000] overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b-2 border-[#000000] bg-surface-variant font-label-bold text-label-bold text-on-surface uppercase tracking-wider">
            <div className="col-span-5">Farmer Name</div>
            <div className="col-span-4">Village / Region</div>
            <div className="col-span-3 text-right">Net Balance (₹)</div>
          </div>
          
          {/* Data Rows */}
          <div className="divide-y divide-outline-variant">
            {filteredFarmers.map((farmer) => {
              const isPositive = farmer.netBalance >= 0;
              const balanceClass = isPositive ? 'text-primary-container' : 'text-error';
              return (
                <div 
                  key={farmer.id} 
                  onClick={() => navigate(`/farmer/${farmer.id}`)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low transition-colors group cursor-pointer"
                >
                  <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-variant border-2 border-[#000000] flex items-center justify-center font-label-bold text-label-bold text-on-surface">
                      {getInitials(farmer.name)}
                    </div>
                    <div>
                      <div className="font-body-lg text-body-lg font-bold text-on-surface group-hover:text-primary transition-colors">{farmer.name}</div>
                      <div className="font-body-md text-body-md text-on-surface-variant md:hidden">{farmer.village}</div>
                    </div>
                  </div>
                  <div className="hidden md:block col-span-4 font-body-md text-body-md text-on-surface">
                    {farmer.village}
                  </div>
                  <div className="col-span-1 md:col-span-3 text-left md:text-right">
                    <div className={`font-number-xl text-number-xl ${balanceClass}`}>
                      {isPositive ? '' : '-'}₹{Math.abs(farmer.netBalance).toLocaleString()}
                    </div>
                    <div className="font-label-bold text-label-bold text-on-surface-variant md:hidden">Net Balance</div>
                  </div>
                </div>
              );
            })}
            {filteredFarmers.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant">No farmers found.</div>
            )}
          </div>
          
          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t-2 border-[#000000] flex items-center justify-between bg-surface-variant">
            <span className="font-body-md text-body-md text-on-surface-variant">Showing {filteredFarmers.length} Farmers</span>
            <div className="flex gap-2">
              <button className="h-touch-target-min px-4 border-2 border-[#000000] font-label-bold text-label-bold text-on-surface disabled:opacity-50 disabled:cursor-not-allowed" disabled>Prev</button>
              <button className="h-touch-target-min px-4 border-2 border-[#000000] font-label-bold text-label-bold text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
      
      <NewFarmerModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleRegister} />
    </>
  );
}
