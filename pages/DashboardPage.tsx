
import React, { useState, useEffect, useMemo } from 'react';
import { User, Habit, HabitLog, AICoachInsight, CoachInteraction, SmartReminder } from '../types';
import { GoogleGenAI } from "@google/genai";

interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#10b981');
  const [newHabitIcon, setNewHabitIcon] = useState('fa-star');
  const [newHabitTime, setNewHabitTime] = useState('08:00');
  const [aiInsight, setAiInsight] = useState<AICoachInsight | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [showCoachModal, setShowCoachModal] = useState(false);
  const [coachStep, setCoachStep] = useState(1);
  const [obstacles, setObstacles] = useState('');
  const [mood, setMood] = useState('');
  const [dailyCoachData, setDailyCoachData] = useState<CoachInteraction | null>(null);
  const [processingCoach, setProcessingCoach] = useState(false);
  const [smartReminders, setSmartReminders] = useState<SmartReminder[]>([]);
  const [showCalendarSync, setShowCalendarSync] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const savedHabits = localStorage.getItem(`habits_${user.id}`);
    const savedLogs = localStorage.getItem(`logs_${user.id}`);
    const savedCoach = localStorage.getItem(`coach_${user.id}_${todayStr}`);
    
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedCoach) setDailyCoachData(JSON.parse(savedCoach));
  }, [user.id, todayStr]);

  useEffect(() => {
    localStorage.setItem(`habits_${user.id}`, JSON.stringify(habits));
    localStorage.setItem(`logs_${user.id}`, JSON.stringify(logs));
  }, [habits, logs, user.id]);

  useEffect(() => {
    if (habits.length > 0) {
      const calculateReminders = () => {
        const reminders: SmartReminder[] = [];
        const now = new Date();
        const currentHour = now.getHours();
        
        habits.forEach(habit => {
          const isDone = logs.find(l => l.habitId === habit.id && l.date === todayStr)?.completed;
          if (!isDone) {
            const prefHour = habit.preferredTime ? parseInt(habit.preferredTime.split(':')[0]) : 9;
            if (currentHour >= prefHour || currentHour >= 18) {
              const streak = calculateStreak(habit.id);
              if (streak >= 3) {
                reminders.push({
                  habitId: habit.id,
                  habitName: habit.name,
                  message: `Streak Guard: Your ${streak}-day streak for "${habit.name}" is at risk!`,
                  urgency: streak > 7 ? 'high' : 'medium'
                });
              }
            }
          }
        });
        setSmartReminders(reminders);
      };
      calculateReminders();
    }
  }, [habits, logs, todayStr]);

  const calculateStreak = (habitId: string) => {
    let streak = 0;
    const sortedLogs = [...logs]
      .filter(l => l.habitId === habitId && l.completed)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
    
    for (const log of sortedLogs) {
      if (log.date === checkDate.toISOString().split('T')[0]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (log.date < checkDate.toISOString().split('T')[0]) {
        break;
      }
    }
    return streak;
  };

  const fetchAIInsight = async () => {
    if (habits.length === 0) return;
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const habitNames = habits.map(h => h.name).join(', ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am tracking these habits: ${habitNames}. Give me a short motivational quote, one practical tip for one of these habits, and a "daily focus" word. Format as JSON: {"tip": "...", "quote": "...", "focus": "..."}`,
        config: { responseMimeType: "application/json" }
      });
      setAiInsight(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (habits.length > 0 && !aiInsight) {
      fetchAIInsight();
    }
  }, [habits.length]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = now.toLocaleString('default', { month: 'long' });

  const dates = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    });
  }, [daysInMonth, currentYear, currentMonth]);

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      name: newHabitName,
      color: newHabitColor,
      icon: newHabitIcon,
      preferredTime: newHabitTime,
      createdAt: new Date().toISOString(),
    };

    setHabits(prev => [...prev, habit]);
    setNewHabitName('');
    setShowAddModal(false);
  };

  const toggleLog = (habitId: string, date: string) => {
    setLogs(prevLogs => {
      const existingIndex = prevLogs.findIndex((l) => l.habitId === habitId && l.date === date);
      if (existingIndex > -1) {
        const updated = [...prevLogs];
        updated[existingIndex] = { ...updated[existingIndex], completed: !updated[existingIndex].completed };
        return updated;
      } else {
        return [...prevLogs, { 
          id: Math.random().toString(36).substr(2, 9), 
          habitId, date, completed: true, completedAt: new Date().toISOString() 
        }];
      }
    });
  };

  const isCompleted = (habitId: string, date: string) => {
    return logs.find((l) => l.habitId === habitId && l.date === date)?.completed || false;
  };

  const deleteHabit = (id: string) => {
    if (window.confirm('Delete this habit protocol permanently?')) {
      setHabits(prev => prev.filter((h) => h.id !== id));
      setLogs(prev => prev.filter((l) => l.habitId !== id));
    }
  };

  const handleCoachSubmit = async () => {
    setProcessingCoach(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const completedHabitsNames = habits.filter(h => isCompleted(h.id, todayStr)).map(h => h.name).join(', ');
      const incompleteHabitsNames = habits.filter(h => !isCompleted(h.id, todayStr)).map(h => h.name).join(', ');
      const prompt = `Act as a supportive habit coach. Completed: ${completedHabitsNames}. Missed: ${incompleteHabitsNames}. Obstacles: ${obstacles}. Mood: ${mood}. Provide supportive response and one tiny improvement. Format JSON: {"response": "...", "suggestion": "..."}`;
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(res.text || '{}');
      const interaction: CoachInteraction = {
        date: todayStr,
        completedHabitIds: habits.filter(h => isCompleted(h.id, todayStr)).map(h => h.id),
        obstacles, mood, coachResponse: data.response, suggestion: data.suggestion
      };
      setDailyCoachData(interaction);
      localStorage.setItem(`coach_${user.id}_${todayStr}`, JSON.stringify(interaction));
      setShowCoachModal(false);
      setCoachStep(1);
    } catch (err) { console.error(err); } finally { setProcessingCoach(false); }
  };

  const totalCompletions = logs.filter(l => l.completed).length;
  const currentXP = totalCompletions * 10;
  const currentLevel = Math.floor(currentXP / 100) + 1;
  const xpInCurrentLevel = currentXP % 100;

  const icons = ['fa-star', 'fa-heart', 'fa-fire', 'fa-dumbbell', 'fa-book', 'fa-leaf', 'fa-water', 'fa-medkit', 'fa-brain', 'fa-running'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 min-h-screen text-slate-100">
      
      {/* Smart Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {smartReminders.map((reminder, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-500 ${reminder.urgency === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
            <div className="flex items-start gap-4 mb-3">
              <div className="mt-1"><i className={`fas ${reminder.urgency === 'high' ? 'fa-triangle-exclamation' : 'fa-bell'} text-lg`}></i></div>
              <div className="flex-grow">
                <p className="text-xs font-black uppercase tracking-widest mb-1">{reminder.urgency === 'high' ? 'Critical Alert' : 'Node Alert'}</p>
                <p className="text-sm font-bold leading-tight">{reminder.message}</p>
              </div>
            </div>
            <button onClick={() => toggleLog(reminder.habitId, todayStr)} className="w-full py-2 bg-slate-900/50 hover:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 transition-all">Clear Node</button>
          </div>
        ))}
      </div>

      {/* Hero Stats Section */}
      <div className="mb-10 bg-slate-900/40 border border-slate-800/50 p-6 rounded-[32px] flex flex-col md:flex-row items-center gap-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
           <i className="fas fa-terminal text-[200px]"></i>
        </div>
        
        <div className="flex-shrink-0 relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={276} strokeDashoffset={276 - (276 * xpInCurrentLevel) / 100} className="text-emerald-500 transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black text-slate-500 uppercase">Level</span>
            <span className="text-2xl font-black text-slate-100">{currentLevel}</span>
          </div>
        </div>

        <div className="flex-grow w-full space-y-4">
          <div className="flex justify-between items-end">
             <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-100">System Vitality</h2>
                <p className="text-xs font-mono text-emerald-500/80 uppercase tracking-widest">XP_{currentXP} / TARGET_100</p>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Efficiency</span>
                <span className="text-xl font-black text-emerald-400">{xpInCurrentLevel}%</span>
             </div>
          </div>
          <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-slate-700/50 p-0.5 shadow-inner">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${xpInCurrentLevel}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button 
            onClick={() => setShowCalendarSync(true)}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/10"
          >
            <i className="fas fa-calendar-day"></i> Sync Node
          </button>
          <button 
            onClick={() => dailyCoachData ? null : setShowCoachModal(true)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 font-black text-[10px] uppercase tracking-widest shadow-lg ${dailyCoachData ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default' : 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white'}`}
          >
            <i className={`fas ${dailyCoachData ? 'fa-shield-check' : 'fa-brain'}`}></i>
            {dailyCoachData ? 'Report OK' : 'Coach Check'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-100 tracking-tighter uppercase">Quest Terminal</h1>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 Current Cycle: {monthName}
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="group px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all active:scale-95 text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 flex items-center gap-3"
            >
              <i className="fas fa-plus-circle group-hover:rotate-90 transition-transform duration-300"></i>
              Forge Habit
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[32px] shadow-3xl overflow-hidden relative group">
            <div className="overflow-x-auto no-scrollbar scroll-smooth">
              <table className="min-w-full divide-y divide-slate-800/50">
                <thead>
                  <tr className="bg-slate-900/90 backdrop-blur-md">
                    <th className="sticky left-0 z-10 bg-slate-900 px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[260px] border-r border-slate-800/50">Protocol ID</th>
                    {dates.map((date, idx) => (
                      <th key={date} className={`px-2 py-4 text-center min-w-[50px] transition-colors ${new Date(date).toDateString() === now.toDateString() ? 'bg-emerald-500/5' : ''}`}>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-slate-600 font-black mb-1">{new Date(date).toLocaleString('default', { weekday: 'narrow' })}</span>
                          <span className={`text-xs font-mono w-8 h-8 flex items-center justify-center rounded-lg transition-all ${new Date(date).toDateString() === now.toDateString() ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}>{idx + 1}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {habits.map((habit) => (
                    <tr key={habit.id} className="hover:bg-slate-800/20 transition-all duration-200 group/row">
                      <td className="sticky left-0 z-10 bg-slate-900 group-hover/row:bg-slate-800/90 px-8 py-6 whitespace-nowrap border-r border-slate-800/50 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover/row:scale-110" style={{ backgroundColor: habit.color, boxShadow: `0 8px 16px ${habit.color}22` }}>
                              <i className={`fas ${habit.icon || 'fa-star'} text-sm`}></i>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-slate-200 uppercase tracking-tight group-hover/row:text-emerald-400 transition-colors">{habit.name}</span>
                               <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1 mt-0.5">
                                 <i className="far fa-clock opacity-50"></i> {habit.preferredTime}
                               </span>
                            </div>
                          </div>
                          <button onClick={() => deleteHabit(habit.id)} className="p-2 opacity-0 group-hover/row:opacity-100 text-slate-600 hover:text-red-500 transition-all scale-75 hover:scale-100">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                      {dates.map((date) => (
                        <td key={date} className="px-1 py-4 text-center">
                          <button 
                            onClick={() => toggleLog(habit.id, date)} 
                            className={`w-9 h-9 rounded-xl transition-all duration-300 border-2 flex items-center justify-center group/btn ${isCompleted(habit.id, date) ? 'scale-110 border-transparent text-white shadow-xl' : 'bg-transparent border-slate-800 hover:border-white/10'}`} 
                            style={{ 
                                backgroundColor: isCompleted(habit.id, date) ? habit.color : 'transparent',
                                boxShadow: isCompleted(habit.id, date) ? `0 10px 20px ${habit.color}33` : 'none'
                            }}
                          >
                            <i className={`fas fa-check text-[10px] transition-transform ${isCompleted(habit.id, date) ? 'scale-100' : 'scale-0'}`}></i>
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {habits.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-center px-10">
                   <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-[30px] flex items-center justify-center mb-6 shadow-2xl">
                      <i className="fas fa-microchip text-slate-800 text-3xl animate-pulse"></i>
                   </div>
                   <h3 className="text-xl font-black text-slate-200 uppercase tracking-tighter">Terminal Offline</h3>
                   <p className="text-sm text-slate-500 max-w-xs mt-2 font-medium">No behavioral protocols initialized. Use the 'Forge Habit' command to start synchronization.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {dailyCoachData && (
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative border-l-4 border-l-emerald-500 overflow-hidden group/feedback animate-in slide-in-from-right duration-700">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/feedback:opacity-10 transition-opacity">
                 <i className="fas fa-comment-dots text-4xl"></i>
              </div>
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6">Neural Response</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6 font-medium italic">"{dailyCoachData.coachResponse}"</p>
              <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/20 shadow-inner">
                <span className="text-[9px] font-black text-emerald-500 uppercase block mb-2 tracking-widest">Protocol Optimization</span>
                <p className="text-xs text-slate-200 font-bold leading-relaxed">{dailyCoachData.suggestion}</p>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5">
                <i className="fas fa-atom text-5xl"></i>
             </div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Core Analytics</h3>
            {aiInsight ? (
              <div className="space-y-6">
                <p className="text-xs text-slate-400 font-medium leading-relaxed italic opacity-80">"{aiInsight.quote}"</p>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 border-l-2 border-l-blue-600">
                  <span className="text-[9px] font-black text-blue-500 uppercase block mb-2 tracking-widest">Sync Vector</span>
                  <p className="text-sm font-black text-white tracking-tight uppercase">{aiInsight.focus}</p>
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed font-mono">
                   <i className="fas fa-info-circle mr-2 opacity-30"></i>
                   {aiInsight.tip}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 gap-3 opacity-30">
                 <i className="fas fa-circle-notch fa-spin text-xl"></i>
                 <span className="text-[9px] font-black uppercase tracking-widest">Syncing Matrix...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High-Fidelity Modals */}
      {showCalendarSync && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowCalendarSync(false)}></div>
          <div className="bg-slate-900 w-full max-w-xl rounded-[40px] border border-slate-800 shadow-3xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-1">
                <div className="bg-slate-950 rounded-[38px] p-10">
                   <div className="flex items-center gap-6 mb-10">
                     <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[20px] flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-600/30">
                        <i className="fab fa-google"></i>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Calendar Integration</h3>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Temporal Node Syncing</p>
                     </div>
                   </div>
                   
                   <div className="space-y-4 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {habits.map(h => (
                        <div key={h.id} className="group flex justify-between items-center p-4 bg-slate-900/50 hover:bg-slate-900 rounded-2xl border border-slate-800/50 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: h.color }}></div>
                              <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight">{h.name}</span>
                           </div>
                           <span className="text-xs font-mono text-indigo-400 font-black">{h.preferredTime}</span>
                        </div>
                      ))}
                      {habits.length === 0 && <p className="text-center py-10 text-slate-600 font-mono text-xs uppercase tracking-widest">No nodes found for synchronization.</p>}
                   </div>

                   <div className="flex gap-4">
                      <button onClick={() => { alert('Simulation: Neural link established with Google Calendar Services.'); setShowCalendarSync(false); }} className="flex-grow py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-xs uppercase tracking-[0.3em]">Authorize & Sync</button>
                      <button onClick={() => setShowCalendarSync(false)} className="px-8 py-5 bg-slate-900 text-slate-500 font-black rounded-2xl hover:bg-slate-800 transition-colors uppercase text-[10px] tracking-widest">Cancel</button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Habit Forge Modal (Refined) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-slate-900 w-full max-w-lg rounded-[40px] border border-slate-800 shadow-3xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-1">
                <div className="bg-slate-950 rounded-[38px] p-10">
                   <h3 className="text-2xl font-black text-slate-100 mb-10 uppercase tracking-tighter text-center">Protocol Initialization</h3>
                   <form onSubmit={addHabit} className="space-y-8">
                      <div>
                         <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Identity Code (Icon)</label>
                         <div className="grid grid-cols-5 gap-3">
                            {icons.map(icon => (
                               <button 
                                 key={icon} type="button" onClick={() => setNewHabitIcon(icon)} 
                                 className={`h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${newHabitIcon === icon ? 'bg-emerald-600 border-transparent text-white shadow-xl shadow-emerald-600/20 scale-110' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                               >
                                  <i className={`fas ${icon} text-lg`}></i>
                               </button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Protocol Designation</label>
                            <input type="text" autoFocus required value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="ENTER NODE NAME..." className="w-full px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 focus:border-emerald-500 outline-none transition-all font-bold placeholder:text-slate-800 uppercase tracking-widest text-sm" />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Preferred Frequency</label>
                               <input type="time" value={newHabitTime} onChange={(e) => setNewHabitTime(e.target.value)} className="w-full px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 focus:border-emerald-500 outline-none font-mono text-sm" />
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Core Signature</label>
                               <div className="flex gap-2">
                                  {['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b'].map(color => (
                                    <button key={color} type="button" onClick={() => setNewHabitColor(color)} className={`w-10 h-10 rounded-full border-4 transition-all ${newHabitColor === color ? 'border-white scale-110 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: color }} />
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                         <button type="submit" className="flex-grow py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-95 text-xs uppercase tracking-[0.3em]">Execute Forge</button>
                         <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-5 bg-slate-900 text-slate-500 font-black rounded-2xl hover:bg-slate-800 transition-colors uppercase text-[10px] tracking-widest">Abort</button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Daily Coach Modal (Refined) */}
      {showCoachModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => !processingCoach && setShowCoachModal(false)}></div>
          <div className="bg-slate-900 w-full max-w-lg rounded-[48px] border border-slate-800 shadow-3xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-1">
                <div className="bg-slate-950 rounded-[46px] p-12">
                   <div className="flex flex-col items-center text-center mb-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[30px] flex items-center justify-center text-white text-3xl shadow-2xl shadow-blue-600/30 mb-6">
                        <i className="fas fa-robot"></i>
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Coach Intelligence</h3>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Behavioral Mapping Unit</p>
                   </div>
                   
                   {coachStep === 1 ? (
                     <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-center">
                           <p className="text-sm text-slate-400 font-medium leading-relaxed">Matrix analysis ready. Today's performance logs show <strong className="text-emerald-400">{habits.filter(h => isCompleted(h.id, todayStr)).length}</strong> nodes successfully synchronized.</p>
                        </div>
                        <button onClick={() => setCoachStep(2)} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all uppercase tracking-[0.3em] text-xs">Establish Data Link</button>
                     </div>
                   ) : (
                     <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                        <div>
                           <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center">Identify Interference Triggers</label>
                           <textarea className="w-full h-32 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm text-slate-200 focus:border-blue-500 outline-none transition-all placeholder:text-slate-800 resize-none font-medium leading-relaxed" placeholder="Describe environmental or cognitive friction..." value={obstacles} onChange={(e) => setObstacles(e.target.value)} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center">Core Sentiment State</label>
                           <div className="grid grid-cols-2 gap-3">
                              {['Exhausted', 'Neutral', 'Motivated', 'Elite'].map(m => (
                                 <button key={m} onClick={() => setMood(m)} className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all tracking-widest ${mood === m ? 'bg-blue-600 border-transparent text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'}`}>{m}</button>
                              ))}
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <button disabled={processingCoach} onClick={handleCoachSubmit} className="flex-grow py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50">
                              {processingCoach ? <><i className="fas fa-circle-notch fa-spin mr-2"></i> Mapping Matrix</> : 'Execute Analysis'}
                           </button>
                           <button onClick={() => setCoachStep(1)} className="px-8 py-5 bg-slate-900 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest">Back</button>
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
