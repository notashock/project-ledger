import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NewTradeModal from './NewTradeModal';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const location = useLocation();
  const path = location.pathname;
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const { logout } = useAuth();

  const handleBottomItemClick = (e, label) => {
    if (label === 'Logout') {
      e.preventDefault();
      logout();
    }
  };

  const sidebarNavItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/' },
    { icon: 'person_book', label: 'Farmers', path: '/farmers' },
    { icon: 'trending_up', label: 'Market Rates', path: '/market-rates' },
    { icon: 'inventory_2', label: 'Inventory', path: '/inventory' },
    { icon: 'assessment', label: 'Reports', path: '/reports' },
  ];

  const bottomNavItems = [
    { icon: 'help', label: 'Support', path: '/support' },
    { icon: 'logout', label: 'Logout', path: '/logout' },
  ];

  const isActive = (itemPath) => {
    if (itemPath === '/') return path === '/';
    if (itemPath === '/farmers') return path === '/farmers' || path.startsWith('/farmer/');
    return path === itemPath;
  };

  const getSectionTitle = () => {
    if (path === '/') return 'Dashboard';
    if (path === '/farmers') return 'Farmers Directory';
    if (path.startsWith('/farmer/')) return 'Farmer Profile';
    if (path === '/market-rates') return 'Market Rates';
    if (path === '/inventory') return 'Inventory';
    if (path === '/reports') return 'Reports';
    if (path === '/support') return 'Support';
    return 'TrustLedger';
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row antialiased selection:bg-primary selection:text-on-primary overflow-hidden">
      
      {/* Side Navigation (Desktop Only - Compact w-[72px]) */}
      <aside className="hidden md:flex flex-col h-screen w-[72px] fixed left-0 top-0 bg-surface border-r border-surface-variant z-40 shrink-0 justify-between items-center py-4">
        {/* Logo container */}
        <div className="w-full flex justify-center border-b border-surface-variant pb-4">
          <Link to="/" className="w-10 h-10 bg-primary text-on-primary font-bold flex items-center justify-center border-2 border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-lg active:scale-95 transition-transform rounded-none">
            TL
          </Link>
        </div>

        {/* Sidebar Nav Items */}
        <ul className="flex-1 flex flex-col gap-4 px-2 py-6 overflow-y-auto w-full items-center no-scrollbar">
          {sidebarNavItems.map((item, idx) => {
            const active = isActive(item.path);
            return (
              <li key={idx} className="w-full flex justify-center group relative">
                <Link
                  to={item.path}
                  className={`w-11 h-11 rounded flex items-center justify-center transition-all duration-200 active:scale-95 border-2 ${
                    active
                      ? 'bg-primary-container text-on-primary border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'text-on-surface-variant hover:bg-surface-container-high border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                </Link>
                {/* Tooltip on hover */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 bg-inverse-surface text-inverse-on-surface text-xs font-label-bold px-3 py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 border border-outline-variant shadow-md rounded">
                  {item.label}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Bottom items */}
        <div className="mt-auto py-4 border-t border-surface-variant w-full flex flex-col gap-4 items-center">
          {bottomNavItems.map((item, idx) => (
            <div key={idx} className="w-full flex justify-center group relative">
              <a
                className="w-11 h-11 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 active:scale-95 cursor-pointer border-2 border-transparent"
                onClick={(e) => handleBottomItemClick(e, item.label)}
                href="#"
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </a>
              <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 bg-inverse-surface text-inverse-on-surface text-xs font-label-bold px-3 py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 border border-outline-variant shadow-md rounded">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      {/* On desktop, padding-left must be md:pl-[72px] to avoid overlapping with fixed sidebar */}
      <div className="flex-1 flex flex-col md:pl-[72px] h-screen relative w-full overflow-hidden">
        
        {/* Unified Top Header */}
        <header className="w-full h-16 border-b border-surface-variant bg-surface z-30 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Header Title */}
            <div className="font-headline-md text-headline-md font-bold text-primary md:hidden">TrustLedger</div>
            {/* Desktop Header Title */}
            <div className="hidden md:flex flex-col">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">{getSectionTitle()}</h2>
              <span className="text-[11px] font-label-bold text-on-surface-variant uppercase tracking-wider">Agri-Trader Pro</span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {/* New Trade button (Desktop Only) */}
            <button 
              onClick={() => setIsNewTradeOpen(true)} 
              className="hidden md:flex bg-primary text-on-primary h-10 px-4 items-center justify-center gap-2 font-label-bold text-label-bold border-2 border-[#000000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-none"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              New Trade
            </button>

            <button className="h-touch-target-min w-touch-target-min flex items-center justify-center cursor-pointer active:opacity-80 hover:text-primary transition-colors duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="h-touch-target-min w-touch-target-min flex items-center justify-center cursor-pointer active:opacity-80 hover:text-primary transition-colors duration-200">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Main page content container */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-6 relative w-full">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-surface-variant z-30 px-container-margin pb-safe">
        <ul className="flex justify-between items-center h-16">
          {sidebarNavItems.map((item, idx) => (
            <li key={idx}>
              <Link to={item.path} className={`flex flex-col items-center justify-center h-full ${isActive(item.path) ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                <span className="material-symbols-outlined" style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                <span className="font-label-bold text-[10px] mt-1">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Floating Action Button for New Trade */}
      <button 
        onClick={() => setIsNewTradeOpen(true)} 
        className="md:hidden fixed right-6 bottom-20 bg-primary-container text-on-primary w-14 h-14 rounded-full border-2 border-[#000000] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center z-50 cursor-pointer active:scale-95 transition-transform"
        aria-label="New Trade"
      >
        <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>

      <NewTradeModal isOpen={isNewTradeOpen} onClose={() => setIsNewTradeOpen(false)} />
    </div>
  );
}
