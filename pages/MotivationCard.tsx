
import React from 'react';
import { Quote } from 'lucide-react';

interface MotivationCardProps {
  text: string;
  isLoading: boolean;
}

export const MotivationCard: React.FC<MotivationCardProps> = ({ text, isLoading }) => {
  return (
    <div className="relative p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 overflow-hidden">
      <div className="absolute top-0 right-0 p-2 text-indigo-500/20">
        <Quote className="w-12 h-12 rotate-180" />
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
        </div>
      ) : (
        <p className="text-indigo-200 italic font-medium leading-relaxed relative z-10">
          "{text}"
        </p>
      )}
      
      <div className="mt-4 flex items-center">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
        <span className="mx-4 text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Sage Advice</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
      </div>
    </div>
  );
};
