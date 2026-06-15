import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../styles/delivery.css';

const DeliveryLayout = () => {
  const isOnline = true;
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface font-body-md">
      {/* Header */}
      <header className="w-full top-0 sticky z-50 flex justify-between items-center px-margin-desktop py-4 bg-surface border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="font-headline-md text-headline-md text-primary">ShareShelf</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isOnline ? 'bg-primary-fixed' : 'bg-surface-variant'}`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-outline'}`}></span>
            <span className="font-label-md text-label-md text-primary-container">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
              <img 
                alt="Driver profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPdup9hvJESUnaAOYf4lnoiy9MXJYHpTjHNTqLoSQb81XFEIOyOJWidfOxArDH_cl2gC0xgRGb7O_dIKb3hsBSfwdReOCX9O-47vYAPFVFOWBZ4cTeglS84zUFydNISrCgQFOEz3oBka-1CcW38H01mmUYOp5HkJaqW3ToIhTWohWG8RwQbj3ol43DEgD1_alU8zeu_4OgqvuHOUUdMxEbOlSvAGj0vceLaQ5rEYRBVIko8sv6Caunjeb4bJm7Qny84YKplLW2SEY"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)]">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col h-full w-64 fixed left-0 top-[72px] p-4 gap-base bg-surface-container-low border-r border-outline-variant">
          <div className="mb-8 p-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">88</div>
              <div>
                <p className="font-label-md text-label-md text-primary">Driver ID: 8821</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Active Session</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <NavLink 
              to="/delivery" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
                  isActive 
                    ? 'bg-primary-container text-on-primary-container' 
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`
              }
            >
              <span className="material-symbols-outlined">local_shipping</span>
              <span className="font-label-md text-label-md">Active Deliveries</span>
            </NavLink>
            <NavLink 
              to="/delivery/order-history" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
                  isActive 
                    ? 'bg-primary-container text-on-primary-container' 
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`
              }
            >
              <span className="material-symbols-outlined">history</span>
              <span className="font-label-md text-label-md">Order History</span>
            </NavLink>
          </nav>
          <div className="mt-auto flex flex-col gap-4">
            <button onClick={() => navigate('/')} className="sidebar-logout w-full">
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-margin-mobile md:p-margin-desktop bg-background overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom NavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant px-6 py-3 flex justify-between items-center z-50">
        <NavLink to="/delivery" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined" style={({ isActive }) => isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>local_shipping</span>
          <span className="text-[10px] font-bold">Deliveries</span>
        </NavLink>
        <NavLink to="/delivery/order-history" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined" style={({ isActive }) => isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>history</span>
          <span className="text-[10px] font-bold">History</span>
        </NavLink>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

      {/* Mobile FAB for status toggle */}
      {/* Mobile FAB removed; logout is available in sidebar */}
    </div>
  );
};

export default DeliveryLayout;