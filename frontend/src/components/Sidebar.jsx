import React from 'react';
import { 
  Home, 
  Building2, 
  Truck, 
  Settings as SettingsIcon, 
  PieChart, 
  Users, 
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

const Sidebar = ({ activePage, setActivePage, isMobile, closeSidebar }) => {
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

      <div className="flex items-center gap-3 mb-10 px-2">
        <img src={logo} alt="Property Track" className="h-10 w-auto" />
      </div>

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
      </nav>

      <div className="pt-6 border-t border-[var(--border)] mt-auto space-y-4">
        <button 
          onClick={async () => {
            const btn = document.getElementById('sync-btn');
            const icon = document.getElementById('sync-icon');
            if (btn.disabled) return;
            
            btn.disabled = true;
            btn.classList.add('opacity-50');
            icon.classList.add('animate-spin');
            
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
              btn.disabled = false;
              btn.classList.remove('opacity-50');
              icon.classList.remove('animate-spin');
            }
          }}
          id="sync-btn"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-50 text-text-muted hover:bg-primary/10 hover:text-primary transition-all text-xs font-semibold uppercase tracking-wider"
        >
          <div id="sync-icon"><RefreshCw size={14} /></div>
          Sync Data
        </button>

        <div className="px-4 mb-2">
            <img src={gmbLogo} alt="GMB" className="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
