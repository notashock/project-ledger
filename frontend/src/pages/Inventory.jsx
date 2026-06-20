import React, { useState, useEffect } from 'react';
import { BulkPurchaseModal, GodownModal } from '../components/InventoryModals';
import GodownDetailsModal from '../components/GodownDetailsModal';
import { getInventorySummary, getInventoryTrace, logBulkPurchase, createGodown, getAllGodowns, updateGodown, deleteGodown } from '../services/api';
import { useToast } from '../context/ToastContext';
import EditGodownModal from '../components/EditGodownModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Inventory() {
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isGodownModalOpen, setIsGodownModalOpen] = useState(false);
  const [selectedGodownId, setSelectedGodownId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [inventorySummary, setInventorySummary] = useState([]);
  const [movements, setMovements] = useState([]);
  const [traceCropType, setTraceCropType] = useState('RICE');
  const [isLoading, setIsLoading] = useState(true);
  const [godownsList, setGodownsList] = useState([]);
  const [godownToEdit, setGodownToEdit] = useState(null);
  const [godownToDelete, setGodownToDelete] = useState(null);
  const toast = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const summaryData = await getInventorySummary();
      setInventorySummary(summaryData);

      const traceData = await getInventoryTrace(traceCropType);
      setMovements(traceData);

      const listData = await getAllGodowns();
      setGodownsList(listData || []);
    } catch (err) {
      console.error("Failed to fetch inventory data", err);
      toast.error('Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [traceCropType]);

  const handleBulkSubmit = async (data) => {
    try {
      await logBulkPurchase(data);
      toast.success('Bulk purchase logged successfully!');
      setIsBulkModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to submit bulk purchase", err);
      toast.error(err.message || 'Failed to log bulk purchase');
    }
  };

  const handleGodownSubmit = async (data) => {
    try {
      await createGodown(data);
      toast.success('Godown registered successfully!');
      setIsGodownModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to create godown", err);
      toast.error(err.message || 'Failed to register godown');
    }
  };

  const handleEditGodown = async (data) => {
    if (!godownToEdit) return;
    try {
      await updateGodown(godownToEdit.id, data);
      toast.success('Godown updated successfully!');
      setGodownToEdit(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update godown", err);
      toast.error(err.message || 'Failed to update godown profile');
    }
  };

  const handleDeleteGodown = async () => {
    if (!godownToDelete) return;
    try {
      await deleteGodown(godownToDelete.id);
      toast.success('Godown deleted successfully!');
      setGodownToDelete(null);
      fetchData();
    } catch (err) {
      console.error("Failed to delete godown", err);
      toast.error(err.message || 'Failed to delete godown. Verify it has no active inventory.');
    }
  };

  // Group summary by Godown
  const groupedByGodown = inventorySummary.reduce((acc, item) => {
    if (!acc[item.godownName]) {
      acc[item.godownName] = { RICE: 0, MAIZE: 0 };
    }
    const cropKey = String(item.cropType || '').toUpperCase();
    if (cropKey === 'RICE' || cropKey === 'MAIZE') {
      acc[item.godownName][cropKey] = item.totalQuantity;
    }
    return acc;
  }, {});

  const getSourceIcon = (sourceType) => {
    switch(sourceType) {
      case 'FARMER_PURCHASE': return 'agriculture';
      case 'BULK_BUY': return 'local_shipping';
      case 'EXPORT_SALE': return 'flight_takeoff';
      default: return 'swap_horiz';
    }
  };

  return (
    <div className="p-container-margin flex-1 space-y-section-gap max-w-[1400px] mx-auto w-full">
      {isLoading ? (
        <LoadingSpinner message="Loading inventory data..." />
      ) : (
        <>
          {/* Godowns Section */}
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-outline-variant pb-2">
              <h3 className="font-headline-lg text-headline-lg text-on-surface">Stock by Godown</h3>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setIsGodownModalOpen(true)}
                  className="flex-1 md:flex-none h-[40px] px-4 border-2 border-[#000000] text-[#000000] font-label-bold text-sm rounded hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">warehouse</span> Add Godown
                </button>
                <button 
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex-1 md:flex-none h-[40px] px-4 bg-primary-container text-on-primary font-label-bold text-sm rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer border-2 border-black"
                >
                  <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span> Bulk Purchase
                </button>
              </div>
            </div>
            {godownsList.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant p-8 text-center text-on-surface-variant font-medium rounded">
                No godowns found. Please add a godown to start tracking inventory.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {godownsList.map((godown) => {
                  const riceSummary = inventorySummary.find(item => item.godownId === godown.id && String(item.cropType || '').toUpperCase() === 'RICE');
                  const maizeSummary = inventorySummary.find(item => item.godownId === godown.id && String(item.cropType || '').toUpperCase() === 'MAIZE');
                  const riceQty = riceSummary ? riceSummary.totalQuantity : 0;
                  const maizeQty = maizeSummary ? maizeSummary.totalQuantity : 0;
                  return (
                  <div 
                    key={godown.id} 
                    className="border-2 border-[#000000] bg-surface-container-lowest flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer transform hover:-translate-y-1 rounded overflow-hidden"
                    onClick={() => {
                        setSelectedGodownId(godown.id);
                        setIsDetailsModalOpen(true);
                    }}
                  >
                    <div className="bg-surface-variant p-4 border-b-2 border-[#000000] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-surface">warehouse</span>
                        <h4 className="font-headline-md text-headline-md text-on-surface font-bold">{godown.name}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGodownToEdit(godown);
                          }}
                          className="p-1.5 border border-outline hover:border-black hover:bg-surface-variant text-on-surface rounded cursor-pointer transition-colors flex items-center justify-center bg-surface"
                          title="Edit Godown"
                          aria-label="Edit Godown"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGodownToDelete(godown);
                          }}
                          className="p-1.5 border border-outline hover:border-error hover:bg-[#F8D7DA] hover:text-[#842029] text-on-surface rounded cursor-pointer transition-colors flex items-center justify-center bg-surface"
                          title="Delete Godown"
                          aria-label="Delete Godown"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">grain</span>
                          <span className="font-label-bold text-on-surface-variant uppercase tracking-wider">Rice Stock</span>
                        </div>
                        <div className="text-right">
                          <div className="font-number-xl text-[24px] text-on-surface">{riceQty?.toFixed(2) || '0.00'}</div>
                          <div className="font-body-sm text-secondary">Kg</div>
                        </div>
                      </div>
                      <hr className="border-outline-variant" />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-tertiary">grass</span>
                          <span className="font-label-bold text-on-surface-variant uppercase tracking-wider">Maize Stock</span>
                        </div>
                        <div className="text-right">
                          <div className="font-number-xl text-[24px] text-on-surface">{maizeQty?.toFixed(2) || '0.00'}</div>
                          <div className="font-body-sm text-secondary">Kg</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </section>
 
          {/* Traceability / Stock Movement Table */}
          <section className="mt-section-gap">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="font-headline-lg text-headline-lg text-on-surface border-b border-outline-variant pb-2 flex-grow">Inventory Traceability</h3>
              <div className="flex border-2 border-[#000000] rounded overflow-hidden shrink-0">
                <button 
                  onClick={() => setTraceCropType('RICE')}
                  className={`px-6 py-2 font-label-bold ${traceCropType === 'RICE' ? 'bg-[#000000] text-surface' : 'bg-surface text-on-surface hover:bg-surface-variant'}`}
                >
                  Rice
                </button>
                <div className="w-[2px] bg-[#000000]"></div>
                <button 
                  onClick={() => setTraceCropType('MAIZE')}
                  className={`px-6 py-2 font-label-bold ${traceCropType === 'MAIZE' ? 'bg-[#000000] text-surface' : 'bg-surface text-on-surface hover:bg-surface-variant'}`}
                >
                  Maize
                </button>
              </div>
            </div>
            
            <div className="border border-outline-variant overflow-x-auto bg-surface-container-lowest rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#000000] bg-surface-variant">
                    <th className="font-label-bold text-label-bold text-on-surface uppercase px-6 py-4">Date</th>
                    <th className="font-label-bold text-label-bold text-on-surface uppercase px-6 py-4">Source</th>
                    <th className="font-label-bold text-label-bold text-on-surface uppercase px-6 py-4">Type</th>
                    <th className="font-label-bold text-label-bold text-on-surface uppercase px-6 py-4">Godown</th>
                    <th className="font-label-bold text-label-bold text-on-surface uppercase px-6 py-4 text-right">Quantity (Kg)</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No stock movements found for this crop.</td>
                    </tr>
                  ) : movements.map((m, idx) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={idx} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors min-h-[56px]">
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(m.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric'})}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-[20px]">{getSourceIcon(m.sourceType)}</span>
                            {m.sourceType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-[2px] text-[12px] font-label-bold ${isPositive ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                            {isPositive ? 'IN' : 'OUT'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">{m.godownName}</td>
                        <td className={`px-6 py-4 font-number-xl text-[20px] text-right ${isPositive ? 'text-primary' : 'text-error'}`}>
                          {isPositive ? '+' : ''}{m.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <BulkPurchaseModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} onSubmit={handleBulkSubmit} />
      <GodownModal isOpen={isGodownModalOpen} onClose={() => setIsGodownModalOpen(false)} onSubmit={handleGodownSubmit} />
      
      <EditGodownModal 
        isOpen={!!godownToEdit} 
        onClose={() => setGodownToEdit(null)} 
        onSubmit={handleEditGodown} 
        godown={godownToEdit} 
      />

      <ConfirmDeleteModal 
        isOpen={!!godownToDelete} 
        onClose={() => setGodownToDelete(null)} 
        onConfirm={handleDeleteGodown} 
        title="Delete Godown Profile" 
        message={`Are you sure you want to delete the godown "${godownToDelete?.name}"? All associated inventory logs, bulk purchases, and crop purchase transactions will be removed, and farmer balances will be recalculated. This action is blocked if there is active stock.`} 
      />
      <GodownDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} godownId={selectedGodownId} />
    </div>
  );
}
