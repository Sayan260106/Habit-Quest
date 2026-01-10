
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface SignupPageProps {
  onSignup: (user: User) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, username, email, password, confirmPassword } = formData;

    if (!fullName || !username || !email || !password || !confirmPassword) {
      setError('Complete all node identity fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Encryption keys do not match.');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      fullName,
      username,
      email,
    };

    onSignup(newUser);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 selection:bg-emerald-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-[20px] flex items-center justify-center mx-auto shadow-2xl">
          <i className="fas fa-dna text-white text-2xl"></i>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-100 tracking-tighter uppercase">
          New Identity Node
        </h2>
        <p className="mt-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
          Initialization Sequence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="bg-slate-900/50 backdrop-blur-xl py-10 px-6 shadow-3xl sm:rounded-[40px] sm:px-12 border border-slate-800/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center border border-red-500/20">
                <i className="fas fa-bug mr-3"></i>
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Identity Name</label>
                <input
                  name="fullName" type="text" required value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-xs tracking-tight"
                  placeholder="FULL NAME"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Node Handle</label>
                <input
                  name="username" type="text" required value={formData.username}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-xs"
                  placeholder="USER_01"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Neural Email Address</label>
              <input
                name="email" type="email" required value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold text-xs tracking-tight"
                placeholder="EMAIL@DOMAIN.IO"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Key</label>
                <input
                  name="password" type="password" required value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-black text-xs tracking-widest"
                  placeholder="••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Verify Key</label>
                <input
                  name="confirmPassword" type="password" required value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-black text-xs tracking-widest"
                  placeholder="••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 focus:outline-none shadow-xl transition-all active:scale-95"
            >
              Begin Sequence
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">
              Return to Login Protocol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
