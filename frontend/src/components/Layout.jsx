import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, User } from 'lucide-react';

const Layout = ({ children, activePage, setActivePage }) => {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="flex-1 ml-[var(--sidebar-width)] p-10">
        <header className="flex items-center justify-between mb-10 overflow-hidden">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search assets, depots, or regions..." 
              className="w-full bg-white border border-[var(--border)] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-text-muted hover:text-primary transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-[var(--border)]">
              <div className="text-right">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-[10px] text-text-muted uppercase tracking-tighter">Zimbabwe GMB</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>
            </div>
          </div>
        </header>
        
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
