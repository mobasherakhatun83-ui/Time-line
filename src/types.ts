/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  totalXP: number;
  streak: number;
  joinDate: string;
}

export interface FocusSession {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  type: 'Pomodoro' | 'Short Break' | 'Long Break' | 'Custom';
  completedSuccessfully: boolean;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalFocusTime: number; // in minutes
  tasksCompleted: number; // count
  battleWon: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconPath: string; // name of lucide-react icon
  unlockedDate: string | null; // null if locked
  xpReward: number;
  category?: string;
  condition?: string;
}

export interface RoutineItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface Routine {
  id: string;
  name: string;
  time: string; // HH:MM
  items: RoutineItem[];
  streak: number;
  completedToday: boolean;
}

export interface TimeSlot {
  id: string;
  time: string; // HH:MM
  label: string;
  category: 'Focus' | 'Class' | 'Exercise' | 'Routine' | 'Leisure';
}

export interface Schedule {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  timeSlots: TimeSlot[];
}

export interface Alarm {
  id: string;
  time: string; // HH:MM
  days: string[]; // e.g. ["Mon", "Wed", "Fri"]
  mission: 'None' | 'Math Quiz' | 'Shake Phone' | 'Typing Test';
  sound: string;
  active: boolean;
}

export interface MindBattle {
  date: string; // YYYY-MM-DD
  yesterdayScore: number; // calculated score
  todayScore: number;
  status: 'PENDING' | 'WON' | 'LOST';
}

// Global Application State represented locally
export interface AppState {
  user: UserProfile;
  sessions: FocusSession[];
  stats: Record<string, DailyStats>;
  badges: Badge[];
  routines: Routine[];
  schedules: Schedule[];
  alarms: Alarm[];
  battles: Record<string, MindBattle>;
}
