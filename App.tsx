import React, { useState, useEffect } from 'react';
import { LoginForm } from './pages/LoginPage';
import { MotivationCard } from './pages/MotivationCard';
import { getDailyMotivation } from './geminiService';
import { Shield, Sword, Trophy, Sparkles } from 'lucide-react';
import { StatsProvider, useStats } from "./pages/StatsContext";

const App: React.FC = () => {
  const [motivation, setMotivation] = useState<string>('Prepare for today\'s journey...');
  const [loadingMotivation, setLoadingMotivation] = useState(true);
  const { habits, currentXP, currentLevel } = useStats();
  useEffect(() => {
    const fetchMotivation = async () => {
      try {
        const text = await getDailyMotivation();
        setMotivation(text);
      } catch (error) {
        setMotivation("Your quest awaits. Every step counts toward greatness.");
      } finally {
        setLoadingMotivation(false);
      }
    };
    fetchMotivation();
  }, []);

  return (
    <StatsProvider>
      <div className="min-h-screen w-full relative overflow-hidden flex flex-col md:flex-row bg-[#020617]">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Left Content Section - Hero/Branding */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative z-10">
          <div className="animate-float">
            <div className="relative">
              <Trophy className="w-32 h-32 text-yellow-500 mb-8 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-yellow-300 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-6xl font-quest text-white text-center mb-6 tracking-wider">
            HABIT <span className="text-indigo-500">QUEST</span>
          </h1>
          <p className="text-slate-400 text-lg text-center max-w-md mb-12 leading-relaxed">
            The RPG where your daily tasks are the missions, and your habits are the skill tree. 
            Ready to level up your reality? 
            Start your Solo Leveling today!❤️‍🔥
          </p>

          <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
            <FeatureIcon icon={<Shield className="w-6 h-6" />} label="Consistency" value={currentLevel} />
            <FeatureIcon icon={<Sword className="w-6 h-6" />} label="Daily Quests" value={habits} />
            <FeatureIcon icon={<Trophy className="w-6 h-6" />} label="Total XP" value={currentXP} />
          </div>
        </div>

        {/* Right Content Section - Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10 bg-slate-950/40 border-l border-white/5 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <div className="md:hidden flex flex-col items-center mb-10">
              <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
              <h1 className="text-3xl font-quest text-white tracking-widest">HABIT QUEST</h1>
            </div>
            
            <div className="mb-8">
              <MotivationCard text={motivation} isLoading={loadingMotivation} />
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-slate-500 text-sm">
              Don't have an account? 
              <button className="ml-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Start your adventure
              </button>
            </p>
          </div>
        </div>
      </div>
    </StatsProvider>
  );
};

const FeatureIcon: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/20 transition-all cursor-default">
    <div className="text-indigo-400 mb-2">{icon}</div>
    <span className="text-xs text-slate-500 uppercase tracking-tighter">{label}</span>
    <span className="text-sm font-bold text-white">{value}</span>
  </div>
);
export default App;