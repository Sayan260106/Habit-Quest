
import React, { useState } from 'react';
import { Mail, Lock, LogIn, Github, Chrome } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-2">Enter the Realm</h2>
      <p className="text-slate-400 mb-8">Sign in to continue your streak and claim your rewards.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder-slate-600"
            placeholder="Explorer's email"
            required
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder-slate-600"
            placeholder="Secret Passphrase"
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-slate-400 cursor-pointer">
            <input type="checkbox" className="mr-2 rounded border-slate-800 bg-slate-900 text-indigo-500 focus:ring-indigo-500" />
            Stay logged in
          </label>
          <button type="button" className="text-indigo-400 hover:text-indigo-300 font-medium">Forgot scroll?</button>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all transform active:scale-[0.98]"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Login to Quest
        </button>
      </form>

      <div className="mt-8 flex items-center">
        <div className="flex-1 border-t border-slate-800"></div>
        <span className="px-4 text-slate-600 text-xs uppercase font-bold tracking-widest">Alternative Paths</span>
        <div className="flex-1 border-t border-slate-800"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <button className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-colors">
          <Chrome className="w-5 h-5 mr-2 text-red-500" />
          Google
        </button>
        <button className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-colors">
          <Github className="w-5 h-5 mr-2" />
          GitHub
        </button>
      </div>
    </div>
  );
};
export default LoginForm;