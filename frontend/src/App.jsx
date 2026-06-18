import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FarmersDirectory from './components/FarmersDirectory';
import FarmerKhata from './components/FarmerKhata';
import MarketRates from './pages/MarketRates';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farmers" element={<FarmersDirectory />} />
          <Route path="/farmer/:id" element={<FarmerKhata />} />
          <Route path="/market-rates" element={<MarketRates />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
