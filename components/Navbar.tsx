
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: 'fa-terminal' },
    { path: '/analytics', label: 'Analytics', icon: 'fa-microchip' },
  ];

  return (
    <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-check-double text-white text-lg"></i>
              </div>
              <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500 uppercase">
                HabitQuest
              </span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    location.pathname === link.path
                      ? 'bg-slate-900 text-emerald-400 border-emerald-500/50'
                      : 'text-slate-400 hover:text-slate-100 border-transparent hover:bg-slate-900/50'
                  } inline-flex items-center px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200`}
                >
                  <i className={`fas ${link.icon} mr-2 text-[10px]`}></i>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-black text-slate-100 uppercase tracking-tight">{user?.fullName}</span>
              <span className="text-[10px] font-mono text-emerald-500/70 uppercase">Node_{user?.username}</span>
            </div>
            <div className="h-8 w-px bg-slate-800 mx-2"></div>
            <button
              onClick={onLogout}
              className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
              title="Logout"
            >
              <i className="fas fa-power-off text-sm"></i>
              <span className="absolute -bottom-10 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-red-500 text-[10px] font-black py-1 px-3 rounded-lg border border-red-500/20 uppercase tracking-widest pointer-events-none">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
