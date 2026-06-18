import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFarmerHistory, logPurchase, logDebit } from '../services/api';
import { PurchaseModal, DebitModal } from './Modals';

export default function FarmerKhata() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isPurchaseOpen, setPurchaseOpen] = useState(false);
  const [isDebitOpen, setDebitOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      getFarmerHistory(id, searchQuery).then(setData).catch(console.error);
    }, 300);
    return () => clearTimeout(handler);
  }, [id, searchQuery]);

  const loadData = () => {
    getFarmerHistory(id, searchQuery).then(setData).catch(console.error);
  };

  const handlePurchase = (payload) => {
    logPurchase({ farmerId: id, ...payload }).then(() => {
      setPurchaseOpen(false);
      loadData();
    });
  };

  const handleDebit = (payload) => {
    logDebit({ farmerId: id, ...payload }).then(() => {
      setDebitOpen(false);
      loadData();
    });
  };

  if (!data) return <div className="p-16 text-center text-on-surface-variant">Loading Ledger...</div>;

  const isPositive = data.netBalance >= 0;

  return (
    <div className="p-container-margin md:p-16 max-w-5xl mx-auto w-full">
      {/* Breadcrumbs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-2 text-on-surface-variant text-sm font-label-bold text-label-bold">
          <Link to="/" className="material-symbols-outlined text-base cursor-pointer hover:text-on-surface">
            arrow_back
          </Link>
          <Link className="hover:text-on-surface transition-colors" to="/">
            Ledgers
          </Link>
          <span>/</span>
          <span className="text-on-surface">{data.farmerName}</span>
        </div>
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full h-touch-target-min pl-12 pr-4 bg-surface border-2 border-[#000000] focus:ring-0 transition-colors font-body-md text-body-md text-on-surface placeholder-on-surface-variant"
            placeholder="Search transactions..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Farmer Header & Balance Card */}
      <div className="bg-surface-container-lowest border-2 border-[#000000] mb-section-gap">
        <div className="flex flex-col md:flex-row justify-between gap-8 p-8 border-b border-outline-variant">
          <div>
            <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg-mobile md:font-display-lg text-on-surface mb-2">
              {data.farmerName}
            </h2>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-lg text-body-lg">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              Village: Ledger Account
            </div>
          </div>
          <div className="text-right">
            <p className="text-on-surface-variant font-label-bold text-label-bold uppercase tracking-wider mb-2">
              Net Balance
            </p>
            <div className={`text-number-xl font-number-xl ${isPositive ? 'text-primary-container' : 'text-error'}`}>
              {isPositive ? '' : '-'}₹ {Math.abs(data.netBalance).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 p-8 bg-surface-variant border-t-2 border-[#000000]">
          <button onClick={() => setPurchaseOpen(true)} className="flex-1 bg-primary-container text-on-primary font-label-bold text-label-bold h-touch-target-min flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined">add_circle</span>
            Add Crop Purchase
          </button>
          <button onClick={() => setDebitOpen(true)} className="flex-1 bg-on-surface text-on-primary font-label-bold text-label-bold h-touch-target-min flex items-center justify-center gap-2 hover:bg-inverse-surface transition-colors">
            <span className="material-symbols-outlined">payments</span>
            Record Advance
          </button>
        </div>
      </div>

      {/* Ledger Timeline */}
      <div>
        <h3 className="text-headline-md font-headline-md text-on-surface mb-8 border-b border-outline-variant pb-4">
          Transaction History
        </h3>
        <div className="flex flex-col gap-4">
          {data.transactions.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">No transactions found matching your search.</div>
          ) : data.transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-surface-container-lowest border-2 border-[#000000] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-surface-variant border-2 border-[#000000] flex items-center justify-center shrink-0">
                  <span
                    className={`material-symbols-outlined ${tx.type === 'PURCHASE' ? 'text-primary-container' : 'text-error'}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {tx.type === 'PURCHASE' ? 'eco' : 'money_off'}
                  </span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface-variant mb-1">
                    {new Date(tx.date).toLocaleDateString('en-IN', { dateStyle: 'medium'})}
                  </p>
                  <h4
                    className={`font-body-lg text-body-lg text-on-surface font-semibold transition-colors ${tx.type === 'PURCHASE' ? 'group-hover:text-primary-container' : 'group-hover:text-error'}`}
                  >
                    {tx.type === 'PURCHASE' ? 'Crop Purchase' : 'Advance/Material'}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">{tx.description}</p>
                </div>
              </div>
              <div className="text-right w-full md:w-auto flex justify-between md:block items-center">
                <span className="md:hidden font-label-bold text-label-bold text-on-surface-variant">
                  Amount:
                </span>
                <div className={`font-headline-md text-headline-md font-bold ${tx.type === 'PURCHASE' ? 'text-primary-container' : 'text-error'}`}>
                  {tx.sign} ₹ {tx.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PurchaseModal isOpen={isPurchaseOpen} onClose={() => setPurchaseOpen(false)} onSubmit={handlePurchase} />
      <DebitModal isOpen={isDebitOpen} onClose={() => setDebitOpen(false)} onSubmit={handleDebit} />
    </div>
  );
}
