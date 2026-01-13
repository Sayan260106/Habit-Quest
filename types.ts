
export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: number;
  type: 'completions' | 'streaks' | 'level' | 'count';
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  preferredTime?: string; // HH:MM format
  description?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type TimeRange = 'daily' | 'monthly' | 'yearly';

export interface AICoachInsight {
  tip: string;
  quote: string;
  focus: string;
}

export interface DeepAnalysisResult {
  patterns: string[];
  streakBreaks: string;
  productiveTime: string;
  riskyDays: string;
  likelyReasons: string[];
  suggestions: string[];
}

export interface WeeklyReport {
  strongestHabits: Array<{ name: string; why: string }>;
  weakestHabits: Array<{ name: string; why: string }>;
  trendChanges: string;
  consistencyPercentage: number;
  motivationAnalysis: string;
  summary: string;
}

export interface CoachInteraction {
  date: string;
  completedHabitIds: string[];
  obstacles: string;
  mood: string;
  coachResponse: string;
  suggestion: string;
}

export interface SmartReminder {
  habitId: string;
  habitName: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
}
