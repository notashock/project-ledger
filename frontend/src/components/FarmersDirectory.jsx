import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFarmers, createFarmer } from '../services/api';
import { NewFarmerModal } from './Modals';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';

export default function FarmersDirectory() {
  const navigate = useNavigate();
  const [farmersList, setFarmersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isVillageDropdownOpen, setIsVillageDropdownOpen] = useState(false);
  const villageDropdownRef = useRef(null);
  const toast = useToast();
 
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (villageDropdownRef.current && !villageDropdownRef.current.contains(e.target)) {
        setIsVillageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = () => {
    setIsLoading(true);
    getFarmers()
      .then((data) => {
        setFarmersList(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load farmers');
        setIsLoading(false);
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
      {/* Header & Search Toolbar */}
      <div className="mb-4 pt-6 p-container-margin md:px-16 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-0">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full md:w-auto">
            {/* Search Bar */}
            <div className="w-full md:w-80 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
              <input 
                className="w-full h-touch-target-min pl-12 pr-4 bg-transparent border-2 border-[#000000] rounded text-on-surface font-body-md text-body-md focus:ring-0 transition-all placeholder:text-on-surface-variant" 
                placeholder="Search farmers..." 
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative" ref={villageDropdownRef}>
              <button
                type="button"
                onClick={() => setIsVillageDropdownOpen(!isVillageDropdownOpen)}
                className="flex items-center justify-between bg-surface border-2 border-[#000000] rounded h-touch-target-min px-4 font-body-md text-body-md text-on-surface cursor-pointer w-full sm:w-48 outline-none gap-2"
              >
                <span>{villageFilter || 'Filter by Village'}</span>
                <span className="material-symbols-outlined text-on-surface text-[20px] transition-transform duration-200" style={{ transform: isVillageDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>arrow_drop_down</span>
              </button>
              
              {isVillageDropdownOpen && (
                <div className="absolute left-0 mt-1 w-full bg-surface border-2 border-[#000000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-30 flex flex-col max-h-60 overflow-y-auto rounded divide-y divide-[#000000]">
                  <button
                    type="button"
                    onClick={() => {
                      setVillageFilter('');
                      setIsVillageDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-label-bold font-semibold hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer"
                  >
                    All Villages
                  </button>
                  {uniqueVillages.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setVillageFilter(v);
                        setIsVillageDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-label-bold font-semibold hover:bg-surface-container-low text-on-surface transition-colors cursor-pointer"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setModalOpen(true)}
            className="h-touch-target-min px-6 bg-primary-container text-on-primary font-label-bold text-label-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 border-2 border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded"
          >
            <span className="material-symbols-outlined">add</span>
            Register Farmer
          </button>
        </div>
      </div>

      {/* Farmers Directory Table/List */}
      <div className="px-container-margin md:px-16 w-full max-w-7xl mx-auto mb-16">
        {isLoading ? (
          <LoadingSpinner message="Loading farmers directory..." />
        ) : (
          <div className="bg-surface-container-lowest border-2 border-[#000000] rounded overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b-2 border-[#000000] bg-surface-variant font-label-bold text-label-bold text-on-surface uppercase tracking-wider">
              <div className="col-span-5">Farmer Name</div>
              <div className="col-span-4">Village / Region</div>
              <div className="col-span-3 text-right">Net Balance (₹)</div>
            </div>
            
            {/* Data Rows */}
            <div className="divide-y divide-outline-variant">
              {filteredFarmers.map((farmer) => {
                const isOwedToUs = farmer.netBalance < 0;
                const balanceClass = isOwedToUs ? 'text-primary-container' : (farmer.netBalance === 0 ? 'text-on-surface' : 'text-error');
                return (
                  <div 
                    key={farmer.id} 
                    onClick={() => navigate(`/farmer/${farmer.id}`)}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low transition-colors group cursor-pointer"
                  >
                    <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-variant border-2 border-[#000000] rounded flex items-center justify-center font-label-bold text-label-bold text-on-surface">
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
                        {farmer.netBalance === 0 ? '' : (isOwedToUs ? '+' : '-')}₹{Math.abs(farmer.netBalance).toLocaleString()}
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
        )}
      </div>
      
      <NewFarmerModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleRegister} />
    </>
  );
}
