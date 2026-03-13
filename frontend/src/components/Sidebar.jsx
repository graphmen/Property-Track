import React from 'react';
import { 
  Home, 
  Building2, 
  Truck, 
  Settings as SettingsIcon, 
  PieChart, 
  Users, 
  MapPin,
  LogOut
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

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'land', label: 'Land', icon: MapPin },
    { id: 'buildings', label: 'Buildings', icon: Building2 },
    { id: 'vehicles', label: 'Motor Vehicles', icon: Truck },
    { id: 'machinery', label: 'Plant & Machinery', icon: SettingsIcon },
    { id: 'reports', label: 'Analytics', icon: PieChart },
  ];

  return (
    <div className="w-[var(--sidebar-width)] h-screen bg-white border-r border-[var(--border)] p-6 flex flex-col fixed left-0 top-0 z-50">
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
            onClick={() => setActivePage(item.id)}
          />
        ))}
      </nav>

      <div className="pt-6 border-t border-[var(--border)] mt-auto">
        <div className="px-4 mb-6">
            <img src={gmbLogo} alt="GMB" className="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
        </div>
        <SidebarItem icon={Users} label="Team" />
        <SidebarItem icon={LogOut} label="Log Out" />
      </div>
    </div>
  );
};

export default Sidebar;
