import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Tag, ClipboardList, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/admin/offers',
      name: 'Offers & Slots',
      icon: Tag,
    },
    {
      path: '/admin/bookings',
      name: 'Bookings & Waitlist',
      icon: ClipboardList,
    },
    {
      path: '/admin/notifications',
      name: 'Notification Logs',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex flex-1 relative">
        {/* Sidebar for desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-100/50 dark:bg-slate-900/20 border-r border-slate-200/20 dark:border-slate-800/40 p-4 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </aside>

        {/* Mobile Navigation Trigger Bar */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Nav Menu */}
            <nav className="relative flex flex-col w-64 max-w-xs bg-slate-900 border-r border-slate-800/80 p-6 gap-3 z-10">
              <div className="text-lg font-bold font-sans tracking-tight text-white mb-4">
                Admin Panel
              </div>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-grow p-6 md:p-8 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
