import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, User } from 'lucide-react';

const Layout = ({ children, activePage, setActivePage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive behavior */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar activePage={activePage} setActivePage={setActivePage} isMobile={true} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 lg:ml-0 p-4 md:p-10 transition-all duration-300">
        <header className="flex items-center justify-between mb-6 md:mb-10 gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 text-primary hover:text-primary-dark transition-all bg-white rounded-lg border-2 border-primary shadow-md active:scale-95"
              aria-label="Open Menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className="w-full h-1 bg-current rounded-full"></span>
                <span className="w-full h-1 bg-current rounded-full"></span>
                <span className="w-full h-1 bg-current rounded-full"></span>
              </div>
            </button>

            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-white border border-[var(--border)] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors shadow-sm text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative text-text-muted hover:text-primary transition-colors p-1">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-2 md:gap-3 md:pl-6 md:border-l md:border-[var(--border)]">
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-semibold leading-tight">Admin User</p>
                <p className="text-[10px] text-text-muted uppercase tracking-tighter">Zimbabwe GMB</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <User size={18} className="text-gray-500" />
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
