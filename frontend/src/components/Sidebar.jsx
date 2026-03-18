import React, { useState } from 'react';
import { 
  Home, 
  Building2, 
  Truck, 
  Settings as SettingsIcon, 
  PieChart, 
  MapPin,
  LogOut,
  Package,
  Monitor,
  RefreshCw
} from 'lucide-react';

import logo from '../assets/logo.png';
import gmbLogo from '../assets/gmb.png';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
      active 
        ? 'bg-primary text-white shadow-lg' 
        : 'hover:bg-gray-100 text-gray-600'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);

const Sidebar = ({ activePage, setActivePage, isMobile, closeSidebar, onSync }) => {
  const [syncing, setSyncing] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'land', label: 'Land', icon: MapPin },
    { id: 'buildings', label: 'Buildings', icon: Building2 },
    { id: 'vehicles', label: 'Motor Vehicles', icon: Truck },
    { id: 'machinery', label: 'Plant & Machinery', icon: SettingsIcon },
    { id: 'furniture', label: 'Furniture & Fittings', icon: Package },
    { id: 'computers', label: 'Computers', icon: Monitor },
    { id: 'reports', label: 'Analytics', icon: PieChart },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (closeSidebar) closeSidebar();
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const resp = await fetch('/api/sync/google-sheets', { method: 'POST' });
      const data = await resp.json();
      if (data.status === 'success') {
        alert('Data Sync Successful! Refreshing page...');
        window.location.reload();
      } else {
        alert('Sync Error: ' + data.message);
      }
    } catch (err) {
      alert('Connection error during sync.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="w-[var(--sidebar-width)] h-screen bg-white border-r border-[var(--border)] p-6 flex flex-col relative">
      {/* Mobile Close Button */}
      {isMobile && (
        <button 
          onClick={closeSidebar}
          className="lg:hidden absolute right-4 top-4 p-2 text-text-muted hover:text-primary transition-colors"
        >
          <LogOut size={20} className="rotate-180" />
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <img src={logo} alt="Property Track" className="h-10 w-auto" />
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-2 text-sm">
        <p className="px-4 mb-4 text-[10px] uppercase tracking-wider text-text-muted font-bold">Main Navigation</p>
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activePage === item.id}
            onClick={() => handleNavClick(item.id)}
          />
        ))}

        {/* Sync button styled as a nav item */}
        <div
          onClick={handleSync}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 text-gray-600 ${syncing ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
          <span className="font-medium">{syncing ? 'Syncing...' : 'Sync Data'}</span>
        </div>
      </nav>

      {/* GMB Logo only at bottom */}
      <div className="pt-6 border-t border-[var(--border)] mt-auto flex justify-center">
        <img src={gmbLogo} alt="GMB" className="h-10 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
      </div>
    </div>
  );
};

export default Sidebar;
