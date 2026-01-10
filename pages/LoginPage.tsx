
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('System requires valid credentials.');
      return;
    }

    const mockUser: User = {
      id: '1',
      fullName: 'Matrix Admin',
      username: 'admin_node',
      email: 'admin@habitquest.io',
    };

    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 selection:bg-emerald-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <i className="fas fa-check-double text-white text-4xl"></i>
        </div>
        <h2 className="mt-8 text-center text-4xl font-black text-slate-100 tracking-tighter uppercase">
          Welcome Citizen
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500 uppercase tracking-widest">
          Node Access Protocol
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="bg-slate-900/50 backdrop-blur-xl py-10 px-6 shadow-3xl sm:rounded-[40px] sm:px-12 border border-slate-800/50">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center border border-red-500/20">
                <i className="fas fa-shield-halved mr-3"></i>
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label htmlFor="identifier" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Identifier (Node / ID)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-emerald-500 transition-colors">
                    <i className="fas fa-fingerprint text-sm"></i>
                  </div>
                  <input
                    id="identifier" type="text" required value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-bold uppercase text-xs tracking-widest"
                    placeholder="ENTER ID..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-emerald-500 transition-colors">
                    <i className="fas fa-lock text-sm"></i>
                  </div>
                  <input
                    id="password" type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-bold text-xs tracking-[0.4em]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-5 px-4 rounded-2xl text-xs font-black uppercase tracking-[0.3em] text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 focus:outline-none shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              Authorize Node
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-800/50 text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              New to the matrix?{' '}
              <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 transition-colors underline decoration-emerald-500/30 underline-offset-4">
                Initialize Protocol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
