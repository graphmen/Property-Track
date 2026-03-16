import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InventoryView from './pages/InventoryView';
import ReportsView from './pages/ReportsView';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'land':
      case 'buildings':
      case 'vehicles':
      case 'machinery':
      case 'furniture':
      case 'computers':
        return <InventoryView type={activePage} />;
      case 'reports':
        return <ReportsView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-text-muted">
            <h2 className="text-xl font-bold mb-2 uppercase tracking-widest">{activePage} Detail View</h2>
            <p>This module is currently being populated with live inventory data.</p>
          </div>
        );
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
