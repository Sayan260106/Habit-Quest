import React, { createContext, useContext, useState, useEffect } from "react";

interface StatsContextType {
  habits: number;
  currentXP: number;
  currentLevel: number;
}

const StatsContext = createContext<StatsContextType | null>(null);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState(0);
  const [currentXP, setCurrentXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Load from localStorage (your Dashboard already writes there)
  useEffect(() => {
    const allHabitsKeys = Object.keys(localStorage).filter(k => k.startsWith("habits_"));

    if (allHabitsKeys.length > 0) {
      const list = JSON.parse(localStorage.getItem(allHabitsKeys[0]) || "[]");
      setHabits(list.length);
    }

    const allLogsKeys = Object.keys(localStorage).filter(k => k.startsWith("logs_"));

    if (allLogsKeys.length > 0) {
      const logs = JSON.parse(localStorage.getItem(allLogsKeys[0]) || "[]");
      const totalCompletions = logs.filter((l: any) => l.completed).length;

      const xp = totalCompletions * 10;
      setCurrentXP(xp);
      setCurrentLevel(Math.floor(xp / 100) + 1);
    }
  }, []);

  return (
    <StatsContext.Provider value={{ habits, currentXP, currentLevel }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error("useStats must be used inside StatsProvider");
  return ctx;
};
export default StatsContext;