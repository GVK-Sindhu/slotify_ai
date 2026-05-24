import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/20 dark:border-slate-800/40 py-6 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Slotify AI. All rights reserved.</p>
      </footer>
    </div>
  );
};
