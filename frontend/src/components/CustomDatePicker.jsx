import React, { useState, useEffect, useRef } from 'react';

export default function CustomDatePicker({ value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Parse initial value or default to today
  const currentDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth()); // 0-indexed

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Helper to get number of days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper to get the day of the week the month starts on
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectDay = (day) => {
    // Format as YYYY-MM-DD in local time
    const yyyy = currentYear;
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return 'Select Date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Select Date';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Generate blank spaces for days of previous month
  const blanks = Array(firstDayIndex).fill(null);
  // Generate days array
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const isSelected = (day) => {
    if (!value) return false;
    const d = new Date(value);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[48px] px-4 bg-surface border-2 border-[#000000] text-on-surface font-semibold flex items-center justify-between transition-colors hover:bg-surface-container-high rounded cursor-pointer focus:outline-none"
      >
        <span>{formatDateLabel(value)}</span>
        <span className="material-symbols-outlined text-[20px] text-primary-container">
          calendar_month
        </span>
      </button>

      {isOpen && (
        <div className="relative mt-1 w-full max-w-[320px] bg-surface border-2 border-[#000000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-50 p-4 rounded flex flex-col gap-3">
          {/* Header */}
          <div className="flex justify-between items-center">
            <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center border-2 border-black hover:bg-surface-container-high rounded cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="font-label-bold font-bold text-sm">
              {months[currentMonth]} {currentYear}
            </span>
            <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center border-2 border-black hover:bg-surface-container-high rounded cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center font-label-bold text-xs text-on-surface-variant">
            {daysOfWeek.map((d, idx) => (
              <div key={idx} className="py-1 font-semibold">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {calendarCells.map((cell, idx) => {
              if (cell === null) {
                return <div key={idx} className="py-1.5" />;
              }
              const active = isSelected(cell);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDay(cell)}
                  className={`py-1.5 font-semibold rounded cursor-pointer transition-colors border ${
                    active 
                      ? 'bg-primary-container text-on-primary border-black' 
                      : 'border-transparent hover:bg-surface-container-high hover:border-black'
                  }`}
                >
                  {cell}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
