
import React, { useState, useMemo } from 'react';
import { User, Habit, HabitLog, TimeRange, DeepAnalysisResult, WeeklyReport } from '../types';
import { GoogleGenAI } from "@google/genai";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface AnalyticsPageProps {
  user: User;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ user }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [analysis, setAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reporting, setReporting] = useState(false);
  
  const habits = useMemo((): Habit[] => {
    const data = localStorage.getItem(`habits_${user.id}`);
    return data ? JSON.parse(data) : [];
  }, [user.id]);

  const logs = useMemo((): HabitLog[] => {
    const data = localStorage.getItem(`logs_${user.id}`);
    return data ? JSON.parse(data) : [];
  }, [user.id]);

  const runDeepAnalysis = async () => {
    if (logs.length < 5) {
      alert("Insufficient data nodes. Synchronize more logs before running deep analysis.");
      return;
    }
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const logSummary = logs.map(l => ({
        h: habits.find(h => h.id === l.habitId)?.name,
        d: l.date,
        c: l.completed,
        t: l.completedAt ? new Date(l.completedAt).toLocaleTimeString() : 'N/A'
      }));

      const prompt = `Analyze this habit tracking data for pattern recognition: ${JSON.stringify(logSummary)}. 
      Identify:
      1. Major patterns (e.g., morning vs evening consistency).
      2. Key streak break triggers.
      3. Most productive time of day (based on 't' timestamps).
      4. Most risky days of the week.
      5. Likely reasons for missed habits.
      6. Provide exactly 5 personalized high-impact improvement suggestions.
      
      Format response as JSON: {
        "patterns": ["string"],
        "streakBreaks": "string",
        "productiveTime": "string",
        "riskyDays": "string",
        "likelyReasons": ["string"],
        "suggestions": ["string"]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      setAnalysis(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error("Deep analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateWeeklyReport = async () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    const weeklyLogs = logs.filter(l => last7Days.includes(l.date));
    
    if (weeklyLogs.length === 0) {
      alert("No data streams detected for the current weekly cycle.");
      return;
    }

    setReporting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const habitNames = habits.map(h => h.name).join(', ');
      
      const prompt = `Generate a highly detailed weekly progress report based on this 7-day data: ${JSON.stringify(weeklyLogs)}. 
      Habits being tracked: ${habitNames}.
      Include:
      - strongestHabits: An array of objects with "name" and "why" (highest completion).
      - weakestHabits: An array of objects with "name" and "why" (lowest completion).
      - trendChanges: A descriptive string identifying if consistency is increasing or decreasing and why.
      - consistencyPercentage: A number from 0-100 representing overall success.
      - motivationAnalysis: A paragraph analyzing the psychological/emotional drive based on completion patterns.
      - summary: A punchy one-sentence executive summary.
      
      Format response as JSON: {
        "strongestHabits": [{"name": "string", "why": "string"}],
        "weakestHabits": [{"name": "string", "why": "string"}],
        "trendChanges": "string",
        "consistencyPercentage": number,
        "motivationAnalysis": "string",
        "summary": "string"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      setWeeklyReport(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error("Weekly report generation failed:", error);
    } finally {
      setReporting(false);
    }
  };

  const chartData = useMemo(() => {
    if (timeRange === 'daily') {
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
      return last7.map(date => ({
        name: new Date(date).toLocaleDateString('default', { weekday: 'short' }),
        count: logs.filter(l => l.date === date && l.completed).length,
      }));
    }
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const monthPrefix = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
      return {
        name: new Date(currentYear, i).toLocaleString('default', { month: 'short' }),
        count: logs.filter(l => l.date.startsWith(monthPrefix) && l.completed).length,
      };
    });
  }, [logs, timeRange]);

  const chartColor = "#ef4444"; 

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tighter uppercase">Neural Analytics</h1>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Behavioral Pattern Mapping Unit</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={generateWeeklyReport}
            disabled={reporting}
            className={`px-6 py-3 text-[10px] font-black rounded-2xl uppercase tracking-widest transition-all active:scale-95 ${
              reporting 
              ? 'bg-slate-800 text-slate-500' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]'
            }`}
          >
            {reporting ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-chart-line mr-2"></i>}
            Weekly Report
          </button>
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-xl">
            {(['daily', 'monthly'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${
                  timeRange === range ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Weekly Report Section */}
      {weeklyReport && (
        <div className="mb-10 bg-slate-900 border border-slate-800 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl">
                <i className="fas fa-file-shield"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Weekly Command Report</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Temporal Cycle Summary</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Consistency</div>
                  <div className="text-4xl font-black text-emerald-400 leading-none">{weeklyReport.consistencyPercentage}%</div>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
            {/* Top Strengths and Weaknesses */}
            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <i className="fas fa-arrow-up text-[8px]"></i> Alpha Nodes (Strongest)
                </h4>
                <div className="space-y-3">
                  {weeklyReport.strongestHabits.map((h, i) => (
                    <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 border-l-4 border-l-emerald-500 group hover:bg-slate-800/50 transition-colors">
                      <div className="text-sm font-bold text-slate-200 mb-1">{h.name}</div>
                      <div className="text-xs text-slate-500 leading-relaxed font-medium">{h.why}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <i className="fas fa-arrow-down text-[8px]"></i> Delta Nodes (Weakest)
                </h4>
                <div className="space-y-3">
                  {weeklyReport.weakestHabits.map((h, i) => (
                    <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 border-l-4 border-l-red-500 group hover:bg-slate-800/50 transition-colors">
                      <div className="text-sm font-bold text-slate-200 mb-1">{h.name}</div>
                      <div className="text-xs text-slate-500 leading-relaxed font-medium">{h.why}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Narrative Analysis */}
            <div className="space-y-8">
              <div className="bg-indigo-900/10 p-8 rounded-[32px] border border-indigo-500/20 relative">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <i className="fas fa-brain text-5xl"></i>
                </div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Neural Narrative Analysis</h4>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {weeklyReport.motivationAnalysis}
                </p>
                <div className="mt-8 pt-6 border-t border-indigo-500/20">
                   <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest block mb-2">Trend Shift Vector</span>
                   <p className="text-xs text-slate-400 italic leading-relaxed">"{weeklyReport.trendChanges}"</p>
                </div>
              </div>
              
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 border-l-4 border-l-pink-600">
                <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest block mb-2">Executive Directive</span>
                <p className="text-base font-bold text-slate-100 tracking-tight leading-snug">
                  {weeklyReport.summary}
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setWeeklyReport(null)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-colors"
          >
            Clear Data Cache
          </button>
        </div>
      )}

      {/* Charts and Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <i className="fas fa-wave-square text-[180px]"></i>
          </div>
          <h3 className="text-[10px] font-black text-slate-500 mb-10 flex items-center uppercase tracking-widest">
            <span className="w-2 h-2 bg-red-600 rounded-full mr-3 animate-ping"></span>
            Biometric Frequency Flux
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#475569', fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#475569', fontWeight: 900 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderRadius: '20px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: chartColor, fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="count" stroke={chartColor} strokeWidth={4} fillOpacity={1} fill="url(#fluxGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-2xl flex flex-col">
          <h3 className="text-[10px] font-black text-slate-500 mb-8 flex items-center uppercase tracking-widest">
            <i className="fas fa-network-wired text-indigo-500 mr-3"></i>
            Node Consistency
          </h3>
          <div className="flex-grow space-y-6 overflow-y-auto pr-2 no-scrollbar">
            {habits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                 <i className="fas fa-inbox text-slate-800 text-4xl mb-4"></i>
                 <p className="text-slate-600 font-mono text-[9px] uppercase tracking-widest">No Active Nodes</p>
              </div>
            ) : (
              habits.map((habit) => {
                const habitLogs = logs.filter(l => l.habitId === habit.id);
                const rate = Math.round((habitLogs.filter(l => l.completed).length / Math.max(1, habitLogs.length)) * 100);
                return (
                  <div key={habit.id} className="group cursor-default">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform" style={{ color: habit.color }}>
                           <i className={`fas ${habit.icon} text-[10px]`}></i>
                         </div>
                         <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight group-hover:text-white transition-colors">{habit.name}</span>
                      </div>
                      <span className="text-[10px] font-mono py-1 px-3 rounded-full bg-slate-950 text-emerald-400 border border-slate-800">{rate}%</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (13 - i));
                        const dateStr = d.toISOString().split('T')[0];
                        const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
                        const done = log?.completed;
                        return (
                          <div 
                            key={i} 
                            title={dateStr}
                            className={`h-2.5 rounded-sm transition-all duration-300 ${done ? '' : 'bg-slate-800/40'}`}
                            style={{ 
                                backgroundColor: done ? habit.color : undefined, 
                                opacity: done ? 1 : 0.3,
                                boxShadow: done ? `0 0 10px ${habit.color}44` : 'none'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Deep Analysis Interaction */}
      <div className="bg-slate-900 p-1 rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden mb-10">
        <div className="bg-slate-950 rounded-[38px] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 pointer-events-none opacity-5">
             <i className="fas fa-atom text-[280px] -mr-32 -mt-32 text-indigo-500"></i>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-black text-slate-100 mb-2 uppercase tracking-tighter">Deep Behavioral Mapping</h2>
              <p className="text-slate-500 text-sm max-w-xl font-medium">Initialize the Gemini Neural Engine to run multi-vector pattern recognition and predict behavioral interference zones.</p>
            </div>
            <button 
              onClick={runDeepAnalysis}
              disabled={analyzing}
              className={`whitespace-nowrap px-8 py-4 font-black rounded-2xl flex items-center gap-3 transition-all active:scale-95 text-[10px] uppercase tracking-widest ${
                analyzing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
              }`}
            >
              {analyzing ? (
                <><i className="fas fa-circle-notch fa-spin"></i> Processing Streams...</>
              ) : (
                <><i className="fas fa-microchip"></i> Run Deep Analysis</>
              )}
            </button>
          </div>

          {analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-700">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><i className="fas fa-fingerprint text-4xl"></i></div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 border-b border-indigo-500/20 pb-2">Pattern Signature</h4>
                <ul className="space-y-4">
                  {analysis.patterns.map((p, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-3 leading-relaxed font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0"></span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><i className="fas fa-radar text-4xl"></i></div>
                <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6 border-b border-pink-500/20 pb-2">Interference Risks</h4>
                <div className="space-y-6">
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Active Peak Hours</div>
                    <div className="text-lg font-black text-white tracking-tighter">{analysis.productiveTime}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Critical Vulnerability Days</div>
                    <div className="text-lg font-black text-pink-500 tracking-tighter">{analysis.riskyDays}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Break Triggers</div>
                    <div className="text-xs text-slate-300 leading-relaxed font-medium">{analysis.streakBreaks}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><i className="fas fa-shield-virus text-4xl"></i></div>
                <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-6 border-b border-yellow-500/20 pb-2">Root Interference</h4>
                <ul className="space-y-4">
                  {analysis.likelyReasons.map((r, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-3 italic font-medium">
                      <i className="fas fa-exclamation-triangle text-yellow-600/50 mt-0.5"></i>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-2 lg:col-span-3 bg-emerald-950/20 p-8 md:p-10 rounded-[40px] border border-emerald-900/30 shadow-inner">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-8 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <i className="fas fa-wand-magic-sparkles text-sm"></i>
                  </div>
                  Optimization Protocols (Direct Directives)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all shadow-xl group cursor-default">
                      <div className="text-emerald-500 font-black text-xl mb-3 opacity-20 group-hover:opacity-100 transition-opacity">0{i+1}</div>
                      <p className="text-xs text-slate-300 font-bold leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            !analyzing && (
              <div className="py-20 border-2 border-dashed border-slate-800 rounded-[32px] text-center opacity-30">
                <i className="fas fa-wave-square text-slate-700 text-3xl mb-4"></i>
                <p className="text-slate-600 font-mono text-[9px] uppercase tracking-[0.3em]">Awaiting Link Authorization...</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
