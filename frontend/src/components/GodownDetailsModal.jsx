import React, { useState, useEffect } from 'react';
import { getGodownDetails } from '../services/api';

export default function GodownDetailsModal({ isOpen, onClose, godownId }) {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && godownId) {
      setIsLoading(true);
      getGodownDetails(godownId)
        .then(data => {
          setDetails(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setDetails(null);
    }
  }, [isOpen, godownId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/20 backdrop-blur-sm p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-5xl bg-surface border-2 border-[#000000] relative flex flex-col shadow-none min-h-[60vh] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#000000] bg-surface-variant sticky top-0 z-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">warehouse</span>
              {details?.godown?.name || 'Godown Details'}
            </h2>
            <p className="font-body-md text-on-surface-variant mt-1">
              {details?.godown?.location}
            </p>
          </div>
          <button type="button" onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-surface-container-high transition-colors border-2 border-[#000000] bg-surface text-[#000000]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-8 bg-surface">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant font-body-lg">
              Loading details...
            </div>
          ) : details ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RICE Card */}
                <div className="border-2 border-[#000000] bg-surface-container-lowest p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
                    <span className="material-symbols-outlined text-primary text-[28px]">grain</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Rice Summary</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Est. Bags</div>
                      <div className="font-number-lg text-[24px] text-on-surface">{details.cropStocks['RICE']?.approxBags?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <div className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Quantity</div>
                      <div className="font-number-lg text-[24px] text-on-surface">{details.cropStocks['RICE']?.totalWeight?.toFixed(2) || '0.00'} <span className="text-[14px]">Kg</span></div>
                    </div>
                    <div>
                      <div className="font-label-md text-on-surface-variant uppercase tracking-wider">Invested Amount</div>
                      <div className="font-number-lg text-[24px] text-on-surface">₹{details.cropStocks['RICE']?.investedValue?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <div className="font-label-md text-primary uppercase tracking-wider">Estimated Value</div>
                      <div className="font-number-lg text-[24px] text-primary">₹{details.cropStocks['RICE']?.estimatedValue?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                </div>

                {/* MAIZE Card */}
                <div className="border-2 border-[#000000] bg-surface-container-lowest p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
                    <span className="material-symbols-outlined text-tertiary text-[28px]">grass</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Maize Summary</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Est. Bags</div>
                      <div className="font-number-lg text-[24px] text-on-surface">{details.cropStocks['MAIZE']?.approxBags?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <div className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Quantity</div>
                      <div className="font-number-lg text-[24px] text-on-surface">{details.cropStocks['MAIZE']?.totalWeight?.toFixed(2) || '0.00'} <span className="text-[14px]">Kg</span></div>
                    </div>
                    <div>
                      <div className="font-label-md text-on-surface-variant uppercase tracking-wider">Invested Amount</div>
                      <div className="font-number-lg text-[24px] text-on-surface">₹{details.cropStocks['MAIZE']?.investedValue?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <div className="font-label-md text-tertiary uppercase tracking-wider">Estimated Value</div>
                      <div className="font-number-lg text-[24px] text-tertiary">₹{details.cropStocks['MAIZE']?.estimatedValue?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grand Total Row */}
              <div className="flex flex-col md:flex-row justify-between items-center p-6 border-2 border-[#000000] bg-surface-variant gap-4">
                 <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[32px] text-on-surface">account_balance_wallet</span>
                    <div>
                        <div className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Portfolio Invested</div>
                        <div className="font-number-xl text-[32px] text-on-surface">₹{details.totalInvestedValue?.toFixed(2) || '0.00'}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 text-right">
                    <div>
                        <div className="font-label-md text-primary uppercase tracking-wider">Total Estimated Portfolio Value</div>
                        <div className="font-number-xl text-[32px] text-primary">₹{details.totalEstimatedValue?.toFixed(2) || '0.00'}</div>
                    </div>
                    <span className="material-symbols-outlined text-[32px] text-primary">trending_up</span>
                 </div>
              </div>

              {/* Purchases Table */}
              <div className="flex flex-col gap-4">
                <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-2">Purchase History</h3>
                <div className="border-2 border-[#000000] overflow-x-auto bg-surface-container-lowest">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#000000] bg-surface-variant">
                        <th className="font-label-bold text-label-bold text-on-surface uppercase px-4 py-3">Date</th>
                        <th className="font-label-bold text-label-bold text-on-surface uppercase px-4 py-3">Source</th>
                        <th className="font-label-bold text-label-bold text-on-surface uppercase px-4 py-3">Supplier/Farmer</th>
                        <th className="font-label-bold text-label-bold text-on-surface uppercase px-4 py-3">Crop</th>
                        <th className="font-label-bold text-label-bold text-on-surface uppercase px-4 py-3 text-right">Weight (Kg)</th>
                        <th className="font-label-bold text-label-bold text-on-surface uppercase px-4 py-3 text-right">Bags</th>
                        <th className="font-label-bold text-label-bold text-on-surface uppercase px-4 py-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md text-on-surface">
                      {(!details.purchases || details.purchases.length === 0) ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-on-surface-variant">No purchases found in this godown.</td>
                        </tr>
                      ) : details.purchases.map((p, idx) => (
                        <tr key={idx} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(p.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric'})}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-[2px] text-[12px] font-label-bold ${p.sourceType === 'BULK' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container'}`}>
                              {p.sourceType}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold">{p.supplierName}</td>
                          <td className="px-4 py-3">{p.cropType}</td>
                          <td className="px-4 py-3 text-right font-number-md">{p.weight?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-number-md">{p.noOfBags?.toFixed(2) || '-'}</td>
                          <td className="px-4 py-3 text-right font-number-md font-semibold">₹{p.amountSpent?.toFixed(2) || '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-error font-body-lg">
              Failed to load godown details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
