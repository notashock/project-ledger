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

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row antialiased selection:bg-primary selection:text-on-primary">
      {/* Top Navigation (Mobile Only) */}
      <header className="md:hidden w-full h-16 border-b border-surface-variant flex justify-between items-center px-container-margin bg-surface z-50 sticky top-0 shrink-0">
        <div className="font-headline-md text-headline-md font-bold text-primary">TrustLedger</div>
        <div className="flex gap-4 items-center">
          <button className="h-touch-target-min w-touch-target-min flex items-center justify-center cursor-pointer active:opacity-80 hover:text-primary transition-colors duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="h-touch-target-min w-touch-target-min flex items-center justify-center cursor-pointer active:opacity-80 hover:text-primary transition-colors duration-200">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Side Navigation (Desktop Only) */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 py-base gap-2 bg-surface border-r border-surface-variant z-40 shrink-0">
        <div className="px-gutter py-base mb-4">
           <h1 className="text-headline-lg font-headline-lg font-bold text-primary tracking-tight">TrustLedger</h1>
           <p className="font-label-bold text-label-bold text-on-surface-variant mt-1">Agri-Trader Pro</p>
        </div>
        <div className="px-base">
          <button onClick={() => setIsNewTradeOpen(true)} className="w-full bg-primary-container text-on-primary h-touch-target-min rounded flex items-center justify-center gap-2 font-label-bold text-label-bold mb-6 hover:bg-primary transition-colors">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            New Trade
          </button>
        </div>
        <ul className="flex-1 flex flex-col gap-1 px-base overflow-y-auto">
          {sidebarNavItems.map((item, idx) => (
            <li key={idx}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 h-touch-target-min rounded font-label-bold text-label-bold transition-all duration-200 active:scale-95 ${
                  isActive(item.path)
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined" style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto px-base pb-4 flex flex-col gap-1 border-t border-surface-variant pt-4 mx-base">
          {bottomNavItems.map((item, idx) => (
            <a 
              key={idx} 
              className="flex items-center gap-3 px-4 h-touch-target-min rounded font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 active:scale-95 cursor-pointer" 
              onClick={(e) => handleBottomItemClick(e, item.label)}
              href="#"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-y-auto pb-16 md:pb-0 relative w-full">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-surface-variant z-50 px-container-margin pb-safe">
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
