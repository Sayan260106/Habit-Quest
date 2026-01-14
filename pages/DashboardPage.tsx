
import React, { useState, useEffect, useMemo } from 'react';
import { User, Habit, HabitLog, AICoachInsight, Achievement } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface DashboardPageProps {
  user: User;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'First Blood', description: 'Complete your first habit protocol.', icon: 'fa-skull-crossbones', requirement: 1, type: 'completions' },
  { id: '2', title: 'Double Down', description: 'Log 10 successful habit completions.', icon: 'fa-angles-up', requirement: 10, type: 'completions' },
  { id: '3', title: 'Persistence', description: 'Complete 50 total habit nodes.', icon: 'fa-shield-halved', requirement: 50, type: 'completions' },
  { id: '4', title: 'Century Node', description: 'Reach 100 total habit completions.', icon: 'fa-gem', requirement: 100, type: 'completions' },
  { id: '5', title: 'Millennium Protocol', description: 'Reach 1000 total completions.', icon: 'fa-dharmachakra', requirement: 1000, type: 'completions' },
  { id: '6', title: 'Fire Starter', description: 'Maintain a 3-day streak on any habit.', icon: 'fa-fire', requirement: 3, type: 'streaks' },
  { id: '7', title: 'Weekly Pulse', description: 'Achieve a 7-day streak on any habit.', icon: 'fa-bolt-lightning', requirement: 7, type: 'streaks' },
  { id: '8', title: 'Fortress of Will', description: 'Reach a 14-day streak on any habit.', icon: 'fa-castle', requirement: 14, type: 'streaks' },
  { id: '9', title: 'God Mode', description: 'Maintain a 30-day streak on any habit.', icon: 'fa-eye', requirement: 30, type: 'streaks' },
  { id: '10', title: 'Architect', description: 'Manage 3 active habit protocols.', icon: 'fa-microchip', requirement: 3, type: 'count' },
  { id: '11', title: 'Master Architect', description: 'Manage 5 active habit protocols.', icon: 'fa-city', requirement: 5, type: 'count' },
  { id: '12', title: 'Grand Planner', description: 'Manage 10 active habit protocols.', icon: 'fa-monument', requirement: 10, type: 'count' },
  { id: '13', title: 'Advanced Protocol', description: 'Reach Level 5.', icon: 'fa-medal', requirement: 5, type: 'level' },
  { id: '14', title: 'Transcendent', description: 'Reach Level 10.', icon: 'fa-crown', requirement: 10, type: 'level' },
  { id: '15', title: 'Immortal', description: 'Reach Level 25.', icon: 'fa-infinity', requirement: 25, type: 'level' },
];

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(`habits_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [logs, setLogs] = useState<HabitLog[]>(() => {
    const saved = localStorage.getItem(`logs_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem(`achievements_${user.id}`);
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [showTrophies, setShowTrophies] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#10b981');
  const [newHabitIcon, setNewHabitIcon] = useState('fa-star');
  const [newHabitTime, setNewHabitTime] = useState('08:00');
  const [aiInsight, setAiInsight] = useState<AICoachInsight | null>(null);
  const [xpAnimation, setXpAnimation] = useState<{ id: string; x: number; y: number } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    localStorage.setItem(`habits_${user.id}`, JSON.stringify(habits));
    localStorage.setItem(`logs_${user.id}`, JSON.stringify(logs));
    localStorage.setItem(`achievements_${user.id}`, JSON.stringify(achievements));
  }, [habits, logs, achievements, user.id]);

  // Achievement Engine
  useEffect(() => {
    const totalCompletions = logs.filter(l => l.completed).length;
    const currentLevel = Math.floor((totalCompletions * 10) / 100) + 1;
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => calculateStreak(h.id))) : 0;

    setAchievements(prev => {
      const updated = prev.map(ach => {
        if (ach.unlockedAt) return ach;
        let unlocked = false;
        if (ach.type === 'completions' && totalCompletions >= ach.requirement) unlocked = true;
        if (ach.type === 'streaks' && maxStreak >= ach.requirement) unlocked = true;
        if (ach.type === 'level' && currentLevel >= ach.requirement) unlocked = true;
        if (ach.type === 'count' && habits.length >= ach.requirement) unlocked = true;

        return unlocked ? { ...ach, unlockedAt: new Date().toISOString() } : ach;
      });
      return JSON.stringify(prev) === JSON.stringify(updated) ? prev : updated;
    });
  }, [logs, habits.length]);

  // AI Insight Generation
  useEffect(() => {
    const fetchAiCoachInsight = async () => {
      if (habits.length === 0) {
        setAiInsight({
          tip: "Initiate your first protocol to begin.",
          quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
          focus: "System Initialization"
        });
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const habitContext = habits.map(h => h.name).join(', ');
        const prompt = `You are a futuristic AI habit coach called 'HabitQuest Core'. Based on these active protocols (habits): ${habitContext}. Provide a short motivational quote (sci-fi themed), a specific focus directive for the day, and a quick tip for improvement.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                quote: { type: Type.STRING },
                focus: { type: Type.STRING },
                tip: { type: Type.STRING }
              },
              required: ["quote", "focus", "tip"]
            }
          }
        });

        if (response.text) {
          setAiInsight(JSON.parse(response.text));
        }
      } catch (err) {
        console.error("Coach insight error:", err);
      }
    };

    fetchAiCoachInsight();
  }, [habits.length, user.id]);

  function calculateStreak(habitId: string) {
    let streak = 0;
    const sortedLogs = [...logs]
      .filter(l => l.habitId === habitId && l.completed)
      .sort((a, b) => b.date.localeCompare(a.date));

    let checkDate = new Date();
    // Start checking from yesterday back
    checkDate.setDate(checkDate.getDate() - 1);

    for (const log of sortedLogs) {
      if (log.date === checkDate.toISOString().split('T')[0]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (log.date < checkDate.toISOString().split('T')[0]) {
        break;
      }
    }
    // Add today if completed
    if (isCompleted(habitId, todayStr)) streak++;
    return streak;
  }

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Math.random().toString(36).substring(2, 11),
      userId: user.id,
      name: newHabitName,
      color: newHabitColor,
      icon: newHabitIcon,
      createdAt: new Date().toISOString(),
      preferredTime: newHabitTime,
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setNewHabitColor('#10b981');
    setNewHabitIcon('fa-star');
    setNewHabitTime('08:00');
    setShowAddModal(false);
  };

  const toggleLog = (habitId: string, date: string, e?: React.MouseEvent) => {
    if (date > todayStr) return;

    setLogs(prevLogs => {
      const existingIndex = prevLogs.findIndex((l) => l.habitId === habitId && l.date === date);
      if (existingIndex > -1) {
        const updated = [...prevLogs];
        const prevStatus = updated[existingIndex].completed;
        updated[existingIndex] = { ...updated[existingIndex], completed: !prevStatus };
        return updated;
      } else {
        return [...prevLogs, {
          id: Math.random().toString(36).substr(2, 9),
          habitId, date, completed: true, completedAt: new Date().toISOString()
        }];
      }
    });

    if (e && date === todayStr) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setXpAnimation({ id: Math.random().toString(), x: rect.left + rect.width / 2, y: rect.top });
      setTimeout(() => setXpAnimation(null), 1000);
    }
  };

  const isCompleted = (habitId: string, date: string) => {
    return logs.find((l) => l.habitId === habitId && l.date === date)?.completed || false;
  };

  const isMissed = (habitId: string, date: string) => {
    return date < todayStr && !isCompleted(habitId, date);
  };

  const totalCompletions = logs.filter(l => l.completed).length;
  const currentXP = totalCompletions * 10;
  const currentLevel = Math.floor(currentXP / 100) + 1;
  const xpInCurrentLevel = currentXP % 100;
  const unlockedAchievementsCount = achievements.filter(a => a.unlockedAt).length;

  const dates = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    });
  }, []);

  const monthName = new Date().toLocaleString('default', { month: 'long' });
  const icons = ['fa-star', 'fa-heart', 'fa-fire', 'fa-dumbbell', 'fa-book', 'fa-leaf', 'fa-water', 'fa-medkit', 'fa-brain', 'fa-running'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 min-h-screen text-slate-100 relative overflow-hidden">

      {/* XP Floating Animation */}
      {xpAnimation && (
        <div
          className="fixed z-[999] pointer-events-none font-black text-emerald-400 text-xl animate-bounce"
          style={{ left: xpAnimation.x - 20, top: xpAnimation.y - 40 }}
        >
          +10 XP
        </div>
      )}

      {/* Hero Stats Section */}
      <div className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800/50 p-6 sm:p-8 rounded-[32px] flex flex-col md:flex-row items-center gap-6 sm:gap-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
            <i className="fas fa-gamepad text-[150px]"></i>
          </div>

          <div className="flex-shrink-0 relative">
            <div className="absolute -inset-2 bg-emerald-500/20 blur-xl animate-pulse rounded-full"></div>
            <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-28 sm:h-28 transform -rotate-90 origin-center">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={276.46}
                strokeDashoffset={
                  276.46 - (276.46 * Math.max(0, Math.min(100, xpInCurrentLevel))) / 100
                }
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">LVL</span>
              <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{currentLevel}</span>
            </div>
          </div>

          <div className="flex-grow w-full space-y-4 text-center md:text-left relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-slate-100 flex items-center gap-3">
                  {user.username} <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">PRO_NODE</span>
                </h2>
                <p className="text-[10px] sm:text-xs font-mono text-emerald-500/80 uppercase tracking-widest mt-1">Total XP Generated: {currentXP}</p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Efficiency</span>
                <span className="text-xl font-black text-emerald-400">{xpInCurrentLevel}% Stabilized</span>
              </div>
            </div>
            <div className="w-full bg-slate-800/50 h-4 rounded-full overflow-hidden border border-slate-700/50 p-1 shadow-inner relative">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${xpInCurrentLevel}%` }} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setShowTrophies(true)}
          className="lg:col-span-3 bg-slate-900/60 border border-slate-800/50 p-6 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/40 transition-all group shadow-2xl relative"
        >
          <div className="relative">
            <i className="fas fa-trophy text-4xl text-yellow-500 mb-2 group-hover:scale-110 transition-transform"></i>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg border border-slate-900">
              {unlockedAchievementsCount}
            </span>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Hall of Heroes</h3>
          <p className="text-xs font-bold text-slate-300 mt-1">Unlock Legend Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tighter uppercase">Mission Control</h1>
              <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Current Cycle: {monthName}
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all active:scale-95 text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
            >
              <i className="fas fa-rocket"></i> Launch Habit
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[32px] shadow-3xl overflow-hidden relative group">
            <div className="overflow-x-auto no-scrollbar scroll-smooth">
              <table className="min-w-full divide-y divide-slate-800/50">
                <thead>
                  <tr className="bg-slate-900/90 backdrop-blur-md">
                    <th className="sticky left-0 z-20 bg-slate-900 px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[240px] border-r border-slate-800/50">Protocol_ID</th>
                    {dates.map((date, idx) => (
                      <th key={date} className={`px-2 py-4 text-center min-w-[50px] transition-colors ${date === todayStr ? 'bg-emerald-500/5' : ''}`}>
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] text-slate-600 font-black mb-1 uppercase">{new Date(date).toLocaleString('default', { weekday: 'narrow' })}</span>
                          <span className={`text-[10px] sm:text-xs font-mono w-8 h-8 flex items-center justify-center rounded-lg transition-all ${date === todayStr ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-500'}`}>{idx + 1}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {habits.map((habit) => (
                    <tr key={habit.id} className="hover:bg-slate-800/20 transition-all duration-200 group/row">
                      <td className="sticky left-0 z-20 bg-slate-900 group-hover/row:bg-slate-800/90 px-8 py-6 whitespace-nowrap border-r border-slate-800/50">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: habit.color }}>
                              <i className={`fas ${habit.icon}`}></i>
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-200 uppercase tracking-tight">{habit.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{calculateStreak(habit.id)} DAY STREAK</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setHabitToDelete(habit)} className="p-2 opacity-0 group-hover/row:opacity-100 text-slate-600 hover:text-red-500 transition-all scale-75 hover:scale-100">
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        </div>
                      </td>
                      {dates.map((date) => (
                        <td key={date} className="px-1 py-4 text-center">
                          <button
                            disabled={date > todayStr}
                            onClick={(e) => toggleLog(habit.id, date, e)}
                            className={`w-8 h-8 rounded-xl transition-all duration-300 border-2 flex items-center justify-center group/btn relative ${isCompleted(habit.id, date)
                              ? 'scale-110 border-transparent text-white shadow-xl shadow-emerald-500/10'
                              : isMissed(habit.id, date)
                                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                : 'bg-transparent border-slate-800 hover:border-slate-700'
                              } ${date > todayStr ? 'opacity-10 cursor-not-allowed' : ''}`}
                            style={{
                              backgroundColor: isCompleted(habit.id, date) ? habit.color : undefined
                            }}
                          >
                            {isCompleted(habit.id, date) ? (
                              <i className="fas fa-check text-[10px]"></i>
                            ) : isMissed(habit.id, date) ? (
                              <i className="fas fa-times text-[10px] animate-pulse"></i>
                            ) : null}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                  {habits.length === 0 && (
                    <tr>
                      <td colSpan={dates.length + 1} className="py-20 text-center opacity-30">
                        <i className="fas fa-ghost text-4xl mb-4"></i>
                        <p className="font-mono text-[10px] uppercase tracking-widest">No Active Protocols Found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all"></div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center">
              <i className="fas fa-brain text-blue-500 mr-2"></i> HabitQuest Core
            </h3>
            {aiInsight ? (
              <div className="space-y-6 animate-in fade-in duration-700">
                <p className="text-xs text-slate-300 leading-relaxed font-medium italic">"{aiInsight.quote}"</p>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 border-l-2 border-l-blue-600">
                  <span className="text-[8px] font-black text-blue-500 uppercase block mb-1 tracking-widest">Today's Focus</span>
                  <p className="text-sm font-black text-white uppercase tracking-tight">{aiInsight.focus}</p>
                </div>
                <div className="pt-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">Efficiency Tip</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{aiInsight.tip}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center opacity-30 text-center">
                <i className="fas fa-circle-notch fa-spin text-xl mb-2"></i>
                <span className="text-[8px] font-black uppercase tracking-widest">Processing Data Streams</span>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Current Progress</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Efficiency</span>
                  <span className="text-[10px] font-mono text-emerald-500">{Math.round((logs.filter(l => l.completed).length / Math.max(1, habits.length * 30)) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (logs.filter(l => l.completed).length / Math.max(1, habits.length * 30)) * 100)}%` }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Nodes</span>
                    <span className="text-xl font-black text-white">{habits.length}</span>
                  </div>
                  <div className="text-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">XP</span>
                    <span className="text-xl font-black text-emerald-500">{currentXP}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trophy Room Modal */}
      {showTrophies && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => setShowTrophies(false)}></div>
          <div className="bg-slate-900 w-full max-w-2xl rounded-[48px] border border-slate-800 shadow-3xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-1">
              <div className="bg-slate-950 rounded-[46px] p-8 sm:p-12">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 text-3xl shadow-2xl mx-auto mb-6 border border-yellow-500/20">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Hall of Heroes</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Total Achievements: {unlockedAchievementsCount}/{achievements.length}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {achievements.map((ach) => (
                    <div key={ach.id} className={`p-5 rounded-3xl border transition-all relative overflow-hidden group ${ach.unlockedAt ? 'bg-slate-900 border-yellow-500/30' : 'bg-slate-900/40 border-slate-800 opacity-40 grayscale'}`}>
                      {ach.unlockedAt && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-500 text-slate-950 text-[8px] font-black uppercase rounded-bl-xl shadow-lg">Unlocked</div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-xl ${ach.unlockedAt ? 'bg-yellow-500 text-slate-950' : 'bg-slate-950 text-slate-700'}`}>
                          <i className={`fas ${ach.icon}`}></i>
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{ach.title}</h4>
                          <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-1">{ach.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => setShowTrophies(false)} className="w-full mt-10 py-5 bg-slate-900 text-slate-500 font-black rounded-2xl border border-slate-800 hover:bg-slate-800 transition-colors uppercase text-[10px] tracking-[0.3em]">Exit Archive</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {habitToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setHabitToDelete(null)}></div>
          <div className="bg-slate-900 w-full max-w-md rounded-[40px] border border-red-500/30 shadow-2xl relative z-10 overflow-hidden">
            <div className="p-1">
              <div className="bg-slate-950 rounded-[38px] p-10 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-2xl border border-red-500/20">
                  <i className="fas fa-trash-can animate-bounce"></i>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Terminate Protocol?</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setHabits(h => h.filter(x => x.id !== habitToDelete.id)); setHabitToDelete(null); }} className="w-full py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 uppercase tracking-[0.3em] text-[10px]">Execute Purge</button>
                  <button onClick={() => setHabitToDelete(null)} className="w-full py-5 bg-slate-900 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-[10px]">Abort</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-slate-900 w-full max-w-lg rounded-[40px] border border-slate-800 shadow-3xl relative z-10 overflow-hidden">
            <div className="p-1">
              <div className="bg-slate-950 rounded-[38px] p-10">
                <h3 className="text-xl sm:text-2xl font-black text-slate-100 mb-8 uppercase tracking-tighter text-center">Initialize New Protocol</h3>
                <form onSubmit={addHabit} className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Identity Signature (Icon)</label>
                    <div className="grid grid-cols-5 gap-3">
                      {icons.map(icon => (
                        <button
                          key={icon} type="button" onClick={() => setNewHabitIcon(icon)}
                          className={`h-12 rounded-xl flex items-center justify-center transition-all border-2 ${newHabitIcon === icon ? 'bg-emerald-600 border-transparent text-white shadow-xl shadow-emerald-600/20 scale-110' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                        >
                          <i className={`fas ${icon} text-sm`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <input type="text" autoFocus required value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="DESIGNATION NAME..." className="w-full px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 focus:border-emerald-500 outline-none font-bold placeholder:text-slate-800 uppercase tracking-widest text-sm" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="time" value={newHabitTime} onChange={(e) => setNewHabitTime(e.target.value)} className="w-full px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 focus:border-emerald-500 outline-none font-mono text-sm" />
                      <div className="flex gap-2 justify-between">
                        {['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b'].map(color => (
                          <button key={color} type="button" onClick={() => setNewHabitColor(color)} className={`w-10 h-10 rounded-full border-4 transition-all ${newHabitColor === color ? 'border-white scale-110 shadow-xl' : 'border-transparent opacity-40'}`} style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-grow py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-95 text-[10px] uppercase tracking-[0.3em]">Initialize</button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-5 bg-slate-900 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest">Abort</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;