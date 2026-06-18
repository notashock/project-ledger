import React, { useState, useEffect } from 'react';
import { getMarketRates, updateMarketRates, getRatesHistory } from '../services/api';

export default function MarketRates() {
  const [rates, setRates] = useState({
    rice: { buyRate: '', bagWeight: '101' },
    maize: { buyRate: '', bagWeight: '101' }
  });
  const [initialRates, setInitialRates] = useState({ rice: '', maize: '' });
  const [history, setHistory] = useState({ rice: [], maize: [] });
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    getMarketRates().then((data) => {
      const riceVal = data.rice?.buyRate?.toString() || '';
      const maizeVal = data.maize?.buyRate?.toString() || '';
      setRates({
        rice: { buyRate: riceVal, bagWeight: data.rice?.bagWeight?.toString() || '101' },
        maize: { buyRate: maizeVal, bagWeight: data.maize?.bagWeight?.toString() || '101' }
      });
      setInitialRates({
        rice: riceVal,
        maize: maizeVal
      });
    }).catch(console.error);

    getRatesHistory().then((data) => {
      setHistory(data || { rice: [], maize: [] });
    }).catch(console.error);
  }, []);

  const handleRateChange = (commodity, field, value) => {
    setRates(prev => ({
      ...prev,
      [commodity]: {
        ...prev[commodity],
        [field]: value
      }
    }));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await updateMarketRates({
        rice: { buyRate: parseFloat(rates.rice.buyRate) || 0, bagWeight: parseFloat(rates.rice.bagWeight) || 101 },
        maize: { buyRate: parseFloat(rates.maize.buyRate) || 0, bagWeight: parseFloat(rates.maize.bagWeight) || 101 }
      });
      alert('Rates published successfully!');
      setInitialRates({
        rice: rates.rice.buyRate,
        maize: rates.maize.buyRate
      });
      const histData = await getRatesHistory();
      setHistory(histData || { rice: [], maize: [] });
    } catch (err) {
      console.error(err);
      alert('Failed to publish rates');
    } finally {
      setIsPublishing(false);
    }
  };

  // Generate 7-day historical prices based on the daily rates from the database
  const cropHistory = history[selectedCrop] || [];
  const currentPrice = parseFloat(rates[selectedCrop]?.buyRate || (selectedCrop === 'rice' ? 2450 : 1850));

  // Generate the last 7 calendar dates up to today
  const todayDate = new Date();
  const calendarDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(todayDate.getDate() - (6 - i));
    calendarDates.push(d.toISOString().split('T')[0]);
  }

  // Format a date string to Mon, Tue, etc. or "Today"
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) return 'Today';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch (e) {
      return dateStr;
    }
  };

  // Build graphData representing the last 7 calendar days
  let graphData = [];
  if (cropHistory.length > 0) {
    const initialPriceStr = initialRates[selectedCrop];
    const currentPriceStr = rates[selectedCrop]?.buyRate;
    const isTodayModified = currentPriceStr !== initialPriceStr;

    calendarDates.forEach((dateStr) => {
      const dbEntry = cropHistory.find(item => item.date === dateStr);
      if (dateStr === calendarDates[6]) {
        // Today
        if (isTodayModified) {
          graphData.push({
            date: dateStr,
            buyRate: parseFloat(currentPriceStr) || 0,
            isProjected: false
          });
        } else if (dbEntry) {
          graphData.push({
            date: dateStr,
            buyRate: parseFloat(dbEntry.buyRate),
            isProjected: false
          });
        } else {
          const prevVal = graphData.length > 0 ? graphData[graphData.length - 1].buyRate : 0;
          graphData.push({
            date: dateStr,
            buyRate: prevVal,
            isProjected: true
          });
        }
      } else {
        // Past dates
        if (dbEntry) {
          graphData.push({
            date: dateStr,
            buyRate: parseFloat(dbEntry.buyRate),
            isProjected: false
          });
        } else {
          // Find the most recent entry before this date
          const priorEntries = cropHistory.filter(item => item.date < dateStr);
          if (priorEntries.length > 0) {
            const latestPrior = priorEntries[priorEntries.length - 1];
            graphData.push({
              date: dateStr,
              buyRate: parseFloat(latestPrior.buyRate),
              isProjected: true
            });
          } else {
            // Use the earliest entry in cropHistory as a fallback
            const earliest = cropHistory[0];
            graphData.push({
              date: dateStr,
              buyRate: parseFloat(earliest.buyRate),
              isProjected: true
            });
          }
        }
      }
    });
  }

  // Calculate chart points and paths
  const chartWidth = 430;
  const chartHeight = 180;
  const paddingLeft = 50;
  const paddingTop = 20;

  const dataPoints = graphData.map(item => item.buyRate);
  const minVal = dataPoints.length > 0 ? Math.min(...dataPoints) * 0.995 : 0;
  const maxVal = dataPoints.length > 0 ? Math.max(...dataPoints) * 1.005 : 100;
  const range = maxVal - minVal;

  const points = graphData.map((item, idx) => {
    const val = item.buyRate;
    const x = paddingLeft + (idx * chartWidth) / (graphData.length - 1 || 1);
    const y = paddingTop + chartHeight - ((val - minVal) * chartHeight) / (range || 1);
    return { x, y, val, day: formatDateLabel(item.date), isProjected: item.isProjected };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z` : '';

  // Draw individual segments so some can be dashed (projected) and others solid
  const segments = [];
  for (let i = 1; i < points.length; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    segments.push({
      x1: pPrev.x,
      y1: pPrev.y,
      x2: pCurr.x,
      y2: pCurr.y,
      isProjected: pCurr.isProjected
    });
  }

  // Dynamic gridlines
  const gridLines = [];
  if (graphData.length > 0) {
    for (let i = 0; i <= 4; i++) {
      const yVal = minVal + (i * range) / 4;
      const yPos = paddingTop + chartHeight - (i * chartHeight) / 4;
      gridLines.push({ yVal, yPos });
    }
  }

  return (
    <div className="p-container-margin h-full flex flex-col xl:flex-row gap-section-gap w-full max-w-[1400px] mx-auto">
      {/* Left Pane: Update Rates Form */}
      <section className="flex-1 min-w-[320px] xl:max-w-[500px]">
        <header className="mb-8 border-b-2 border-[#000000] pb-4">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Daily Rates</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Update today's market rates for key commodities.</p>
        </header>
        <form className="space-y-6 bg-surface-container-lowest p-6 border-2 border-[#000000]" onSubmit={(e) => e.preventDefault()}>
          {/* Search/Date Area */}
          <div className="relative mb-8">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full h-[64px] pl-12 pr-4 bg-transparent border-2 border-outline-variant focus:border-[#000000] focus:ring-0 font-body-lg text-body-lg text-on-surface transition-colors" placeholder="Search commodity..." type="text"/>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {/* Rice */}
            <div className="flex flex-col gap-2 border-2 border-[#000000] p-4 bg-surface">
              <span className="font-label-bold text-label-bold text-on-surface">Rice (Basmati 1121)</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Rate / Bag (₹)</label>
                  <input 
                    className="h-10 px-3 bg-transparent border border-outline text-on-surface text-sm focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" 
                    type="number" 
                    value={rates.rice.buyRate}
                    onChange={(e) => handleRateChange('rice', 'buyRate', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Bag Weight (Kg)</label>
                  <input 
                    className="h-10 px-3 bg-transparent border border-outline text-on-surface text-sm focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" 
                    type="number" 
                    value={rates.rice.bagWeight}
                    onChange={(e) => handleRateChange('rice', 'bagWeight', e.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* Maize */}
            <div className="flex flex-col gap-2 border-2 border-[#000000] p-4 bg-surface">
              <span className="font-label-bold text-label-bold text-on-surface">Maize (Corn)</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Rate / Bag (₹)</label>
                  <input 
                    className="h-10 px-3 bg-transparent border border-outline text-on-surface text-sm focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" 
                    type="number" 
                    value={rates.maize.buyRate}
                    onChange={(e) => handleRateChange('maize', 'buyRate', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Bag Weight (Kg)</label>
                  <input 
                    className="h-10 px-3 bg-transparent border border-outline text-on-surface text-sm focus:border-[#000000] focus:border-2 focus:ring-0 outline-none transition-all" 
                    type="number" 
                    value={rates.maize.bagWeight}
                    onChange={(e) => handleRateChange('maize', 'bagWeight', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t-2 border-[#000000] flex gap-4">
            <button 
              className="flex-1 h-touch-target-min bg-primary-container text-on-primary font-label-bold text-label-bold hover:opacity-90 transition-opacity disabled:opacity-50" 
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Rates'}
            </button>
            <button className="flex-1 h-touch-target-min bg-transparent border-2 border-[#000000] text-on-surface font-label-bold text-label-bold hover:bg-surface-container-high transition-colors" type="button">
              Discard
            </button>
          </div>
        </form>
      </section>

      {/* Right Pane: Market Prices Chart */}
      <section className="flex-1 min-w-[320px]">
        <header className="mb-8 border-b-2 border-[#000000] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Market Price Trends</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Historical price charts for supported commodities.</p>
          </div>
          {/* Crop Selector Tabs */}
          <div className="flex border-2 border-[#000000] overflow-hidden shrink-0">
            <button 
              type="button" 
              onClick={() => { setSelectedCrop('rice'); setHoveredIndex(null); }}
              className={`px-4 py-2 font-label-bold text-label-bold transition-colors ${selectedCrop === 'rice' ? 'bg-[#000000] text-surface' : 'bg-surface text-on-surface hover:bg-surface-variant'}`}
            >
              Rice
            </button>
            <div className="w-[2px] bg-[#000000]"></div>
            <button 
              type="button" 
              onClick={() => { setSelectedCrop('maize'); setHoveredIndex(null); }}
              className={`px-4 py-2 font-label-bold text-label-bold transition-colors ${selectedCrop === 'maize' ? 'bg-[#000000] text-surface' : 'bg-surface text-on-surface hover:bg-surface-variant'}`}
            >
              Maize (Corn)
            </button>
          </div>
        </header>

        {/* SVG Chart Container */}
        <div className="bg-surface-container-lowest border-2 border-[#000000] p-6 flex flex-col justify-between min-h-[350px] relative">
          {graphData.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-12">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/70 mb-4 select-none">show_chart</span>
              <p className="font-body-lg text-body-lg text-on-surface-variant text-center max-w-[280px]">
                Please add rates daily to see the graph.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Current Market Price</span>
                  <div className="text-display-md text-on-surface font-bold mt-1">
                    ₹ {currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / Bag
                  </div>
                </div>
                <span className={`px-2 py-1 font-label-bold text-label-bold ${selectedCrop === 'rice' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                  {selectedCrop === 'rice' ? 'Rice (Basmati 1121)' : 'Maize (Corn)'}
                </span>
              </div>

              <div className="relative w-full h-[250px] mt-4">
                <svg viewBox="0 0 500 250" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chart-grad-rice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="chart-grad-maize" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {gridLines.map((line, idx) => (
                    <g key={idx}>
                      <line 
                        x1={paddingLeft} 
                        y1={line.yPos} 
                        x2={paddingLeft + chartWidth} 
                        y2={line.yPos} 
                        stroke="var(--md-sys-color-outline-variant, #e0e0e0)" 
                        strokeWidth="1" 
                        strokeDasharray="4 4"
                      />
                      <text 
                        x={paddingLeft - 10} 
                        y={line.yPos + 4} 
                        textAnchor="end" 
                        className="text-[10px] fill-on-surface-variant font-semibold"
                      >
                        ₹{Math.round(line.yVal)}
                      </text>
                    </g>
                  ))}

                  {/* Area Under Path */}
                  <path 
                    d={areaPath} 
                    fill={selectedCrop === 'rice' ? 'url(#chart-grad-rice)' : 'url(#chart-grad-maize)'} 
                  />

                  {/* Main Line Segments */}
                  {segments.map((seg, idx) => (
                    <line 
                      key={idx} 
                      x1={seg.x1} 
                      y1={seg.y1} 
                      x2={seg.x2} 
                      y2={seg.y2} 
                      stroke={selectedCrop === 'rice' ? '#10b981' : '#f59e0b'} 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      strokeDasharray={seg.isProjected ? "4 4" : "none"}
                    />
                  ))}

                  {/* Data points (circles) */}
                  {points.map((p, idx) => (
                    <circle 
                      key={idx} 
                      cx={p.x} 
                      cy={p.y} 
                      r={hoveredIndex === idx ? "6" : "4"} 
                      fill={selectedCrop === 'rice' ? '#10b981' : '#f59e0b'} 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                      className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  ))}

                  {/* X-Axis labels */}
                  {points.map((p, idx) => (
                    <text 
                      key={idx} 
                      x={p.x} 
                      y={paddingTop + chartHeight + 20} 
                      textAnchor="middle" 
                      className="text-[11px] fill-on-surface-variant font-label-bold text-label-bold"
                    >
                      {p.day}
                    </text>
                  ))}

                  {/* Hover tooltip guide line */}
                  {hoveredIndex !== null && points[hoveredIndex] && (
                    <line 
                      x1={points[hoveredIndex].x} 
                      y1={paddingTop} 
                      x2={points[hoveredIndex].x} 
                      y2={paddingTop + chartHeight} 
                      stroke="var(--md-sys-color-on-surface-variant, #888888)" 
                      strokeWidth="1" 
                      strokeDasharray="2 2" 
                      pointerEvents="none"
                    />
                  )}
                </svg>

                {/* Dynamic HTML Tooltip */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                  <div 
                    className="absolute bg-on-surface text-surface text-xs font-semibold px-2 py-1 shadow-lg pointer-events-none transition-all duration-100"
                    style={{ 
                      left: `${(points[hoveredIndex].x / 500) * 100}%`, 
                      top: `${(points[hoveredIndex].y / 250) * 100 - 15}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    ₹{points[hoveredIndex].val.toFixed(2)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Informative description panel */}
        <div className="mt-8 bg-surface-container border-2 border-[#000000] p-6">
          <h4 className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider mb-2">Market Insights</h4>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Price trends display a 7-day moving window calculated dynamically from local market entries. Update daily rates in the left panel to update today's index value.
          </p>
        </div>
      </section>
    </div>
  );
}
