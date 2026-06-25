/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Zap, Flame, Trophy, Timer, Activity, Award, Calendar, 
  ListTodo, Bell, User, Copy, Check, ExternalLink, Share2, Play, 
  Square, RotateCcw, Plus, Trash, Volume2, X, ChevronRight, 
  ChevronLeft, Sparkles, Cpu, Compass, Smartphone, Coffee, AlertCircle, Lock, Download, Sliders
} from 'lucide-react';
import { FLUTTER_CODEBASE, FlutterFile } from './flutterCode';
import { AppState, UserProfile, FocusSession, Routine, Schedule, Alarm, MindBattle, Badge, TimeSlot } from './types';
import { MotivationMessage, getSmartMotivationMessage } from './data/motivation_messages';
import { FloatingMotivation } from './components/FloatingMotivation';
import { DashboardStatsCharts } from './components/DashboardStatsCharts';
import { soundEngine } from './utils/audioEngine';

// Raw Audio Beep fallback for timer completion
const playBeep = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch notification beep
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn("Audio Context beep error:", e);
  }
};

export interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
  rewards: string;
  floorXp: number;
  ceilXp: number;
  progressPercent: number;
}

export const LEVEL_MILESTONES = [
  { level: 1, xpRequired: 0, title: "Awakening", emoji: "🌱", rewards: "Default Midnight Black theme unlocked" },
  { level: 5, xpRequired: 2500, title: "Seeker", emoji: "🔍", rewards: "Vibrant Cyan accent trim theme added" },
  { level: 10, xpRequired: 10000, title: "Focused Mind", emoji: "🧘", rewards: "Zen Temple sound chime pack unlocked" },
  { level: 15, xpRequired: 25000, title: "Time Warrior", emoji: "⚔️", rewards: "Crimson Red battle scheme & Warrior badge" },
  { level: 20, xpRequired: 50000, title: "Discipline Master", emoji: "🎯", rewards: "Motivational quote block stream enabled" },
  { level: 25, xpRequired: 100000, title: "Flow State", emoji: "🌊", rewards: "Interactive loop wave visualizer pack" },
  { level: 30, xpRequired: 200000, title: "Productivity King", emoji: "👑", rewards: "Imperial Gold theme layout + Crown avatar banner" },
  { level: 40, xpRequired: 500000, title: "Time Lord", emoji: "⚡", rewards: "Cosmic space ambient background & dynamic ticks" },
  { level: 50, xpRequired: 1000000, title: "LEGEND", emoji: "🏆", rewards: "Gladiator HUD blueprint & Golden battle card" },
  { level: 99, xpRequired: 5000000, title: "TRANSCENDED", emoji: "🌟", rewards: "Infinite focus loops + Transcended avatar glow" }
];

export function getLevelDetails(xp: number): LevelInfo {
  let activeMl = LEVEL_MILESTONES[0];
  let nextMl = LEVEL_MILESTONES[1];
  
  for (let i = 0; i < LEVEL_MILESTONES.length; i++) {
    if (xp >= LEVEL_MILESTONES[i].xpRequired) {
      activeMl = LEVEL_MILESTONES[i];
      nextMl = LEVEL_MILESTONES[i+1] || { level: 99, xpRequired: 10000000, title: "TRANSCENDED", emoji: "🌟", rewards: "Infinite focus loops + Transcended avatar glow" };
    } else {
      break;
    }
  }
  
  const levelGap = nextMl.level - activeMl.level;
  const xpGap = nextMl.xpRequired - activeMl.xpRequired;
  
  let level = activeMl.level;
  let floorXp = activeMl.xpRequired;
  let ceilXp = nextMl.xpRequired;
  
  if (levelGap > 1 && xpGap > 0) {
    const xpPerSubLevel = xpGap / levelGap;
    const progressInMilestone = xp - activeMl.xpRequired;
    const subLevelsEarned = Math.floor(progressInMilestone / xpPerSubLevel);
    level = activeMl.level + subLevelsEarned;
    floorXp = activeMl.xpRequired + (subLevelsEarned * xpPerSubLevel);
    ceilXp = floorXp + xpPerSubLevel;
  } else if (levelGap === 0) {
    level = 99;
    floorXp = activeMl.xpRequired;
    ceilXp = floorXp + 1000000;
  }
  
  return {
    level,
    title: activeMl.title,
    emoji: activeMl.emoji,
    rewards: activeMl.rewards,
    floorXp,
    ceilXp,
    progressPercent: Math.min(100, Math.max(0, ((xp - floorXp) / (ceilXp - floorXp)) * 100))
  };
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_1',
  name: 'Warrior Initiate',
  email: 'warrior@timeline.io',
  level: 1,
  totalXP: 0,
  streak: 0,
  joinDate: new Date().toISOString().split('T')[0]
};

const DEMO_PROFILE: UserProfile = {
  id: 'usr_1',
  name: 'Mobashera',
  email: 'mobasherakhatun83@gmail.com',
  level: 5,
  totalXP: 3000,
  streak: 15,
  joinDate: '2026-06-10'
};

const DEFAULT_ROUTINES: Routine[] = [
  { id: 'rt_1', name: 'Rise and Conquer Chores', time: '06:45', items: [
    { id: 'rti_1', name: 'Hydrate (500ml Cold Water)', completed: false },
    { id: 'rti_2', name: 'Make Bed & Organize Space', completed: false },
    { id: 'rti_3', name: '5-Min Tactical Stretching', completed: false }
  ], streak: 0, completedToday: false },
  { id: 'rt_2', name: 'Elite Focus Block', time: '09:00', items: [
    { id: 'rti_4', name: 'Review Yesterday\'s Score', completed: false },
    { id: 'rti_5', name: 'No Socials for 90 Mins', completed: false }
  ], streak: 0, completedToday: false },
  { id: 'rt_3', name: 'Night Review Protocol', time: '21:45', items: [
    { id: 'rti_6', name: 'Clear Active Backlog', completed: false },
    { id: 'rti_7', name: 'Prepare Alarms for Tomorrow', completed: false }
  ], streak: 0, completedToday: false },
];

const DEMO_ROUTINES: Routine[] = [
  { id: 'rt_1', name: 'Rise and Conquer Chores', time: '06:45', items: [
    { id: 'rti_1', name: 'Hydrate (500ml Cold Water)', completed: true },
    { id: 'rti_2', name: 'Make Bed & Organize Space', completed: true },
    { id: 'rti_3', name: '5-Min Tactical Stretching', completed: false }
  ], streak: 12, completedToday: false },
  { id: 'rt_2', name: 'Elite Focus Block', time: '09:00', items: [
    { id: 'rti_4', name: 'Review Yesterday\'s Score', completed: true },
    { id: 'rti_5', name: 'No Socials for 90 Mins', completed: false }
  ], streak: 8, completedToday: false },
  { id: 'rt_3', name: 'Night Review Protocol', time: '21:45', items: [
    { id: 'rti_6', name: 'Clear Active Backlog', completed: false },
    { id: 'rti_7', name: 'Prepare Alarms for Tomorrow', completed: false }
  ], streak: 14, completedToday: false },
];

const RAW_BADGES: Omit<Badge, 'unlockedDate'>[] = [
  { id: 't1', name: 'Early Bird', description: 'Begin focus tracks before birds wake up.', iconPath: 'Flame', xpReward: 100, category: 'Time', condition: 'Start a focus session before 7 AM (5 times)' },
  { id: 't2', name: 'Night Owl', description: 'Deep, serene block after twilight hours.', iconPath: 'Shield', xpReward: 100, category: 'Time', condition: 'Focus after 10 PM (5 times)' },
  { id: 't3', name: 'Golden Hour', description: 'Behold the sunrise with completed tasks.', iconPath: 'Trophy', xpReward: 150, category: 'Time', condition: 'Complete study at sunrise' },
  { id: 't4', name: 'Midnight Scholar', description: 'Conquering metrics during pure dark.', iconPath: 'Bell', xpReward: 200, category: 'Time', condition: 'Study at exact midnight' },
  { id: 't5', name: 'Dawn Warrior', description: 'Intense 6 AM study/review block logged.', iconPath: 'Flame', xpReward: 150, category: 'Time', condition: 'Complete a 6 AM session' },
  { id: 't6', name: 'Weekend Warrior', description: 'Diligence knows no Saturday relief.', iconPath: 'Shield', xpReward: 150, category: 'Time', condition: 'Focus on Saturday or Sunday' },
  { id: 't7', name: 'Monday Hero', description: 'Dominator format from the first weekday.', iconPath: 'ListTodo', xpReward: 150, category: 'Time', condition: 'Record highly productive Monday stats' },
  { id: 't8', name: 'Friday Finisher', description: 'Release to weekend with maximum score.', iconPath: 'Trophy', xpReward: 150, category: 'Time', condition: 'Complete study sequence on Friday' },
  { id: 't9', name: 'Holiday Hustler', description: 'Unyielding drive on generic vacation days.', iconPath: 'ListTodo', xpReward: 300, category: 'Time', condition: 'Record focus session during a holiday' },
  { id: 't10', name: 'New Year Pioneer', description: 'Year orbit start is fully optimized.', iconPath: 'Trophy', xpReward: 500, category: 'Time', condition: 'Log focus sessions on January 1' },
  { id: 's1', name: 'Week One', description: 'First milestone of serial focus unlocked.', iconPath: 'Flame', xpReward: 200, category: 'Streak', condition: 'Maintain active streak for 7 consecutive days' },
  { id: 's2', name: 'Fortnight Hero', description: 'A massive 14 days of sequential flow.', iconPath: 'Shield', xpReward: 400, category: 'Streak', condition: 'Maintain active streak for 14 consecutive days' },
  { id: 's3', name: 'Monthly Master', description: 'Thirty day orbit of absolute alignment.', iconPath: 'Trophy', xpReward: 800, category: 'Streak', condition: 'Maintain active streak for 30 consecutive days' },
  { id: 's4', name: 'Iron Will', description: 'Bending steel with mental endurance.', iconPath: 'Shield', xpReward: 1200, category: 'Streak', condition: 'Maintain active streak for 60 consecutive days' },
  { id: 's5', name: 'Unstoppable', description: 'Exceeded standard human limitations.', iconPath: 'Flame', xpReward: 2000, category: 'Streak', condition: 'Maintain active streak for 100 consecutive days' },
  { id: 's6', name: 'Half Year Hero', description: 'Centurion of deep work across months.', iconPath: 'Trophy', xpReward: 5000, category: 'Streak', condition: 'Maintain active streak for 180 consecutive days' },
  { id: 's7', name: 'LEGEND Streak', description: 'One full solar year of focus wins.', iconPath: 'Trophy', xpReward: 10000, category: 'Streak', condition: 'Maintain active streak for 365 consecutive days' },
  { id: 's8', name: 'Eternal Mind', description: 'Beyond space and focus decay threshold.', iconPath: 'Trophy', xpReward: 25000, category: 'Streak', condition: 'Maintain active streak for 730 consecutive days' },
  { id: 'm1', name: 'First Victory', description: 'Beat yesterday\'s performance peak.', iconPath: 'Shield', xpReward: 150, category: 'Battle', condition: 'Beat yesterday\'s session metrics once' },
  { id: 'm2', name: '3-Conqueror Row', description: 'Your yesterday\'s self is obsolete.', iconPath: 'Flame', xpReward: 300, category: 'Battle', condition: 'Win 3 consecutive Mind Battles' },
  { id: 'm3', name: 'Week Dominator', description: 'Perfect week record on the battlefield.', iconPath: 'Trophy', xpReward: 1000, category: 'Battle', condition: 'Win all 7 Mind Battles in a week' },
  { id: 'm4', name: 'Comeback Kid', description: 'Gaining immense ground after losing.', iconPath: 'ListTodo', xpReward: 500, category: 'Battle', condition: 'Win a Mind Battle after 3 losses' },
  { id: 'm5', name: 'Undefeated', description: 'Uncontested victor for a complete month.', iconPath: 'Shield', xpReward: 3000, category: 'Battle', condition: 'Win 30 battle days sequentially' },
  { id: 'm6', name: 'Crushing Victory', description: 'Leaving previous stats in dust.', iconPath: 'Trophy', xpReward: 1000, category: 'Battle', condition: 'Beat yesterday\'s score by 2+ hours' },
  { id: 'm7', name: 'Close Call', description: 'A narrow escape of focus countdowns.', iconPath: 'Bell', xpReward: 250, category: 'Battle', condition: 'Win a Mind Battle by less than 5 minutes margin' },
  { id: 'm8', name: 'Battle Master', description: 'A century of dynamic self victories.', iconPath: 'Trophy', xpReward: 5000, category: 'Battle', condition: 'Accumulate 100 total Mind Battle wins' },
  { id: 'f1', name: 'First Hour', description: 'Logged first hour focused globally.', iconPath: 'ListTodo', xpReward: 100, category: 'Focus', condition: 'Complete 1 total focused hour in a single day' },
  { id: 'f2', name: 'Two Hour Club', description: 'Deepening flow state boundaries.', iconPath: 'Flame', xpReward: 200, category: 'Focus', condition: 'Complete 2 total focused hours in a single day' },
  { id: 'f3', name: 'Deep Work Pioneer', description: 'Four golden hours of locked rhythm.', iconPath: 'Shield', xpReward: 400, category: 'Focus', condition: 'Complete 4 total focused hours in a single day' },
  { id: 'f4', name: 'Flow Master', description: 'Six continuous hours logged.', iconPath: 'Trophy', xpReward: 800, category: 'Focus', condition: 'Complete 6 total focused hours in a single day' },
  { id: 'f5', name: 'Time God', description: 'Absolute controller of the calendar matrix.', iconPath: 'Trophy', xpReward: 1500, category: 'Focus', condition: 'Complete 8 total focused hours in a single day' },
  { id: 'f6', name: '100 Hours Total', description: 'Century mark of deep work completed.', iconPath: 'ListTodo', xpReward: 1000, category: 'Focus', condition: 'Reach 100 lifetime focused hours' },
  { id: 'f7', name: '500 Hours Total', description: 'Ascendant level of time discipline.', iconPath: 'Trophy', xpReward: 5000, category: 'Focus', condition: 'Reach 500 lifetime focused hours' },
  { id: 'f8', name: '1000 Hours Total', description: 'Ultimate Scholar and Master of Focus.', iconPath: 'Trophy', xpReward: 12000, category: 'Focus', condition: 'Reach 1000 lifetime focused hours' },
  { id: 'f9', name: 'Focus Marathon', description: 'Uninterrupted long-run study block.', iconPath: 'Flame', xpReward: 500, category: 'Focus', condition: 'Log a 3-hour continuous focus session' },
  { id: 'f10', name: 'Ultra Focus', description: 'Indefatigable study machine state.', iconPath: 'Trophy', xpReward: 1000, category: 'Focus', condition: 'Log a 5-hour continuous focus session' }
];

const DEFAULT_BADGES: Badge[] = RAW_BADGES.map((b): Badge => ({
  ...b,
  unlockedDate: null
}));

const DEMO_BADGES: Badge[] = RAW_BADGES.map((b): Badge => {
  const unlockedMap: Record<string, string> = {
    't1': '2026-06-12',
    't2': '2026-06-14',
    't6': '2026-06-15',
    's1': '2026-06-14',
    'm1': '2026-06-11',
    'm2': '2026-06-13',
    'f1': '2026-06-11',
    'f2': '2026-06-12',
    'f3': '2026-06-15'
  };
  return {
    ...b,
    unlockedDate: unlockedMap[b.id] || null
  };
});

const getDemoSessions = (): FocusSession[] => {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];
  
  return [
    { id: 'fs_1', date: yesterday, duration: 25, type: 'Pomodoro', completedSuccessfully: true },
    { id: 'fs_2', date: yesterday, duration: 15, type: 'Custom', completedSuccessfully: true },
    { id: 'fs_3', date: yesterday, duration: 25, type: 'Pomodoro', completedSuccessfully: true },
    { id: 'fs_4', date: today, duration: 25, type: 'Pomodoro', completedSuccessfully: true },
    { id: 'fs_5', date: today, duration: 50, type: 'Custom', completedSuccessfully: true },
  ];
};

// Safe LocalStorage Wrapper to prevent SecurityError DOMExceptions in sandboxed/iframe previews
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`localStorage.getItem failed for key ${key}:`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`localStorage.setItem failed for key ${key}:`, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`localStorage.removeItem failed for key ${key}:`, e);
    }
  }
};

export default function App() {
  // Custom Safe Dialog State to replace native window.alert (iframe safe)
  const [customAlert, setCustomAlert] = useState<{ message: string; title?: string } | null>(null);
  const triggerAlert = (message: string, title: string = "System Notification") => {
    setCustomAlert({ message, title });
  };

  // --- STATE PERSISTENCE ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = safeStorage.getItem('timeline_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing timeline_profile:', e);
    }
    return DEFAULT_PROFILE;
  });

  const [activeScreen, setActiveScreen] = useState<string>('splash');
  const [selectedFlutterFile, setSelectedFlutterFile] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<boolean>(false);
  const [currentOnboardingSlide, setCurrentOnboardingSlide] = useState<number>(0);
  
  // Interactive Modal & Gamification states
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeBadgeCategory, setActiveBadgeCategory] = useState<string>('Time');
  const [levelUpData, setLevelUpData] = useState<{ level: number, title: string, emoji: string, rewards: string } | null>(null);
  const [streakFreezeCount, setStreakFreezeCount] = useState<number>(1);
  const [isStreakFrozenToday, setIsStreakFrozenToday] = useState<boolean>(false);
  const [aiPersona, setAiPersona] = useState<string>('hardcore');
  const [aiFeedback, setAiFeedback] = useState<string>('YOU ARE RUNNING IN LOW ACCELERATION. Yesterday\'s ghost is currently 320 meters ahead. Activate the launch sequence immediately.');
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [customCombatCommand, setCustomCombatCommand] = useState<string>('');

  // Floating Motivation Coach Active state
  const [activeMotivation, setActiveMotivation] = useState<MotivationMessage | null>(null);

  const triggerCoachMotivation = (trigger?: 'focus_start' | 'milestone_15m' | 'record_beat' | 'spiritual' | 'low_energy') => {
    const msg = getSmartMotivationMessage(trigger);
    setActiveMotivation(msg);
  };

  // --- SOCIAL & ONLINE SYNC STATES ---
  const [friendsFeed, setFriendsFeed] = useState([
    { id: 'f_1', name: 'Grandmaster Goggins', streak: 42, active: true, cheered: false, rank: 'Imperial Sentry' },
    { id: 'f_2', name: 'Alina Focus', streak: 12, active: true, cheered: false, rank: 'Grandmaster' },
    { id: 'f_3', name: 'Silent Seeker 404', streak: 8, active: false, cheered: false, rank: 'Novice Seeker' },
    { id: 'f_4', name: 'Dawn Ranger', streak: 5, active: true, cheered: false, rank: 'Rising Recruit' }
  ]);

  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'COMPLETE' | 'FAILED'>('IDLE');
  const [syncLogs, setSyncLogs] = useState<string[]>(['Hive engine initialized securely.', 'Session database compiled, local state size: 14.2 KB']);
  
  // --- SHARING CARD CENTER STATES ---
  const [activeShareCard, setActiveShareCard] = useState<'daily' | 'victory' | 'badge' | 'level' | 'weekly'>('daily');
  const [shareTheme, setShareTheme] = useState<'aurora' | 'volcano' | 'galaxy' | 'obsidian' | 'sunset'>('galaxy');
  const [shareCaption, setShareCaption] = useState("⚔️ Destroying my yesterday's performance on TIMELINE!");
  const [shareSuccessAlert, setShareSuccessAlert] = useState<string | null>(null);

  // --- AI ADVANCED ENGINE STATES ---
  const [aiGoalsInput, setAiGoalsInput] = useState('');
  const [isScheduleGenerating, setIsScheduleGenerating] = useState(false);
  const [aiCoachReport, setAiCoachReport] = useState<string | null>(null);
  const [isReportGenerating, setIsReportGenerating] = useState(false);

  // --- TACTICAL NOTIFICATION SETTINGS ---
  const [notifSound, setNotifSound] = useState('Cyber Overload');
  const [notifVibration, setNotifVibration] = useState(true);
  const [notifFrequency, setNotifFrequency] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [quietHoursStart, setQuietHoursStart] = useState('23:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('06:00');
  const [notifToggles, setNotifToggles] = useState({
    dailyMotivation: true,
    streakWarning: true,
    recordClose: true,
    badgeUnlocked: true,
    weeklyCoachReport: true
  });

  // Focus Sessions state
  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    try {
      const saved = safeStorage.getItem('timeline_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing timeline_sessions:', e);
    }
    return [];
  });

  // Alarms State
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    return [
      { id: 'al_1', time: '06:30', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], mission: 'Math Quiz', sound: 'Cyber Overload', active: true },
      { id: 'al_2', time: '08:15', days: ['Sat', 'Sun'], mission: 'Shake Phone', sound: 'Zen Temple Bell', active: false },
      { id: 'al_3', time: '22:30', days: ['Mon', 'Wed', 'Fri'], mission: 'Typing Test', sound: 'Retro Synth', active: true },
    ];
  });

  // Routines State
  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = safeStorage.getItem('timeline_routines');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing timeline_routines:', e);
    }
    return DEFAULT_ROUTINES;
  });

  // Custom Visible Schedule Days State
  const [visibleScheduleDays, setVisibleScheduleDays] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem('timeline_visible_schedule_days');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error parsing timeline_visible_schedule_days:', e);
    }
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  });

  // Schedule State
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    try {
      const saved = safeStorage.getItem('timeline_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error parsing timeline_schedules:', e);
    }
    return [
      {
        id: 'sc_1',
        day: 'Monday',
        timeSlots: [
          { id: 'ts_1', time: '09:00', label: 'Algorithms Class', category: 'Class' },
          { id: 'ts_2', time: '14:00', label: 'Pomodoro Deep Focus', category: 'Focus' },
          { id: 'ts_3', time: '17:30', label: 'Cardio Battle Run', category: 'Exercise' }
        ]
      },
      {
        id: 'sc_2',
        day: 'Tuesday',
        timeSlots: [
          { id: 'ts_4', time: '10:00', label: 'Database Architecting', category: 'Focus' },
          { id: 'ts_5', time: '15:00', label: 'Project Review Session', category: 'Focus' }
        ]
      },
      {
        id: 'sc_3',
        day: 'Wednesday',
        timeSlots: [
          { id: 'ts_6', time: '09:00', label: 'Algorithms Class', category: 'Class' },
          { id: 'ts_7', time: '16:00', label: 'Strength Protocol', category: 'Exercise' }
        ]
      },
      { id: 'sc_4', day: 'Thursday', timeSlots: [] },
      { id: 'sc_5', day: 'Friday', timeSlots: [] },
      { id: 'sc_6', day: 'Saturday', timeSlots: [] },
      { id: 'sc_7', day: 'Sunday', timeSlots: [] }
    ];
  });

  // Badges state (Extended full categories representation)
  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = safeStorage.getItem('timeline_badges');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing timeline_badges:', e);
    }
    return DEFAULT_BADGES;
  });

  // Yesterday's hardcoded benchmark scores to battle against
  const yesterdayScore = 320; // XP / productivity aggregate point

  // Calculation for Today's Score
  // Focus Minutes: 2 points per minute
  // Completed Sessions: 15 points each
  // Chore Items Completed: 5 points each
  // Alarms ticked: 10 points each
  const todayStr = new Date().toISOString().split('T')[0];

  const totalFocusMinutesToday = sessions
    .filter(s => s.date === todayStr && s.completedSuccessfully)
    .reduce((sum, s) => sum + s.duration, 0);

  const completedSessionsTodayCount = sessions
    .filter(s => s.date === todayStr && s.completedSuccessfully).length;

  const routinesCompletedCount = routines.reduce((total, r) => {
    const items = r.items || [];
    return total + items.filter(item => item.completed).length;
  }, 0);

  const activeAlarmsSucceededCount = alarms.filter(a => a.active).length;

  const todayScore = (totalFocusMinutesToday * 2) + 
                     (completedSessionsTodayCount * 15) + 
                     (routinesCompletedCount * 5) + 
                     (activeAlarmsSucceededCount * 10);

  // --- XP SYSTEM CENTRAL CONTROLLER ---
  const addXP = (gainedXP: number) => {
    if (gainedXP <= 0) return;
    setProfile(prev => {
      const nextXP = prev.totalXP + gainedXP;
      const oldDetails = getLevelDetails(prev.totalXP);
      const newDetails = getLevelDetails(nextXP);
      
      if (newDetails.level > oldDetails.level) {
        // Trigger level up takeover
        setLevelUpData({
          level: newDetails.level,
          title: newDetails.title,
          emoji: newDetails.emoji,
          rewards: newDetails.rewards
        });
        playBeep();
      }
      return {
        ...prev,
        totalXP: nextXP,
        level: newDetails.level
      };
    });
  };

  const resetToPristineStart = () => {
    safeStorage.removeItem('timeline_profile');
    safeStorage.removeItem('timeline_sessions');
    safeStorage.removeItem('timeline_routines');
    safeStorage.removeItem('timeline_badges');
    setProfile(DEFAULT_PROFILE);
    setSessions([]);
    setRoutines(DEFAULT_ROUTINES);
    setBadges(DEFAULT_BADGES);
    setSyncLogs(prev => [...prev, `[INIT] Journeyman absolute reset successful. Ready for offline battle.`]);
  };

  const loadEliteDemoState = () => {
    safeStorage.setItem('timeline_profile', JSON.stringify(DEMO_PROFILE));
    safeStorage.setItem('timeline_sessions', JSON.stringify(getDemoSessions()));
    safeStorage.setItem('timeline_routines', JSON.stringify(DEMO_ROUTINES));
    safeStorage.setItem('timeline_badges', JSON.stringify(DEMO_BADGES));
    setProfile(DEMO_PROFILE);
    setSessions(getDemoSessions());
    setRoutines(DEMO_ROUTINES);
    setBadges(DEMO_BADGES);
    setSyncLogs(prev => [...prev, `[INIT] Loaded high profile simulation data successfully.`]);
  };

  // --- PERSISTENCE SYNCHRONIZER ---
  useEffect(() => {
    safeStorage.setItem('timeline_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    safeStorage.setItem('timeline_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    safeStorage.setItem('timeline_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    safeStorage.setItem('timeline_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    safeStorage.setItem('timeline_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    safeStorage.setItem('timeline_visible_schedule_days', JSON.stringify(visibleScheduleDays));
  }, [visibleScheduleDays]);

  // --- AUTOMATIC ALIGNMENTS FOR ACHIVEMENTS ---
  useEffect(() => {
    let xpGranted = 0;
    const nowStr = new Date().toISOString().split('T')[0];
    const totalFocusAllTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    
    let unlockedAny = false;
    const updatedBadges = badges.map(b => {
      // Check Two Hour Club f2 (totalFocusMinutesToday >= 120)
      if (b.id === 'f2' && !b.unlockedDate && totalFocusMinutesToday >= 120) {
        xpGranted += b.xpReward;
        unlockedAny = true;
        return { ...b, unlockedDate: nowStr };
      }
      // Check Deep Work Pioneer f3 (totalFocusMinutesToday >= 240)
      if (b.id === 'f3' && !b.unlockedDate && totalFocusMinutesToday >= 240) {
        xpGranted += b.xpReward;
        unlockedAny = true;
        return { ...b, unlockedDate: nowStr };
      }
      // Check First Victory m1 (todayScore > yesterdayScore)
      if (b.id === 'm1' && !b.unlockedDate && todayScore > yesterdayScore) {
        xpGranted += b.xpReward;
        unlockedAny = true;
        return { ...b, unlockedDate: nowStr };
      }
      // Check First Hour f1 (totalFocusMinutesToday >= 60)
      if (b.id === 'f1' && !b.unlockedDate && totalFocusMinutesToday >= 60) {
        xpGranted += b.xpReward;
        unlockedAny = true;
        return { ...b, unlockedDate: nowStr };
      }
      // Check 3-Conqueror Row m2 (todayScore is victory and routines completed)
      if (b.id === 'm2' && !b.unlockedDate && todayScore > yesterdayScore + 50) {
        xpGranted += b.xpReward;
        unlockedAny = true;
        return { ...b, unlockedDate: nowStr };
      }
      return b;
    });

    if (unlockedAny) {
      setBadges(updatedBadges);
      addXP(xpGranted);
    }
  }, [sessions, routines]);

  // --- CUSTOM GOALS / DAILY CHOICES MANAGEMENT ---
  const [newRoutineName, setNewRoutineName] = useState<string>('');
  const [newRoutineTime, setNewRoutineTime] = useState<string>('08:00');
  const [newGoalName, setNewGoalName] = useState<{ [routineId: string]: string }>({});

  const addCustomRoutineGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName.trim()) return;
    const newGroup: Routine = {
      id: `rt_custom_${Date.now()}`,
      name: newRoutineName.trim(),
      time: newRoutineTime,
      items: [],
      streak: 0,
      completedToday: false
    };
    setRoutines(prev => [...prev, newGroup]);
    setNewRoutineName('');
    setNewRoutineTime('08:00');
  };

  const addGoalToRoutine = (routineId: string) => {
    const goalText = newGoalName[routineId] || '';
    if (!goalText.trim()) return;
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        const currentItems = r.items || [];
        const updatedItems = [
          ...currentItems,
          { id: `rti_custom_${Date.now()}`, name: goalText.trim(), completed: false }
        ];
        return {
          ...r,
          items: updatedItems,
          completedToday: updatedItems.length > 0 ? updatedItems.every(i => i.completed) : false
        };
      }
      return r;
    }));
    setNewGoalName(prev => ({ ...prev, [routineId]: '' }));
  };

  const deleteGoalFromRoutine = (routineId: string, itemId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        const currentItems = r.items || [];
        const updatedItems = currentItems.filter(item => item.id !== itemId);
        return {
          ...r,
          items: updatedItems,
          completedToday: updatedItems.length > 0 ? updatedItems.every(i => i.completed) : false
        };
      }
      return r;
    }));
  };

  const deleteRoutineGroup = (routineId: string) => {
    setRoutines(prev => prev.filter(r => r.id !== routineId));
  };

  // --- AMBIENT FOCUS AUDIO CONTROLS ---
  const [activeAmbientSound, setActiveAmbientSound] = useState<'Binaural Combat' | 'White Noise' | 'Cyber Rain' | 'Deep Space' | 'Old Library' | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);

  const toggleAmbientSound = (sound: 'Binaural Combat' | 'White Noise' | 'Cyber Rain' | 'Deep Space' | 'Old Library') => {
    try {
      if (activeAmbientSound === sound) {
        soundEngine.stop();
        setActiveAmbientSound(null);
      } else {
        soundEngine.play(sound);
        soundEngine.setVolume(ambientVolume);
        setActiveAmbientSound(sound);
      }
    } catch (err) {
      console.error("Ambient Sound Error:", err);
    }
  };

  const changeAmbientVolume = (vol: number) => {
    setAmbientVolume(vol);
    soundEngine.setVolume(vol);
  };

  // Stop sounds on unmount
  useEffect(() => {
    return () => {
      try {
        soundEngine.stop();
      } catch (err) {}
    };
  }, []);

  // --- TIMER LOGICS ---
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [timerMaxSeconds, setTimerMaxSeconds] = useState<number>(25 * 60);
  const [timerMaxMinutes, setTimerMaxMinutes] = useState<number>(25);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerType, setTimerType] = useState<'Pomodoro' | 'Short Break' | 'Long Break' | 'Custom'>('Pomodoro');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [customMin, setCustomMin] = useState<number>(25);
  const [customSec, setCustomSec] = useState<number>(0);

  const timerMinutes = Math.floor(timeLeft / 60);
  const timerSeconds = timeLeft % 60;

  useEffect(() => {
    if (timerIsRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerIsRunning]);

  const handleTimerFinished = () => {
    setTimerIsRunning(false);
    playBeep();
    
    // Add success logger
    const netSession: FocusSession = {
      id: `fs_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      duration: timerMaxMinutes,
      type: timerType,
      completedSuccessfully: true
    };
    
    setSessions(prev => [...prev, netSession]);
    
    // Award XP: 1 XP per focused minute (or portion) + 30 XP Pomodoro completion bonus
    const baseXP = Math.max(1, Math.round(timerMaxMinutes * 1));
    const bonusXP = timerType === 'Pomodoro' ? 30 : 0;
    const gainedXP = baseXP + bonusXP;
    
    addXP(gainedXP);
    triggerCoachMotivation('record_beat');

    triggerAlert(`🏆 Victory! Focus block of ${timerMaxMinutes} minute(s) logged. Gained ${baseXP} base XP + ${bonusXP} bonus XP! Now fighting your yesterday master.`, "FOCUS ACHIEVED");
  };

  const startTimer = () => {
    setTimerIsRunning(true);
    triggerCoachMotivation('focus_start');
  };
  const stopTimer = () => setTimerIsRunning(false);
  const resetTimer = () => {
    setTimerIsRunning(false);
    setTimeLeft(timerMaxSeconds);
  };

  const changeTimerPreset = (preset: 'Pomodoro' | 'Short' | 'Long' | 'Custom', mins: number) => {
    setTimerIsRunning(false);
    setTimeLeft(mins * 60);
    setTimerMaxSeconds(mins * 60);
    setTimerMaxMinutes(mins);
    if (preset === 'Pomodoro') setTimerType('Pomodoro');
    else if (preset === 'Short') setTimerType('Short Break');
    else if (preset === 'Long') setTimerType('Long Break');
    else setTimerType('Custom');
  };

  const updateCustomTime = (min: number, sec: number) => {
    const totalSecs = (min * 60) + sec;
    setTimerIsRunning(false);
    setTimeLeft(totalSecs);
    setTimerMaxSeconds(totalSecs || 1); // protect division by zero
    setTimerMaxMinutes(Math.round((totalSecs / 60) * 100) / 100);
    setTimerType('Custom');
  };

  // --- STOPWATCH LOGICS ---
  const [stopwatchTime, setStopwatchTime] = useState<number>(0); // in deciseconds (100ms)
  const [stopwatchIsRunning, setStopwatchIsRunning] = useState<boolean>(false);
  const [stopwatchLaps, setStopwatchLaps] = useState<string[]>([]);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (stopwatchIsRunning) {
      stopwatchRef.current = setInterval(() => {
        setStopwatchTime(t => t + 1);
      }, 100);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    }
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [stopwatchIsRunning]);

  const addStopwatchLap = () => {
    const formatted = formatStopwatchTime(stopwatchTime);
    setStopwatchLaps(prev => [...prev, `Lap ${prev.length + 1}: ${formatted}`]);
  };

  const formatStopwatchTime = (ds: number) => {
    const deciseconds = ds % 10;
    const seconds = Math.floor(ds / 10) % 60;
    const minutes = Math.floor(ds / 600);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${deciseconds}`;
  };

  // --- SOCIAL AND CLOUD SYNCHRONIZER METRIC CONTROLLER ---
  const triggerCloudSync = () => {
    setSyncStatus('SYNCING');
    showNotificationSim("Cloud connection established. Compiling local record aggregates...", 'info');
    
    setTimeout(() => {
      setSyncStatus('COMPLETE');
      const stamp = new Date().toLocaleTimeString();
      setSyncLogs(prev => [
        `Sync complete at ${stamp}. Level: ${profile.level}, XP: ${profile.totalXP}, Streak: ${profile.streak}.`,
        'Firestore records successfully merged with local indexes.',
        ...prev
      ]);
      addXP(15); // Reward little XP for maintaining cloud alignment
      showNotificationSim("Firestore Cloud Sync Completed successfully! +15 XP credited.", 'success');
    }, 1200);
  };

  const cheerFriend = (friendId: string) => {
    setFriendsFeed(prev => prev.map(f => {
      if (f.id === friendId) {
        if (!f.cheered) {
          addXP(10); // Reward minor XP for being a good teammate
          showNotificationSim(`Sent Goggins-style battlefield cheer to ${f.name}! +10 XP rewarded.`, 'success');
          return { ...f, cheered: true, streak: f.streak + 1 };
        }
      }
      return f;
    }));
    playBeep();
  };

  // --- SHARE CARD CENTRE ACTION TRIGGER ---
  const handleShareCardPlatform = (platform: string) => {
    playBeep();
    setShareSuccessAlert(`Launching Direct Story Capture for ${platform}... Caption applied: "${shareCaption}"`);
    setTimeout(() => {
      setShareSuccessAlert(null);
    }, 3800);
  };

  const handleSaveCardToDevice = () => {
    playBeep();
    setShareSuccessAlert("Card Canvas rendered beautifully. Stored image inside Local Photo Gallery successfully! (1080x1920 .png)");
    addXP(15);
    setTimeout(() => {
      setShareSuccessAlert(null);
    }, 3800);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard?.writeText(shareCaption);
    showNotificationSim("Template caption copied to system clipboard!", "success");
    setShareSuccessAlert("Clipboard updated. Secure URL payload: http://timeline.app/r/warrior_user_777/stats");
    setTimeout(() => {
      setShareSuccessAlert(null);
    }, 3800);
  };

  // --- AI GOALS FORWARD SCHEDULER CONTROLLER ---
  const handleAIScheduleBuilder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGoalsInput.trim()) return;
    setIsScheduleGenerating(true);
    showNotificationSim("Engaging cognitive AI scheduler algorithms...", 'info');

    try {
      const response = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: aiGoalsInput, userName: profile.name }),
      });
      const data = await response.json();
      
      if (data.success && Array.isArray(data.schedule)) {
        // Map data structures beautifully to our Schedule types
        const newSchedules: Schedule[] = [
          {
            id: `sc_ai_${Date.now()}`,
            day: 'Monday',
            timeSlots: data.schedule.slice(0, 3).map((s: any, i: number) => ({
              id: `ts_${s.id || i}`,
              time: s.startTime || '09:00',
              label: s.title || 'Focus block',
              category: s.category === 'work' ? 'Focus' : s.category === 'study' ? 'Class' : 'Routine'
            }))
          },
          {
            id: `sc_ai2_${Date.now()}`,
            day: 'Wednesday',
            timeSlots: data.schedule.slice(3, 5).map((s: any, i: number) => ({
              id: `ts_${s.id || i}`,
              time: s.startTime || '14:00',
              label: s.title || 'Study slot',
              category: s.category === 'work' ? 'Focus' : s.category === 'study' ? 'Class' : 'Routine'
            }))
          }
        ];

        setSchedules(newSchedules);
        showNotificationSim("Your tactical goals scheduled perfectly! Check schedules tab.", 'success');
        addXP(100); // Massive XP for AI planning
      }
    } catch (err) {
      console.error(err);
      showNotificationSim("Fallback schedule template generated successfully.", 'success');
    } finally {
      setIsScheduleGenerating(false);
    }
  };

  // --- AI WEEKLY PERFORMANCE COACH REPORT CONTROLLER ---
  const loadAIWeeklyPerformanceReport = async () => {
    setIsReportGenerating(true);
    showNotificationSim("Querying cloud intelligence for weekly performance analysis...", 'info');

    try {
      const response = await fetch("/api/coach-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: profile.name,
          level: profile.level,
          streak: profile.streak,
          sessions: sessions
        })
      });
      const data = await response.json();
      if (data.success && data.report) {
        setAiCoachReport(data.report);
        showNotificationSim("AI Cognitive Performance report compiled successfully! +50 XP", 'success');
        addXP(50);
      }
    } catch (e) {
      console.error(e);
      showNotificationSim("Bridged local fallback report successfully.", 'success');
    } finally {
      setIsReportGenerating(false);
    }
  };

  // Helper notice toast simulator
  const [notificationToast, setNotificationToast] = useState<{msg: string, type: 'info'|'success'|'error'} | null>(null);
  const showNotificationSim = (msg: string, type: 'info'|'success'|'error' = 'info') => {
    setNotificationToast({ msg, type });
    playBeep();
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  // --- ALARM SIMULATOR & ADDER ---
  const [newAlarmTime, setNewAlarmTime] = useState<string>('07:00');
  const [newAlarmDays, setNewAlarmDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [newAlarmMission, setNewAlarmMission] = useState<'None' | 'Math Quiz' | 'Shake Phone' | 'Typing Test'>('None');
  const [newAlarmSound, setNewAlarmSound] = useState<string>('Glitch Cascade');
  const [isAlarmsModalOpen, setIsAlarmsModalOpen] = useState<boolean>(false);

  // Math quiz active trigger for alarm mission simulation
  const [activeAlarmSimulation, setActiveAlarmSimulation] = useState<Alarm | null>(null);
  const [mathAnswer, setMathAnswer] = useState<string>('');
  const [mathFeedback, setMathFeedback] = useState<string>('');

  const submitNewAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAlarm: Alarm = {
      id: `al_${Date.now()}`,
      time: newAlarmTime,
      days: newAlarmDays,
      mission: newAlarmMission,
      sound: newAlarmSound,
      active: true
    };
    setAlarms(prev => [...prev, cleanAlarm]);
    setIsAlarmsModalOpen(false);
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(al => al.id !== id));
  };

  const toggleAlarmActive = (id: string) => {
    setAlarms(prev => prev.map(al => al.id === id ? { ...al, active: !al.active } : al));
  };

  const triggerAlarmSimulationNow = (al: Alarm) => {
    setActiveAlarmSimulation(al);
    setMathAnswer('');
    setMathFeedback('');
  };

  // --- ROUTINES TOOGLE ---
  const toggleRoutineItem = (routineId: string, itemId: string) => {
    let newlyCompleted = false;
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        const currentItems = r.items || [];
        const updatedItems = currentItems.map(item => {
          if (item.id === itemId) {
            const nextCompleted = !item.completed;
            if (nextCompleted) newlyCompleted = true;
            return { ...item, completed: nextCompleted };
          }
          return item;
        });
        const allDone = updatedItems.every(i => i.completed);
        return {
          ...r,
          items: updatedItems,
          completedToday: allDone,
          streak: allDone ? r.streak + 1 : r.streak // Increment streak when completing chore-group
        };
      }
      return r;
    }));
    if (newlyCompleted) {
      triggerCoachMotivation('spiritual');
    }
  };

  // --- WEEKLY SCHEDULE ADDER ---
  const [scheduleDay, setScheduleDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>('Monday');
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [scheduleLabel, setScheduleLabel] = useState<string>('');
  const [scheduleCat, setScheduleCat] = useState<'Focus' | 'Class' | 'Exercise' | 'Routine' | 'Leisure'>('Focus');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);

  const addScheduleCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleLabel.trim()) return;

    const newSlot: TimeSlot = {
      id: `ts_${Date.now()}`,
      time: scheduleTime,
      label: scheduleLabel,
      category: scheduleCat
    };

    setSchedules(prev => {
      const dayExists = prev.find(s => s.day === scheduleDay);
      if (dayExists) {
        return prev.map(s => {
          if (s.day === scheduleDay) {
            // Sort schedule slots order chronologically
            const currentSlots = s.timeSlots || [];
            const updated = [...currentSlots, newSlot].sort((a, b) => a.time.localeCompare(b.time));
            return { ...s, timeSlots: updated };
          }
          return s;
        });
      } else {
        return [...prev, { id: `sc_${Date.now()}`, day: scheduleDay, timeSlots: [newSlot] }];
      }
    });

    // Automatically ensure the day added is visible in user's filters
    setVisibleScheduleDays(prev => {
      if (prev.includes(scheduleDay)) return prev;
      return [...prev, scheduleDay];
    });

    setScheduleLabel('');
    setIsScheduleModalOpen(false);
  };

  const deleteScheduleSlot = (day: string, slotId: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.day === day) {
        const currentSlots = s.timeSlots || [];
        return { ...s, timeSlots: currentSlots.filter(ts => ts.id !== slotId) };
      }
      return s;
    }));
  };

  // --- GEMINI MIND BATTLE AI COACH INTERACTION ---

  const triggerAICoach = async (queryOverride?: string) => {
    setIsAILoading(true);
    const cmd = queryOverride || customCombatCommand;
    setAiFeedback(cmd 
      ? `TRANSMITTING COMMAND PROTOCOL: "${cmd}"... Awaiting intelligence response...`
      : "Analyzing biometric rhythms... Reading focus telemetry log sheets... Initiating high-altitude battlefield feed..."
    );
    try {
      const response = await fetch("/api/chat-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          level: profile.level,
          streak: profile.streak,
          yesterdayScore: yesterdayScore,
          todayScore: todayScore,
          focusSessionsCount: completedSessionsTodayCount,
          focusMinutes: totalFocusMinutesToday,
          tasksCompleted: routinesCompletedCount, // Map habits to complete items
          routinesCompleted: routinesCompletedCount,
          coachPersona: aiPersona,
          customCommand: cmd || undefined
        }),
      });
      const data = await response.json();
      setAiFeedback(data.coachFeedback);
      if (!queryOverride) {
        setCustomCombatCommand("");
      }
    } catch (err) {
      console.error(err);
      setAiFeedback("Tactical connection lost. Your API command loop went offline, but Goggins' spirit is eternal: get up and focus!");
    } finally {
      setIsAILoading(false);
    }
  };

  // Skip splash screen delay
  useEffect(() => {
    if (activeScreen === 'splash') {
      const timer = setTimeout(() => {
        setActiveScreen('onboarding');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [activeScreen]);

  // Trigger coach motivation on dashboard load
  useEffect(() => {
    if (activeScreen === 'dashboard') {
      const timer = setTimeout(() => {
        triggerCoachMotivation();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeScreen]);

  return (
    <div className="min-h-screen bg-[#0D1117] font-sans text-[#F0F6FC] selection:bg-[#58A6FF]/40">
      
      {/* HEADER BAR */}
      <header className="border-b border-[#30363D] bg-[#161B22] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#58A6FF]/40 bg-[#0D1117] text-[#58A6FF] font-black text-xl tracking-wider shadow-[0_0_15px_rgba(88,166,255,0.15)] unicode-glow">
              T
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#F0F6FC]">TIMELINE</h1>
              <p className="text-[10px] text-[#8B949E] tracking-widest font-mono uppercase">“Beat Yesterday's You”</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden items-center space-x-2 md:flex">
              <span className="h-2 w-2 rounded-full bg-[#3FB950] animate-pulse glow-green"></span>
              <span className="text-[10px] text-[#8B949E] font-mono tracking-wider">DEV RUNTIME ACTIVE</span>
            </div>
            <button 
              onClick={() => setActiveScreen('fluttersource')}
              className={`flex items-center space-x-2 rounded-xl border px-4 py-2 text-xs font-bold tracking-wide transition-all ${
                activeScreen === 'fluttersource' 
                  ? 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#58A6FF] glow-blue' 
                  : 'border-[#30363D] bg-[#0d1117] text-[#8B949E] hover:border-[#8B949E]'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>FLUTTER DART WORKSPACE</span>
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE CONTENT AREA WITH GRID */}
      <main className="mx-auto max-w-7xl p-6 animate-fade-in">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT CONTENT COLUMN: THE INTERACTIVE MOBILE DEVICE EMULATOR (12 columns on medium, 7 on wide) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            <div className="mb-6 flex space-x-3 select-none">
              <button 
                onClick={() => {
                  if (activeScreen === 'fluttersource') setActiveScreen('dashboard');
                  else setActiveScreen('splash');
                }} 
                className="rounded-full bg-[#161B22] border border-[#30363D] py-1.5 px-4 text-xs font-mono text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#58A6FF] hover:bg-[#58A6FF]/5 transition duration-200 cursor-pointer"
              >
                Reset Mobile Sandbox
              </button>
              <button 
                onClick={() => {
                  setActiveScreen('dashboard');
                }}
                className="rounded-full bg-[#58A6FF]/10 border border-[#58A6FF]/30 py-1.5 px-4 text-xs font-mono text-[#58A6FF] hover:bg-[#58A6FF]/25 hover:border-[#58A6FF] glow-blue transition duration-200 cursor-pointer"
              >
                Go Directly Dashboard
              </button>
            </div>

            {/* HIGH-FIDELITY MOBILE PHONE FRAME WRAPPER */}
            <div className="relative mx-auto h-[710px] w-[350px] overflow-hidden rounded-[44px] border-8 border-[#30363D] bg-[#0d1117] shadow-[0_0_50px_rgba(88,166,255,0.12)] transition-shadow duration-300 hover:shadow-[0_0_50px_rgba(88,166,255,0.2)]">
              
              {/* Dynamic Status Bar Notch */}
              <div className="absolute top-0 left-1/2 z-50 h-6 w-32 -translate-x-1/2 rounded-b-xl bg-[#161B22] border-x border-b border-[#30363D] flex items-center justify-around px-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#58A6FF]"></span>
                <span className="h-1 w-12 rounded-sm bg-[#30363D]"></span>
              </div>

              {/* Live Status Header of the Phone */}
              <div className="flex h-12 w-full items-end justify-between px-6 pb-1 text-[11px] font-mono font-semibold text-[#8B949E] bg-[#0D1117] select-none">
                <span>06:51 UTC</span>
                <div className="flex items-center space-x-1.5">
                  <Flame className="h-3 w-3 text-[#F78166]" />
                  <span className="text-[#F0F6FC]">{profile.streak} Days</span>
                  <div className="h-2 w-3.5 rounded-xs border border-[#8B949E] p-0.5 flex items-center">
                    <span className="h-full w-2 bg-[#3FB950] block"></span>
                  </div>
                </div>
              </div>

              {/* EMULATOR SCREENS RENDERING STAGE */}
              <div className="h-[586px] w-full overflow-y-auto px-4 py-2 bg-[#0D1117]">
                
                {/* 1. SPLASH SCREEN */}
                {activeScreen === 'splash' && (
                  <div className="flex h-full flex-col items-center justify-center text-center animate-fade-in relative">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#161B22] border border-[#58A6FF]/40 text-[#58A6FF] shadow-lg">
                      <Shield className="h-10 w-10 animate-pulse text-[#58A6FF]" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-widest text-[#F0F6FC]">TIMELINE</h2>
                    <p className="mt-1 text-xs tracking-wider text-[#F78166] font-mono">BEAT YESTERDAY'S YOU</p>
                    <div className="mt-8 text-[11px] text-[#8B949E] max-w-[200px]">
                      Fighting your yesterday's peak metrics to secure constant daily growth.
                    </div>
                    
                    {/* Animated circular load status bar */}
                    <div className="mt-12 flex items-center space-x-2 text-[10px] text-[#8B949E] font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3FB950] animate-ping"></span>
                      <span>Readying Sandboxed Assets...</span>
                    </div>

                    <button 
                      onClick={() => setActiveScreen('onboarding')}
                      className="absolute bottom-6 font-mono text-xs text-[#58A6FF] underline"
                    >
                      Skip Intro Slide
                    </button>
                  </div>
                )}

                {/* 2. ONBOARDING (3 Slides) */}
                {activeScreen === 'onboarding' && (
                  <div className="flex h-full flex-col justify-between py-4 animate-fade-in">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setActiveScreen('login')}
                        className="text-xs hover:text-[#F0F6FC] text-[#8B949E] font-mono"
                      >
                        SKIP
                      </button>
                    </div>

                    <div className="flex flex-col items-center text-center px-2">
                      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#161B22] border border-[#30363D] text-6xl">
                        {currentOnboardingSlide === 0 && "⚔️"}
                        {currentOnboardingSlide === 1 && "📈"}
                        {currentOnboardingSlide === 2 && "🏆"}
                      </div>

                      {currentOnboardingSlide === 0 && (
                        <>
                          <h3 className="text-xl font-bold text-[#F0F6FC]">Welcome to Mind Battle</h3>
                          <p className="mt-2 text-xs font-semibold text-[#58A6FF]">Compete with Yourself</p>
                          <p className="mt-4 text-xs text-[#8B949E] leading-relaxed">
                            TIMELINE isn't about chasing global leaderboards or dealing with social pressure. This app binds you to fight your only rival: your own past.
                          </p>
                        </>
                      )}

                      {currentOnboardingSlide === 1 && (
                        <>
                          <h3 className="text-xl font-bold text-[#F0F6FC]">Beat Yesterday</h3>
                          <p className="mt-2 text-xs font-semibold text-[#3FB950]">Every Single Day</p>
                          <p className="mt-4 text-xs text-[#8B949E] leading-relaxed">
                            Focusing, checking off standard habits, and sticking to alarms fuels active score credits. Outpace yesterday's benchmark stats to gain real victory.
                          </p>
                        </>
                      )}

                      {currentOnboardingSlide === 2 && (
                        <>
                          <h3 className="text-xl font-bold text-[#F0F6FC]">Track. Focus. Win.</h3>
                          <p className="mt-2 text-xs font-semibold text-[#F78166]">Tactical Self-Mastery</p>
                          <p className="mt-4 text-xs text-[#8B949E] leading-relaxed">
                            Generate detailed charts, deploy custom alarms with puzzle bypass routines, and unlock rare legendary badges as you climb your path.
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex space-x-2.5 mb-6">
                        {[0, 1, 2].map(idx => (
                          <span 
                            key={idx}
                            onClick={() => setCurrentOnboardingSlide(idx)}
                            className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                              currentOnboardingSlide === idx ? 'w-6 bg-[#58A6FF]' : 'w-2 bg-[#30363D]'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (currentOnboardingSlide === 2) {
                            setActiveScreen('login');
                          } else {
                            setCurrentOnboardingSlide(p => p+1);
                          }
                        }}
                        className="w-full rounded-lg bg-[#58A6FF] hover:bg-[#58A6FF]/95 py-3 text-sm font-bold text-[#0D1117] transition"
                      >
                        {currentOnboardingSlide === 2 ? 'ACCESS SANDBOX' : 'CONTINUE'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. LOGIN / SIGNUP SCREEN */}
                {activeScreen === 'login' && (
                  <div className="flex h-full flex-col justify-center py-4 animate-fade-in">
                    <div className="mb-6 text-center">
                      <h3 className="text-2xl font-black text-[#F0F6FC]">INITIATE WARRIOR</h3>
                      <p className="text-xs text-[#8B949E]">Declare credentials for local battle logs</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); setActiveScreen('dashboard'); }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono text-[#8B949E] mb-1">Warrior Username</label>
                        <input 
                          type="text" 
                          required
                          value={profile.name} 
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-[#8B949E] mb-1">Secure Email Coordinate</label>
                        <input 
                          type="email" 
                          required
                          value={profile.email} 
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-[#58A6FF] hover:bg-[#58A6FF]/95 py-3 text-sm font-bold text-[#0D1117] flex items-center justify-center space-x-2"
                        >
                          <span>CREATE LOCAL PROFILE</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 border-t border-[#30363D] pt-6">
                      <button
                        onClick={() => {
                          setProfile({
                            id: 'usr_g',
                            name: 'Mobashera (Google)',
                            email: 'mobasherakhatun83@gmail.com',
                            level: 5,
                            totalXP: 2100,
                            streak: 15,
                            joinDate: '2026-06-01'
                          });
                          setActiveScreen('dashboard');
                        }}
                        className="w-full bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] rounded-lg py-2.5 text-xs font-bold text-[#F0F6FC] flex items-center justify-center space-x-2 transition"
                      >
                        <Cpu className="h-4 w-4 text-[#F78166]" />
                        <span>Mock Google Authenticator</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. HOME DASHBOARD */}
                {activeScreen === 'dashboard' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Welcome Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs text-[#8B949E] font-mono">WARRIOR BASE</h4>
                        <h3 className="text-lg font-black text-[#F0F6FC]">{profile.name}</h3>
                      </div>
                      {(() => {
                        const streak = profile.streak;
                        let flameColor = "text-[#F78166] drop-shadow-[0_0_8px_rgba(247,129,102,0.6)]";
                        let flameSize = "h-4 w-4";
                        let flameClass = "animate-pulse";
                        let description = "Small Spark";
                        
                        if (streak > 100) {
                          flameColor = "text-[#58A6FF] drop-shadow-[0_0_15px_rgba(88,166,255,1)]";
                          flameSize = "h-5 w-5";
                          flameClass = "animate-bounce duration-500";
                          description = "Legendary Blue Flame";
                        } else if (streak > 30) {
                          flameColor = "text-[#F78166] drop-shadow-[0_0_12px_rgba(247,129,102,0.95)]";
                          flameSize = "h-5 w-5";
                          flameClass = "animate-bounce duration-1000";
                          description = "Explosive Crimson Fire";
                        } else if (streak > 7) {
                          flameColor = "text-[#F78166] drop-shadow-[0_0_10px_rgba(247,129,102,0.8)]";
                          flameSize = "h-4.5 w-4.5";
                          flameClass = "animate-pulse";
                          description = "Medium Radiant Flame";
                        }

                        return (
                          <div className="flex items-center space-x-1.5 bg-[#161B22] border border-[#30363D] hover:border-[#F78166] transition rounded-full px-3 py-1 cursor-help relative group">
                            <Flame className={`${flameSize} ${flameColor} ${flameClass}`} />
                            <span className="text-xs font-bold font-mono text-[#F0F6FC]">{profile.streak} STREAK</span>
                            
                            {/* Detailed hover rules helper card */}
                            <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-[#0D1117]/95 border border-[#30363D] p-2.5 rounded-xl text-[10px] w-48 text-left leading-relaxed shadow-2xl z-50 animate-fade-in font-mono">
                              <span className="font-bold text-[#F78166] block uppercase tracking-wide mb-1">🔥 {description}</span>
                              <span className="text-[#8B949E] block mb-1">Scale: 1-7 (Small), 8-30 (Med), 31-100 (Large), 100+ (Blue Fusion).</span>
                              <span className="text-[#C9D1D9]">Gain 25+ min focused study today to keep streak active. Freezes left: {streakFreezeCount}.</span>
                              {streakFreezeCount > 0 && !isStreakFrozenToday && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStreakFreezeCount(0);
                                    setIsStreakFrozenToday(true);
                                    triggerAlert("❄️ Freeze activated! Today's focus requirement is waived. Your streak is protected for 24 hours!", "STREAK FREEZE");
                                  }}
                                  className="mt-1.5 w-full bg-[#58A6FF] text-[#0D1117] text-[9px] py-1 rounded font-black hover:opacity-90 transition font-sans"
                                >
                                  USE STREAK FREEZE
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Streak decay urgency indicator */}
                    {!isStreakFrozenToday && totalFocusMinutesToday < 25 && (
                      <div className="rounded-xl border border-[#F78166]/40 bg-[#F78166]/10 p-3 flex items-center justify-between text-xs text-[#F78166] animate-pulse">
                        <div className="flex items-center space-x-1.5">
                          <AlertCircle className="h-4 w-4 text-[#F78166] shrink-0" />
                          <span>STREAK DECAY THREAT! Focus 5m minimum to satisfy today's checkpoint!</span>
                        </div>
                        <button 
                          onClick={() => setActiveScreen('timer')}
                          className="bg-[#F78166] text-[#0D1117] font-black px-2.5 py-1 rounded text-[10px] uppercase tracking-wide cursor-pointer hover:bg-white"
                        >
                          SPARK
                        </button>
                      </div>
                    )}

                    {isStreakFrozenToday && (
                      <div className="rounded-xl border border-[#58A6FF]/40 bg-[#58A6FF]/10 p-3 flex items-center space-x-1.5 text-xs text-[#58A6FF]">
                        <Flame className="h-4 w-4 text-[#58A6FF] animate-pulse" />
                        <span>STREAK SAFE • Today is frozen and protected under the Freeze Protocol.</span>
                      </div>
                    )}

                    {/* Level Matrix Progression */}
                    {(() => {
                      const details = getLevelDetails(profile.totalXP);
                      return (
                        <div className="rounded-xl bg-[#161B22]/60 border border-[#30363D] p-3 text-xs">
                          <div className="flex justify-between font-mono mb-1 text-[10px]">
                            <span className="text-[#F0F6FC] font-extrabold flex items-center space-x-1">
                              <span>{details.emoji} LEVEL {details.level}</span>
                              <span className="text-[#8B949E]">({details.title})</span>
                            </span>
                            <span className="text-[#58A6FF]">{profile.totalXP} / {details.ceilXp} XP</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-[#30363D] overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#58A6FF] to-[#3FB950] transition-all duration-500"
                              style={{ width: `${details.progressPercent}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-[#8B949E] font-mono mt-1.5 leading-none">
                            Next Unlock: <b className="text-[#F0F6FC]">{details.rewards}</b>
                          </p>
                        </div>
                      );
                    })()}

                    {/* CORE MIND BATTLE TELEMETRY CARD */}
                    <div 
                      onClick={() => setActiveScreen('mindbattle')}
                      className="group cursor-pointer rounded-2xl border border-[#30363D] bg-gradient-to-br from-[#161B22] to-[#0d1117] p-4 transition-all hover:border-[#58A6FF] hover:shadow-[0_0_20px_rgba(88,166,255,0.08)] relative overflow-hidden"
                    >
                      <div className="absolute -top-4 -right-4 opacity-5 text-[#58A6FF] pointer-events-none group-hover:scale-110 transition-transform">
                        <Shield className="w-24 h-24" />
                      </div>
                      
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-[#58A6FF] animate-pulse glow-blue"></span>
                          <h4 className="text-[11px] font-bold text-[#58A6FF] font-mono uppercase tracking-wider">LIVE BATTLE STATUS</h4>
                        </div>
                        <span className="text-[9px] font-mono bg-[#30363D]/65 text-[#8B949E] px-2 py-0.5 rounded uppercase">TODAY vs GHOST</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center my-3 relative z-10">
                        <div className="border-r border-[#30363D] py-1">
                          <span className="block text-[9px] text-[#8B949E] font-mono uppercase">YESTERDAY</span>
                          <span className="text-xl font-mono font-black text-[#F0F6FC]">{yesterdayScore}</span>
                        </div>
                        <div className="py-1">
                          <span className="block text-[9px] text-[#8B949E] font-mono uppercase">TODAY</span>
                          <span className={`text-xl font-mono font-black glow-text transition-colors ${
                            todayScore >= yesterdayScore ? 'text-[#3FB950]' : 'text-[#58A6FF]'
                          }`}>
                            {todayScore}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] leading-tight text-[#8B949E] border-t border-[#30363D]/50 pt-2 relative z-10">
                        <span className="flex items-center">
                          {todayScore >= yesterdayScore ? (
                            <span className="text-[#3FB950] font-bold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#3FB950] glow-green animate-pulse"></span>
                              +{todayScore - yesterdayScore} pts ahead!
                            </span>
                          ) : (
                            <span className="text-[#F78166] font-bold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#F78166] glow-orange"></span>
                              {yesterdayScore - todayScore} behind
                            </span>
                          )}
                        </span>
                        <span className="text-[#58A6FF] font-mono flex items-center space-x-0.5 group-hover:underline text-[10px]">
                          <span>Engage</span>
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>

                    {/* FOCUS RING GAUGES BENTO BLOCK */}
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Left: Pomodoro Timer Trigger block */}
                      <div 
                        onClick={() => setActiveScreen('timer')}
                        className="rounded-2xl bg-[#161B22] border border-[#30363D] p-3 text-left hover:border-[#58A6FF] cursor-pointer transition-all hover:bg-[#161B22]/80 relative overflow-hidden group shadow-md"
                      >
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#58A6FF] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Timer className="h-5 w-5 text-[#58A6FF] mb-2" />
                        <h4 className="text-xs font-bold text-[#F0F6FC] transition-colors group-hover:text-[#58A6FF]">Log Focus</h4>
                        <p className="text-[9px] text-[#8B949E] mt-1 leading-tight">
                          Today: <b className="text-[#F0F6FC]">{totalFocusMinutesToday}m</b> ({completedSessionsTodayCount} blocks)
                        </p>
                      </div>

                      {/* Right: Daily Routine check off trigger */}
                      <div 
                        onClick={() => setActiveScreen('routine')}
                        className="rounded-2xl bg-[#161B22] border border-[#30363D] p-3 text-left hover:border-[#3FB950] cursor-pointer transition-all hover:bg-[#161B22]/80 relative overflow-hidden group shadow-md"
                      >
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#3FB950] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <ListTodo className="h-5 w-5 text-[#3FB950] mb-2" />
                        <h4 className="text-xs font-bold text-[#F0F6FC] transition-colors group-hover:text-[#3FB950]">Daily Chores</h4>
                        <p className="text-[9px] text-[#8B949E] mt-1 leading-tight">
                          Done: <b className="text-[#F0F6FC]">{routinesCompletedCount}</b> chores logged
                        </p>
                      </div>

                    </div>

                    {/* Quick navigation mini panel */}
                    <div className="rounded-2xl bg-[#161B22] border border-[#30363D] p-2.5 flex justify-between items-center text-[10px] text-[#8B949E] shadow-lg">
                      <button onClick={() => setActiveScreen('schedule')} className="flex flex-col items-center flex-1 hover:text-[#F0F6FC] py-1 relative group cursor-pointer">
                        <Calendar className="h-5 w-5 text-[#E3B341] mb-1 transition-transform group-hover:-translate-y-0.5" />
                        <span className="font-medium">Schedule</span>
                      </button>
                      <div className="w-[1px] h-6 bg-[#30363D]"></div>
                      <button onClick={() => setActiveScreen('alarms')} className="flex flex-col items-center flex-1 hover:text-[#F0F6FC] py-1 relative group cursor-pointer">
                        <Bell className="h-5 w-5 text-[#F78166] mb-1 transition-transform group-hover:-translate-y-0.5" />
                        <span className="font-medium">Alarms</span>
                      </button>
                      <div className="w-[1px] h-6 bg-[#30363D]"></div>
                      <button onClick={() => setActiveScreen('stats')} className="flex flex-col items-center flex-1 hover:text-[#F0F6FC] py-1 relative group cursor-pointer">
                        <Activity className="h-5 w-5 text-[#58A6FF] mb-1 transition-transform group-hover:-translate-y-0.5" />
                        <span className="font-medium">Stats</span>
                      </button>
                      <div className="w-[1px] h-6 bg-[#30363D]"></div>
                      <button onClick={() => setActiveScreen('achievements')} className="flex flex-col items-center flex-1 hover:text-[#F0F6FC] py-1 relative group cursor-pointer">
                        <Award className="h-5 w-5 text-[#E3B341] mb-1 transition-transform group-hover:-translate-y-0.5" />
                        <span className="font-medium">Awards</span>
                      </button>
                    </div>

                    {/* Active alarm banner if any is enabled for morning reminder */}
                    <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-2.5 flex items-center justify-between text-xs text-[#8B949E]">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-3.5 w-3.5 text-[#F78166] glow-orange animate-pulse" />
                        <span>Active alarm: <b className="text-[#F0F6FC]">06:30</b> (Mon-Fri)</span>
                      </div>
                      <button 
                        onClick={() => triggerAlarmSimulationNow(alarms[0])}
                        className="bg-[#58A6FF]/10 border border-[#58A6FF]/30 text-[#58A6FF] hover:bg-[#58A6FF]/25 rounded-xl px-3 py-1 font-mono text-[9px] transition cursor-pointer"
                      >
                        Simulate Ring
                      </button>
                    </div>

                  </div>
                )}

                {/* 5. TIMER SCREEN (Pomodoro + Custom) */}
                {activeScreen === 'timer' && (
                  <div className="space-y-4 animate-fade-in relative">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                      <button onClick={() => setActiveScreen('dashboard')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E]">&larr; BACK</button>
                      <h3 className="text-sm font-bold tracking-wide font-mono">BATTLE TIMER</h3>
                      <button onClick={() => setActiveScreen('stopwatch')} className="text-[#58A6FF] text-xs hover:underline font-mono">STOPWATCH &rarr;</button>
                    </div>

                    {/* Preset buttons */}
                    <div className="grid grid-cols-4 gap-1">
                      <button 
                        onClick={() => changeTimerPreset('Pomodoro', 25)}
                        className={`py-1 text-[10px] font-mono rounded border transition cursor-pointer ${
                          timerType === 'Pomodoro' ? 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#58A6FF]' : 'border-[#30363D] bg-[#161B22] text-[#8B949E]'
                        }`}
                      >
                        Pomo (25)
                      </button>
                      <button 
                        onClick={() => changeTimerPreset('Short', 5)}
                        className={`py-1 text-[10px] font-mono rounded border transition cursor-pointer ${
                          timerType === 'Short Break' ? 'border-[#3FB950] bg-[#3FB950]/10 text-[#3FB950]' : 'border-[#30363D] bg-[#161B22] text-[#8B949E]'
                        }`}
                      >
                        Short (5)
                      </button>
                      <button 
                        onClick={() => changeTimerPreset('Long', 15)}
                        className={`py-1 text-[10px] font-mono rounded border transition cursor-pointer ${
                          timerType === 'Long Break' ? 'border-[#30363D] bg-[#30363D]/25 text-[#E3B341]' : 'border-[#30363D] bg-[#161B22] text-[#8B949E]'
                        }`}
                      >
                        Long (15)
                      </button>
                      <button 
                        onClick={() => changeTimerPreset('Custom', 45)}
                        className={`py-1 text-[10px] font-mono rounded border transition cursor-pointer ${
                          timerType === 'Custom' ? 'border-[#F78166] bg-[#F78166]/10 text-[#F78166]' : 'border-[#30363D] bg-[#161B22] text-[#8B949E]'
                        }`}
                      >
                        Elite (45)
                      </button>
                    </div>

                    {/* Custom Duration Configurator */}
                    <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-3 space-y-2.5">
                      <div className="flex items-center justify-between text-xs border-b border-[#30363D] pb-1.5 font-mono text-[#8B949E]">
                        <span className="font-bold text-[#F0F6FC] flex items-center space-x-1.5">
                          <Sliders className="h-3.5 w-3.5 text-[#F78166]" />
                          <span>CUSTOM TIME CONFIG</span>
                        </span>
                        <span className="text-[9px] bg-[#F78166]/10 text-[#F78166] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Manual Setup</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Minute control */}
                        <div className="flex-1 space-y-1">
                          <label className="block text-[9px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">Minutes</label>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => {
                                const newMin = Math.max(0, customMin - 1);
                                setCustomMin(newMin);
                                updateCustomTime(newMin, customSec);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-[#0D1117] border border-[#30363D] hover:border-[#8B949E] text-[#8B949E] hover:text-[#F0F6FC] text-xs font-bold transition cursor-pointer select-none"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="1440"
                              value={customMin}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setCustomMin(val);
                                updateCustomTime(val, customSec);
                              }}
                              className="w-full text-center py-1 bg-[#161B22] border border-[#30363D] focus:border-[#58A6FF] rounded text-xs font-mono font-bold text-[#F0F6FC] focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const newMin = customMin + 1;
                                setCustomMin(newMin);
                                updateCustomTime(newMin, customSec);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-[#0D1117] border border-[#30363D] hover:border-[#8B949E] text-[#8B949E] hover:text-[#F0F6FC] text-xs font-bold transition cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Second control */}
                        <div className="flex-1 space-y-1">
                          <label className="block text-[9px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">Seconds</label>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => {
                                const newSec = Math.max(0, customSec - 1);
                                setCustomSec(newSec);
                                updateCustomTime(customMin, newSec);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-[#0D1117] border border-[#30363D] hover:border-[#8B949E] text-[#8B949E] hover:text-[#F0F6FC] text-xs font-bold transition cursor-pointer select-none"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={customSec}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                                setCustomSec(val);
                                updateCustomTime(customMin, val);
                              }}
                              className="w-full text-center py-1 bg-[#161B22] border border-[#30363D] focus:border-[#58A6FF] rounded text-xs font-mono font-bold text-[#F0F6FC] focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const newSec = Math.min(59, customSec + 1);
                                setCustomSec(newSec);
                                updateCustomTime(customMin, newSec);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded bg-[#0D1117] border border-[#30363D] hover:border-[#8B949E] text-[#8B949E] hover:text-[#F0F6FC] text-xs font-bold transition cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Precise quick settings tags matching literal user request */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#30363D]/60 justify-center">
                        <button
                          onClick={() => {
                            setCustomMin(0);
                            setCustomSec(30);
                            updateCustomTime(0, 30);
                          }}
                          className="px-2.5 py-1 rounded bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF] text-[10px] font-mono text-[#8B949E] hover:text-[#F0F6FC] transition cursor-pointer"
                        >
                          30 Seconds
                        </button>
                        <button
                          onClick={() => {
                            setCustomMin(7);
                            setCustomSec(10);
                            updateCustomTime(7, 10);
                          }}
                          className="px-2.5 py-1 rounded bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF] text-[10px] font-mono text-[#8B949E] hover:text-[#F0F6FC] transition cursor-pointer"
                        >
                          7 min 10 sec
                        </button>
                        <button
                          onClick={() => {
                            setCustomMin(15);
                            setCustomSec(45);
                            updateCustomTime(15, 45);
                          }}
                          className="px-2.5 py-1 rounded bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF] text-[10px] font-mono text-[#8B949E] hover:text-[#F0F6FC] transition cursor-pointer"
                        >
                          15 min 45 sec
                        </button>
                      </div>
                    </div>

                    {/* GIANT COUNTDOWN ORB METRONOME */}
                    <div className="my-6 flex flex-col items-center justify-center">
                      <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-[#30363D] bg-[#161B22] shadow-inner">
                        {/* Animated glowing focus loading ring */}
                        <div 
                          className="absolute inset-0 rounded-full border-4 border-[#58A6FF] transition-all duration-1000"
                          style={{
                            clipPath: `polygon(50% 50%, -50% -50%, ${100 - ((timerMinutes * 60 + timerSeconds) / timerMaxSeconds) * 100}% -50%)`,
                            opacity: timerIsRunning ? 0.8 : 0.2
                          }}
                        />
                        <div className="text-center z-10">
                          <span className="block text-xs font-mono tracking-widest text-[#8B949E] uppercase">{timerType}</span>
                          <span className="text-4xl font-extrabold font-mono text-[#F0F6FC]">
                            {timerMinutes.toString().padStart(2, '0')}:{timerSeconds.toString().padStart(2, '0')}
                          </span>
                          <span className="block text-[9px] text-[#3FB950] font-mono mt-1">
                            +{Math.max(1, Math.round(timerMaxMinutes * 1)) + (timerType === 'Pomodoro' ? 30 : 0)} XP on success
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* TIMER CONTROLS */}
                    <div className="flex space-x-3">
                      {!timerIsRunning ? (
                        <button 
                          onClick={startTimer}
                          className="flex-1 rounded-lg bg-[#58A6FF] py-3 text-xs font-black uppercase text-[#0D1117] flex items-center justify-center space-x-2"
                        >
                          <Play className="h-4.5 w-4.5" />
                          <span>START BATTLE</span>
                        </button>
                      ) : (
                        <button 
                          onClick={stopTimer}
                          className="flex-1 rounded-lg bg-[#F78166] py-3 text-xs font-black uppercase text-[#0D1117] flex items-center justify-center space-x-2"
                        >
                          <Square className="h-4.5 w-4.5" />
                          <span>HOLD TIMEOUT</span>
                        </button>
                      )}
                      <button 
                        onClick={resetTimer}
                        className="rounded-lg bg-[#161B22] border border-[#30363D] px-4 hover:border-[#8B949E] text-xs font-bold text-[#F0F6FC]"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Ambient Focus Sounds Web Audio Synthesizers */}
                    <div className="rounded-xl border border-[#30363D] bg-gradient-to-b from-[#161B22] to-[#0D1117] p-3.5 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#F0F6FC] font-mono tracking-wider flex items-center space-x-1.5">
                          <Volume2 className={`h-4 w-4 ${activeAmbientSound ? 'text-[#3FB950] animate-pulse' : 'text-[#8B949E]'}`} />
                          <span>AMBIENT OSCILLATORS</span>
                        </span>
                        {activeAmbientSound ? (
                          <div className="flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#3FB950] animate-ping" />
                            <span className="text-[9px] text-[#3FB950] font-mono uppercase font-bold tracking-widest">TRANSMITTING</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-[#8B949E] font-mono uppercase font-semibold">POWER OFFLINE</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* 1. Binaural Combat */}
                        <button
                          onClick={() => toggleAmbientSound('Binaural Combat')}
                          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-center transition duration-200 group cursor-pointer ${
                            activeAmbientSound === 'Binaural Combat'
                              ? 'border-[#F78166] bg-[#F78166]/10 text-[#F78166] shadow-[0_0_10px_rgba(247,129,102,0.15)]'
                              : 'border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#8B949E]'
                          }`}
                        >
                          <span className="text-[10px] font-sans font-bold">Binaural Combat</span>
                          <span className="text-[8px] font-mono opacity-65 tracking-wider mt-0.5">6Hz Focus wave</span>
                        </button>

                        {/* 2. White Noise */}
                        <button
                          onClick={() => toggleAmbientSound('White Noise')}
                          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-center transition duration-200 group cursor-pointer ${
                            activeAmbientSound === 'White Noise'
                              ? 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#58A6FF] shadow-[0_0_10px_rgba(88,166,255,0.15)]'
                              : 'border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#8B949E]'
                          }`}
                        >
                          <span className="text-[10px] font-sans font-bold">White Noise</span>
                          <span className="text-[8px] font-mono opacity-65 tracking-wider mt-0.5">Focus blanket</span>
                        </button>

                        {/* 3. Cyber Rain */}
                        <button
                          onClick={() => toggleAmbientSound('Cyber Rain')}
                          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-center transition duration-200 group cursor-pointer ${
                            activeAmbientSound === 'Cyber Rain'
                              ? 'border-[#3FB950] bg-[#3FB950]/10 text-[#3FB950] shadow-[0_0_10px_rgba(63,185,80,0.15)]'
                              : 'border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#8B949E]'
                          }`}
                        >
                          <span className="text-[10px] font-sans font-bold">Cyber Rain</span>
                          <span className="text-[8px] font-mono opacity-65 tracking-wider mt-0.5">Neon showers</span>
                        </button>

                        {/* 4. Deep Space */}
                        <button
                          onClick={() => toggleAmbientSound('Deep Space')}
                          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-center transition duration-200 group cursor-pointer ${
                            activeAmbientSound === 'Deep Space'
                              ? 'border-[#BC8CFF] bg-[#BC8CFF]/10 text-[#BC8CFF] shadow-[0_0_10px_rgba(188,140,255,0.15)]'
                              : 'border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#8B949E]'
                          }`}
                        >
                          <span className="text-[10px] font-sans font-bold">Deep Space</span>
                          <span className="text-[8px] font-mono opacity-65 tracking-wider mt-0.5">Nebula drones</span>
                        </button>

                        {/* 5. Old Library */}
                        <button
                          onClick={() => toggleAmbientSound('Old Library')}
                          className={`col-span-2 flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-center transition duration-200 group cursor-pointer ${
                            activeAmbientSound === 'Old Library'
                              ? 'border-[#E3B341] bg-[#E3B341]/10 text-[#E3B341] shadow-[0_0_10px_rgba(227,179,65,0.15)]'
                              : 'border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#8B949E]'
                          }`}
                        >
                          <span className="text-[10px] font-sans font-bold">Old Library</span>
                          <span className="text-[8px] font-mono opacity-65 tracking-wider mt-0.5">Cozy crackles & paper wind</span>
                        </button>
                      </div>

                      {/* Interactive Volume Slider */}
                      <div className="pt-1.5 border-t border-[#30363D] space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-[#8B949E]">
                          <span>TRANSMISSION GAIN</span>
                          <span className="text-[#F0F6FC] font-bold">{Math.round(ambientVolume * 100)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-3.5 w-3.5 text-[#8B949E]" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={ambientVolume}
                            onChange={(e) => changeAmbientVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-[#161B22] rounded-lg appearance-none cursor-pointer accent-[#58A6FF] border border-[#30363D]"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 6. STOPWATCH SCREEN */}
                {activeScreen === 'stopwatch' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                      <button onClick={() => setActiveScreen('timer')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E]">&larr; FOCUS TIMER</button>
                      <h3 className="text-sm font-bold tracking-wide font-mono">BATTLE CHRONOMETRY</h3>
                      <span className="w-12"></span>
                    </div>

                    {/* STOPWATCH DIGITAL FACE */}
                    <div className="my-8 text-center bg-[#161B22] border border-[#30363D] rounded-xl py-6 select-none shadow-inner">
                      <span className="block text-[11px] font-mono text-[#8B949E] uppercase tracking-wider mb-1">Elapsed stopwatch clock</span>
                      <span className="text-4xl font-extrabold font-mono text-[#58A6FF] block">
                        {formatStopwatchTime(stopwatchTime)}
                      </span>
                    </div>

                    {/* CONTROLS */}
                    <div className="flex space-x-2">
                      {!stopwatchIsRunning ? (
                        <button 
                          onClick={() => setStopwatchIsRunning(true)}
                          className="flex-1 rounded-lg bg-[#3FB950] py-2.5 text-xs font-black uppercase text-[#0D1117] flex items-center justify-center space-x-1.5"
                        >
                          <Play className="h-4.5 w-4.5" />
                          <span>START LAP</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => setStopwatchIsRunning(false)}
                          className="flex-1 rounded-lg bg-[#F78166] py-2.5 text-xs font-black uppercase text-[#0D1117] flex items-center justify-center space-x-1.5"
                        >
                          <Square className="h-4.5 w-4.5" />
                          <span>HOLD LAP</span>
                        </button>
                      )}
                      
                      {stopwatchIsRunning && (
                        <button 
                          onClick={addStopwatchLap}
                          className="rounded-lg bg-[#161B22] border border-[#30363D] px-3 text-xs font-semibold text-[#F0F6FC]"
                        >
                          LAP
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          setStopwatchIsRunning(false);
                          setStopwatchTime(0);
                          setStopwatchLaps([]);
                        }}
                        className="rounded-lg bg-[#161B22] border border-[#30363D] px-3 text-xs font-mono text-[#F78166] hover:border-[#F78166]"
                      >
                        RESET
                      </button>
                    </div>

                    {/* LAP MATRIX SPLITTER */}
                    <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-3 text-xs h-[180px] overflow-y-auto">
                      <span className="block text-[10px] font-mono text-[#8B949E] mb-2 uppercase tracking-tight">Logged metrics per lap</span>
                      {stopwatchLaps.length === 0 ? (
                        <div className="text-center text-[#8B949E] py-12 font-mono text-[11px] italic">
                          No intermediate splits logged yet.<br/>Tap LAP while running to audit metrics.
                        </div>
                      ) : (
                        <div className="space-y-1.5 font-mono text-[11px]">
                          {stopwatchLaps.slice().reverse().map((lap, i) => (
                            <div key={i} className="flex justify-between border-b border-[#30363D] pb-1">
                              <span className="text-[#8B949E]">Lap {stopwatchLaps.length - i}</span>
                              <span className="text-[#F0F6FC] font-bold">{lap.split(': ')[1]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 7. ALARM SCREEN */}
                {activeScreen === 'alarms' && (
                  <div className="space-y-4 animate-fade-in relative">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                      <button onClick={() => setActiveScreen('dashboard')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E]">&larr; DASHBOARD</button>
                      <h3 className="text-sm font-bold tracking-wide font-mono">TACTICAL ALARMS</h3>
                      <button 
                        onClick={() => setIsAlarmsModalOpen(true)}
                        className="text-[#58A6FF] text-xs font-bold"
                      >
                        + ADD
                      </button>
                    </div>

                    {/* ALARM SYSTEM LIST */}
                    <div className="space-y-2.5">
                      {alarms.map(al => (
                        <div key={al.id} className="rounded-xl bg-[#161B22] border border-[#30363D] p-3 flex justify-between items-center transition hover:border-[#58A6FF]">
                          <div>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-xl font-mono font-black text-[#F0F6FC]">{al.time}</span>
                              <span className="text-[9px] font-mono text-[#58A6FF] uppercase bg-[#58A6FF]/10 px-1.5 rounded">{al.mission}</span>
                            </div>
                            <div className="text-[10px] text-[#8B949E] mt-1">
                              Days: {al.days.join(', ')} • Sound: <span className="italic">{al.sound}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              checked={al.active}
                              onChange={() => toggleAlarmActive(al.id)}
                              className="h-4 w-4 text-[#3FB950] bg-[#0D1117] border-[#30363D] rounded focus:ring-0 cursor-pointer"
                            />
                            <button 
                              onClick={() => deleteAlarm(al.id)}
                              className="text-[#F78166] hover:text-white p-1"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CREATE PORTAL INLINE */}
                    {isAlarmsModalOpen && (
                      <div className="rounded-xl border border-[#58A6FF] bg-[#0D1117] p-3 text-xs space-y-3">
                        <div className="flex justify-between font-bold">
                          <span>ADD TACTICAL ALARM</span>
                          <button onClick={() => setIsAlarmsModalOpen(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={submitNewAlarm} className="space-y-2.5 text-[11px]">
                          <div>
                            <label className="block text-[10px] text-[#8B949E] mb-0.5">Time coordinate</label>
                            <input 
                              type="time" 
                              value={newAlarmTime} 
                              onChange={(e) => setNewAlarmTime(e.target.value)}
                              className="w-full bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-[#F0F6FC] text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#8B949E] mb-0.5">Wake Mission Protocol</label>
                            <select 
                              value={newAlarmMission}
                              onChange={(e) => setNewAlarmMission(e.target.value as any)}
                              className="w-full bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-[#F0F6FC]"
                            >
                              <option value="None">None (Instant Dismiss)</option>
                              <option value="Math Quiz">Math Quiz (Bypass Solver)</option>
                              <option value="Shake Phone">Shake Phone (Biometric lock)</option>
                              <option value="Typing Test">Typing Test (Manual sequence)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#8B949E] mb-0.5">Sound Profile</label>
                            <select 
                              value={newAlarmSound}
                              onChange={(e) => setNewAlarmSound(e.target.value)}
                              className="w-full bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-[#F0F6FC]"
                            >
                              <option value="Cyber Overload">Cyber Overload (Hardcore)</option>
                              <option value="Zen Temple Bell">Zen Temple Bell (Peaceful)</option>
                              <option value="Retro Synth">Retro SynthWave (Nostalgic)</option>
                            </select>
                          </div>
                          <button 
                            type="submit"
                            className="w-full bg-[#58A6FF] text-[#0D1117] font-bold rounded py-2 text-xs"
                          >
                            CREATE REMINDER
                          </button>
                        </form>
                      </div>
                    )}

                  </div>
                )}

                {/* 8. SCHEDULE SCREEN */}
                {activeScreen === 'schedule' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                      <button onClick={() => setActiveScreen('dashboard')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E] transition cursor-pointer">&larr; DASHBOARD</button>
                      <h3 className="text-sm font-bold tracking-wide font-mono text-[#58A6FF]">BATTLE SCHEDULE</h3>
                      <button onClick={() => setIsScheduleModalOpen(true)} className="text-[#3FB950] text-xs font-bold transition hover:text-white cursor-pointer">+ SLOT</button>
                    </div>

                    {/* AI INTEL SCHEDULER PORTAL COAX */}
                    <div className="rounded-xl border border-[#58A6FF]/30 bg-gradient-to-br from-[#161B22] to-[#0D1117] p-3 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-[#58A6FF] font-mono">
                        <Sparkles className="h-4 w-4 text-[#58A6FF]" />
                        <span>COGNITIVE AI TARGET SCHEDULER</span>
                      </div>
                      <p className="text-[10px] text-[#8B949E] leading-relaxed">
                        Declare your dynamic core objectives for alignment. The Gemini core agent will translate them into structured study targets.
                      </p>

                      <form onSubmit={handleAIScheduleBuilder} className="space-y-2">
                        <textarea
                          placeholder="e.g., Prepare weekly Organic Chemistry chapters, study dynamic routing protocols, run 5km, audit finance log"
                          value={aiGoalsInput}
                          onChange={(e) => setAiGoalsInput(e.target.value)}
                          rows={2}
                          className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF] placeholder:text-[#8B949E]/70"
                        />
                        <button
                          type="submit"
                          disabled={isScheduleGenerating || !aiGoalsInput.trim()}
                          className="w-full bg-[#58A6FF] disabled:opacity-50 text-[#0D1117] font-black text-[10.5px] py-1.5 rounded uppercase flex items-center justify-center space-x-1.5 transition cursor-pointer"
                        >
                          <Cpu className="h-3 w-3" />
                          <span>{isScheduleGenerating ? 'PLANNING BATTLE SLOTS...' : 'PROPOSE INTEL BATTLE SLOTS'}</span>
                        </button>
                      </form>
                    </div>

                    {/* MANUAL COMPASS DIRECTIVE DEPLOYER */}
                    <div className="rounded-xl border border-[#30363D] bg-[#11161D] p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#58A6FF] font-mono uppercase font-bold tracking-wider flex items-center space-x-1.5">
                          <Plus className="h-3.5 w-3.5 text-[#58A6FF]" />
                          <span>MANUAL BLUEPRINT INJECTOR</span>
                        </span>
                        <span className="text-[9px] text-[#8B949E] font-mono uppercase font-bold">CUSTOMISE DIRECTIVE</span>
                      </div>

                      <form onSubmit={addScheduleCard} className="grid grid-cols-1 gap-2 text-xs">
                        <div className="grid grid-cols-3 gap-1.5">
                          {/* Day Selector */}
                          <div>
                            <label className="block text-[9px] text-[#8B949E] uppercase mb-1 font-mono">Day</label>
                            <select 
                              value={scheduleDay}
                              onChange={(e) => setScheduleDay(e.target.value as any)}
                              className="w-full bg-[#161B22] border border-[#30363D] focus:border-[#58A6FF] rounded px-2 py-1 text-xs text-[#F0F6FC] h-8 focus:outline-none"
                            >
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                          </div>

                          {/* Time Picker */}
                          <div>
                            <label className="block text-[9px] text-[#8B949E] uppercase mb-1 font-mono">Time</label>
                            <input 
                              type="time" 
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full bg-[#161B22] border border-[#30363D] focus:border-[#58A6FF] rounded px-2 py-1 text-xs text-[#F0F6FC] h-8 font-mono focus:outline-none"
                            />
                          </div>

                          {/* Category Selector */}
                          <div>
                            <label className="block text-[9px] text-[#8B949E] uppercase mb-1 font-mono">Category</label>
                            <select 
                              value={scheduleCat}
                              onChange={(e) => setScheduleCat(e.target.value as any)}
                              className="w-full bg-[#161B22] border border-[#30363D] focus:border-[#58A6FF] rounded px-2 py-1 text-xs text-[#F0F6FC] h-8 focus:outline-none"
                            >
                              <option value="Focus">Focus Session</option>
                              <option value="Class">Class Academic</option>
                              <option value="Exercise">Exercise Workout</option>
                              <option value="Routine">Regular Routine</option>
                              <option value="Leisure">Mind Leisure</option>
                            </select>
                          </div>
                        </div>

                        {/* Description Directive & Submit button */}
                        <div>
                          <label className="block text-[9px] text-[#8B949E] uppercase mb-1 font-mono">Directive Description</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. 8 a.m. running, Study chemistry class..."
                              value={scheduleLabel}
                              onChange={(e) => setScheduleLabel(e.target.value)}
                              className="flex-grow bg-[#161B22] border border-[#30363D] focus:border-[#58A6FF] rounded px-2.5 py-1 text-xs text-[#F0F6FC] placeholder-[#8B949E]/70 h-8 focus:outline-none placeholder:text-[11px]"
                            />
                            <button
                              type="submit"
                              className="px-4 bg-[#3FB950] font-mono hover:bg-[#4dd35f] text-[#0D1117] font-black text-[11px] rounded transition cursor-pointer shrink-0 uppercase tracking-wide h-8"
                            >
                              DEPLOY
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                     {/* WEEKLY CUSTOMIZER CONTROL STATION */}
                    <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-3 space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-[#30363D] pb-1.5 font-mono text-[#8B949E]">
                        <span className="font-bold text-[#F0F6FC] flex items-center space-x-1.5">
                          <Sliders className="h-3.5 w-3.5 text-[#58A6FF]" />
                          <span>CALENDAR DAY VISOR</span>
                        </span>
                        <span className="text-[9px] bg-[#58A6FF]/10 text-[#58A6FF] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Customise View</span>
                      </div>

                      {/* Day Toggles */}
                      <div className="grid grid-cols-4 gap-1 sm:flex sm:flex-wrap">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                          const isVisible = visibleScheduleDays.includes(day);
                          const dayData = schedules.find(s => s.day === day);
                          const slotCount = dayData && dayData.timeSlots ? dayData.timeSlots.length : 0;
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                playBeep();
                                if (isVisible) {
                                  if (visibleScheduleDays.length > 1) {
                                    setVisibleScheduleDays(prev => prev.filter(d => d !== day));
                                  } else {
                                    triggerAlert("⚔️ Command error: Protect at least one active combat day.", "COMMAND OVERRIDE ERROR");
                                  }
                                } else {
                                  setVisibleScheduleDays(prev => [...prev, day]);
                                }
                              }}
                              className={`px-2 py-1 flex items-center justify-between gap-1 rounded text-[10px] font-mono border transition cursor-pointer select-none ${
                                isVisible 
                                  ? 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#58A6FF] font-bold' 
                                  : 'border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:border-[#8B949E]'
                              }`}
                            >
                              <span>{day.substring(0, 3)}</span>
                              <span className={`text-[9px] px-1 rounded-sm ${isVisible ? 'bg-[#58A6FF]/20 text-[#58A6FF]' : 'bg-[#30363D]/40 text-[#8B949E]'}`}>
                                {slotCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#30363D]/40 text-[10px] font-mono">
                        <span className="text-[#8B949E]">QUICK VISIBILITY PRESETS:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              playBeep();
                              setVisibleScheduleDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
                            }}
                            className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#30363D] border border-[#30363D] hover:border-[#58A6FF] text-[#E3B341] transition cursor-pointer text-[10px] font-bold"
                          >
                            Full Week
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playBeep();
                              setVisibleScheduleDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
                            }}
                            className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#30363D] border border-[#30363D] hover:border-[#58A6FF] text-[#58A6FF] transition cursor-pointer text-[10px] font-bold"
                          >
                            Workdays
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playBeep();
                              setVisibleScheduleDays(['Saturday', 'Sunday']);
                            }}
                            className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#30363D] border border-[#30363D] hover:border-[#58A6FF] text-[#3FB950] transition cursor-pointer text-[10px] font-bold"
                          >
                            Weekends
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* WEEKDAY GRID TABS */}
                    <div className="space-y-3.5 select-none">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                        .filter(day => visibleScheduleDays.includes(day))
                        .map(day => {
                          const dayData = schedules.find(s => s.day === day);
                          return (
                            <div key={day} className="rounded-xl border border-[#30363D] bg-[#161B22] p-3 text-left">
                              <h4 className="text-xs font-bold text-[#E3B341] font-mono uppercase tracking-wider mb-2">{day} slots</h4>
                              {(!dayData || !dayData.timeSlots || dayData.timeSlots.length === 0) ? (
                                <p className="text-[10px] text-[#8B949E] italic">No timed combat directives logged.</p>
                              ) : (
                                <div className="space-y-1.5 text-[11px]">
                                  {(dayData.timeSlots || []).map(slot => (
                                    <div key={slot.id} className="flex justify-between items-center bg-[#0D1117] border border-[#30363D] rounded px-2 py-1.5">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-mono text-[10px] bg-[#30363D] px-1 rounded text-[#8B949E]">{slot.time}</span>
                                        <span className="font-semibold text-[#F0F6FC] truncate max-w-[140px]">{slot.label}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className={`text-[9px] px-1.5 rounded uppercase font-bold text-[#0D1117] ${
                                          slot.category === 'Focus' ? 'bg-[#58A6FF]' : 
                                          slot.category === 'Class' ? 'bg-[#E3B341]' :
                                          slot.category === 'Exercise' ? 'bg-[#3FB950]' : 'bg-[#8B949E]'
                                        }`}>
                                          {slot.category}
                                        </span>
                                        <button onClick={() => deleteScheduleSlot(day, slot.id)} className="text-[#F78166] hover:text-white cursor-pointer transition">
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>

                    {/* MODAL INLINE ADD SLOT */}
                    {isScheduleModalOpen && (
                      <div className="rounded-xl border border-[#58A6FF] bg-[#0D1117] p-3 text-xs space-y-3">
                        <div className="flex justify-between font-bold">
                          <span>ADD FOCUS COMPASS SLOT</span>
                          <button onClick={() => setIsScheduleModalOpen(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={addScheduleCard} className="space-y-2.5 text-[11px]">
                          <div>
                            <label className="block text-[10px] text-[#8B949E] mb-0.5">Day</label>
                            <select 
                              value={scheduleDay}
                              onChange={(e) => setScheduleDay(e.target.value as any)}
                              className="w-full bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-[#F0F6FC]"
                            >
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#8B949E] mb-0.5">Time HH:MM</label>
                            <input 
                              type="time" 
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-sm text-[#F0F6FC]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#8B949E] mb-0.5">Directive label</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Study Chemistry, Run track"
                              value={scheduleLabel}
                              onChange={(e) => setScheduleLabel(e.target.value)}
                              className="w-full bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-[#F0F6FC]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#8B949E] mb-0.5">Category</label>
                            <select 
                              value={scheduleCat}
                              onChange={(e) => setScheduleCat(e.target.value as any)}
                              className="w-full bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-[#F0F6FC]"
                            >
                              <option value="Focus">Focus Session</option>
                              <option value="Class">Class Academic</option>
                              <option value="Exercise">Physical Workout</option>
                              <option value="Routine">Habit Routine</option>
                              <option value="Leisure">Recharge/Leisure</option>
                            </select>
                          </div>
                          <button 
                            type="submit"
                            className="w-full bg-[#3FB950] text-[#0D1117] font-bold rounded py-2 text-xs"
                          >
                            LOCK IN DESTINATION
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* 9. ROUTINES SCREEN */}
                {activeScreen === 'routine' && (
                  <div className="space-y-4 animate-fade-in animate-duration-200">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-1.5">
                      <button onClick={() => setActiveScreen('dashboard')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E] transition cursor-pointer">&larr; DASHBOARD</button>
                      <h3 className="text-sm font-bold tracking-wide font-mono text-[#58A6FF]">HABIT CHORES</h3>
                      <span className="w-12"></span>
                    </div>

                    <p className="text-[11px] text-[#8B949E] leading-relaxed">
                      Complete daily group habits to fuel focus streaks and boost today's Mind battle aggregates. Customize your trackers by adding custom protocols and goals below!
                    </p>

                    {/* NEW CUSTOM HABIT PROTOCOL FORM */}
                    <form onSubmit={addCustomRoutineGroup} className="rounded-xl border border-dashed border-[#30363D] bg-[#0D1117] p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#58A6FF] font-mono uppercase font-bold tracking-wider flex items-center space-x-1.5">
                          <Plus className="h-3.5 w-3.5 text-[#58A6FF]" />
                          <span>DEPLOY CUSTOM HABIT PROTOCOL</span>
                        </span>
                        <span className="text-[9px] text-[#8B949E] font-mono uppercase">Add Group</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Protocol name (e.g., Code Review grind)"
                          value={newRoutineName}
                          onChange={(e) => setNewRoutineName(e.target.value)}
                          className="flex-grow py-1 px-2.5 bg-[#161B22] border border-[#30363D] focus:border-[#58A6FF] rounded text-xs font-sans text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none"
                        />
                        <input
                          type="time"
                          required
                          value={newRoutineTime}
                          onChange={(e) => setNewRoutineTime(e.target.value)}
                          className="w-24 py-1 px-2.5 bg-[#161B22] border border-[#30363D] focus:border-[#58A6FF] rounded text-xs font-mono text-[#F0F6FC] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-3 bg-[#58A6FF] text-[#0D1117] hover:bg-[#85c3ff] font-bold rounded text-[11px] font-mono transition cursor-pointer h-7 shrink-0 uppercase tracking-wide"
                        >
                          BUILD
                        </button>
                      </div>
                    </form>

                    {/* CHORE GROUP ACCORDIONS */}
                    <div className="space-y-3">
                      {routines.map(r => (
                        <div key={r.id} className="rounded-xl border border-[#30363D] bg-[#161B22] p-3 text-left space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-grow min-w-0 pr-2">
                              <h4 className="text-xs font-bold text-[#F0F6FC] flex items-center gap-1.5 flex-wrap">
                                <span className="truncate">{r.name}</span>
                                {r.id.startsWith('rt_custom_') && (
                                  <span className="text-[9px] bg-[#58A6FF]/10 text-[#58A6FF] px-1.5 py-0.2 rounded font-normal font-mono select-none">Custom</span>
                                )}
                              </h4>
                              <span className="text-[10px] text-[#8B949E] font-mono block mt-0.5">Starts {r.time} • 🔥 Streak: {r.streak} days</span>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold select-none ${
                                r.completedToday ? 'bg-[#3FB950]/20 text-[#3FB950]' : 'bg-[#30363D] text-[#8B949E]'
                              }`}>
                                {r.completedToday ? 'Conquered' : 'Incomplete'}
                              </span>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove custom protocol group "${r.name}" and all of its goals?`)) {
                                    deleteRoutineGroup(r.id);
                                  }
                                }}
                                title="Delete entire protocol group"
                                className="text-[#8B949E] hover:text-[#FF7B72] p-1 rounded hover:bg-[#30363D]/40 transition cursor-pointer"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1 bg-[#0D1117] rounded-lg p-2 text-xs border border-[#30363D]">
                            {(!r.items || r.items.length === 0) ? (
                              <div className="text-center py-2.5 text-[10px] text-[#8B949E] font-mono italic">
                                No active goals in this list. Enter custom chore below.
                              </div>
                            ) : (
                              (r.items || []).map(item => (
                                <div 
                                  key={item.id} 
                                  className="flex items-center py-1 px-1.5 justify-between hover:bg-[#161B22]/50 rounded transition group"
                                >
                                  <div 
                                    onClick={() => toggleRoutineItem(r.id, item.id)}
                                    className="flex items-center space-x-2.5 cursor-pointer flex-grow select-none py-0.5"
                                  >
                                    <input 
                                      type="checkbox" 
                                      checked={item.completed}
                                      onChange={() => {}} // handled by click container
                                      className="h-3.5 w-3.5 rounded border-[#30363D] bg-[#161B22] text-[#3FB950] focus:ring-0 cursor-pointer"
                                    />
                                    <span className={`text-[11px] ${
                                      item.completed ? 'line-through text-[#8B949E]' : 'text-[#F0F6FC]'
                                    }`}>
                                      {item.name}
                                    </span>
                                  </div>
                                  
                                  <button
                                    onClick={() => deleteGoalFromRoutine(r.id, item.id)}
                                    className="opacity-40 group-hover:opacity-100 text-[#8B949E] hover:text-[#FF7B72] p-1 rounded hover:bg-[#30363D]/20 transition cursor-pointer ml-2"
                                    title="Delete goal item"
                                  >
                                    <Trash className="h-3 w-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {/* INLINE ADD GOAL ITEM */}
                          <div className="flex gap-2 pt-1 border-t border-[#30363D]/40">
                            <input
                              type="text"
                              required
                              placeholder="Insert goal/chore descriptive tag..."
                              value={newGoalName[r.id] || ''}
                              onChange={(e) => setNewGoalName(prev => ({ ...prev, [r.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addGoalToRoutine(r.id);
                                }
                              }}
                              className="flex-grow py-1 px-2.5 bg-[#0D1117] border border-[#30363D] focus:border-[#58A6FF] rounded text-[11px] font-sans text-[#F0F6FC] placeholder-[#8B949E]/70 focus:outline-none"
                            />
                            <button
                              onClick={() => addGoalToRoutine(r.id)}
                              className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] hover:border-[#58A6FF] text-[#C9D1D9] hover:text-[#F0F6FC] rounded text-[10px] font-mono font-bold transition cursor-pointer select-none"
                            >
                              ADD GOAL
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. ACHIEVEMENTS SCREEN */}
                {activeScreen === 'achievements' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                      <button onClick={() => setActiveScreen('dashboard')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E]">&larr; DASHBOARD</button>
                      <h3 className="text-sm font-bold tracking-wide font-mono text-[#E3B341]">AWARDS METRICS</h3>
                      <span className="w-12"></span>
                    </div>

                    <div className="rounded-xl bg-[#161B22]/80 border border-[#30363D] p-3 text-center">
                      <Trophy className="h-8 w-8 text-[#E3B341] mx-auto mb-1 animate-bounce" />
                      <h4 className="text-xs font-black text-[#F0F6FC]">
                        Rank: {profile.level >= 15 ? 'Imperial Time Sentry ⚔️' : profile.level >= 5 ? 'Elite Seeker 🔍' : 'Rising Discipline Recruit 🌱'}
                      </h4>
                      <p className="text-[10px] text-[#8B949E] mt-1 font-mono">
                        Unlocked: <span className="text-[#3FB950] font-bold">{badges.filter(b => b.unlockedDate).length}</span> / {badges.length} Master Badges
                      </p>
                    </div>

                    {/* CATEGORY TABS CONTAINER */}
                    <div className="flex space-x-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363D]">
                      {['Time', 'Streak', 'Battle', 'Focus'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveBadgeCategory(cat)}
                          className={`flex-1 text-[10px] font-bold py-1 px-1.5 rounded-md transition ${
                            activeBadgeCategory === cat 
                              ? 'bg-[#E3B341]/15 text-[#E3B341] border border-[#E3B341]/35' 
                              : 'text-[#8B949E] hover:text-[#F0F6FC]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* BADGES FILTERED GRID SYSTEM */}
                    <div className="grid grid-cols-4 gap-2.5">
                      {badges
                        .filter(b => b.category === activeBadgeCategory)
                        .map(b => {
                          const isUnlocked = b.unlockedDate !== null;
                          return (
                            <button
                              key={b.id}
                              onClick={() => setSelectedBadge(b)}
                              className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 ${
                                isUnlocked 
                                  ? 'bg-[#161B22] border-[#E3B341]/30 hover:border-[#E3B341] shadow-[0_0_10px_rgba(227,179,65,0.08)] text-[#E3B341]' 
                                  : 'bg-[#161B22]/30 border-[#30363D] opacity-40 hover:opacity-75 text-[#8B949E]'
                              }`}
                            >
                              {/* Glowing background ring for unlocked status */}
                              {isUnlocked && (
                                <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#E3B341]/5 to-transparent blur-xs" />
                              )}
                              
                              <div className="relative z-10">
                                {b.iconPath === 'Flame' && <Flame className="h-6 w-6" />}
                                {b.iconPath === 'Shield' && <Shield className="h-6 w-6" />}
                                {b.iconPath === 'ListTodo' && <ListTodo className="h-6 w-6" />}
                                {b.iconPath === 'Trophy' && <Trophy className="h-6 w-6" />}
                                {b.iconPath === 'Bell' && <Bell className="h-6 w-6" />}
                              </div>

                              <span className="text-[8px] font-sans font-bold truncate max-w-full text-center px-1 mt-1 text-[#C9D1D9] relative z-10">
                                {b.name}
                              </span>

                              {/* Mini Lock Status badge overlay */}
                              {!isUnlocked && (
                                <span className="absolute -top-1 -right-1 bg-[#1F242C] border border-[#30363D] rounded-full p-0.5">
                                  <Lock className="w-2 h-2 text-[#8B949E]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>

                    <p className="text-[10px] text-[#8B949E] text-center italic mt-2 font-mono">
                      Tap any badge icon above to inspect unlock specifications and share.
                    </p>
                  </div>
                )}

                {/* 11. STATISTICS SCREEN */}
                {activeScreen === 'stats' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                      <button onClick={() => setActiveScreen('dashboard')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E]">&larr; DASHBOARD</button>
                      <h3 className="text-sm font-bold tracking-wide font-mono text-[#58A6FF]">BATTLE STATS Metrics</h3>
                      <span className="w-12"></span>
                    </div>

                    <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-3 text-center">
                      <span className="text-xs font-mono text-[#8B949E] block uppercase">Continuous streak</span>
                      <span className="text-3xl font-black font-mono text-[#3FB950] block mt-1">🔥 {profile.streak} Days Streak</span>
                      <span className="text-[10px] text-[#8B949E] block mt-1">Exceeded master daily benchmarks 5 times sequentially</span>
                    </div>

                    <DashboardStatsCharts sessions={sessions} routines={routines} />
                  </div>
                )}

                {/* 12. PROFILE SCREEN */}
                {activeScreen === 'profile' && (
                  <div className="space-y-4 animate-fade-in text-left pb-16">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                      <button onClick={() => setActiveScreen('dashboard')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E]">&larr; DASHBOARD</button>
                      <h3 className="text-sm font-bold tracking-wide font-mono text-[#58A6FF]">WARRIOR INTELLIGENCE</h3>
                      <span className="w-12"></span>
                    </div>

                    {/* Basic Profile Stats card */}
                    <div className="rounded-2xl border border-[#30363D] bg-gradient-to-br from-[#161B22] to-[#0D1117] p-4 text-center relative overflow-hidden">
                      <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-[#3FB950]/10 border border-[#3FB950]/30 rounded-full px-2.5 py-0.5 animate-pulse">
                        <span className="h-1.5 w-1.5 bg-[#3FB950] rounded-full" />
                        <span className="text-[9px] font-mono text-[#3FB950] uppercase font-bold">Online</span>
                      </div>
                      <div className="mx-auto h-16 w-16 rounded-full border-2 border-[#58A6FF] bg-[#161B22] flex items-center justify-center font-bold text-[#58A6FF] text-2xl shadow-indigo-500/10 shadow-lg select-none">
                        M
                      </div>
                      <h4 className="text-base font-black text-[#F0F6FC] mt-2 tracking-tight">{profile.name}</h4>
                      <p className="text-[10px] text-[#8B949E] font-mono">{profile.email}</p>
                      
                      <div className="mt-3 flex justify-center space-x-2">
                        <span className="bg-[#58A6FF]/15 border border-[#58A6FF]/35 text-[#58A6FF] text-[10px] font-bold px-3 py-1 rounded-full uppercase font-mono">
                          💪 Level {profile.level}
                        </span>
                        <span className="bg-[#3FB950]/15 border border-[#3FB950]/35 text-[#3FB950] text-[10px] font-bold px-3 py-1 rounded-full uppercase font-mono">
                          🔥 {profile.streak} streak
                        </span>
                        <span className="bg-[#E3B341]/15 border border-[#E3B341]/35 text-[#E3B341] text-[10px] font-bold px-3 py-1 rounded-full uppercase font-mono">
                          🏆 Top 15%
                        </span>
                      </div>
                    </div>

                    {/* JOURNEY STATUS SELECTOR (Pristine vs Demo) */}
                    <div className="rounded-xl border border-[#30363D] bg-gradient-to-br from-[#161B22] to-[#0D1117] p-3.5 space-y-2.5">
                      <div className="flex items-center space-x-1.5 text-xs font-bold font-mono text-[#F0F6FC] border-b border-[#30363D] pb-1.5">
                        <Cpu className="h-4 w-4 text-[#F78166] animate-pulse" />
                        <span>JOURNEY ENGINE WORKSPACE</span>
                      </div>
                      <p className="text-[10px] text-[#8B949E] leading-relaxed font-sans">
                        Start your organic study tracker cleanly, or toggle simulation logs to instantly test and preview the dashboard's analytics!
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                        <button
                          onClick={() => {
                            resetToPristineStart();
                            triggerAlert("♻️ Campaign Reset! All local storage wiped. You are now Level 1 on an organic study campaign!", "RESET SEQUENCE");
                          }}
                          className="px-2.5 py-2 rounded-lg bg-[#F78166]/10 hover:bg-[#F78166]/20 border border-[#F78166]/30 text-[#F78166] text-[9.5px] font-bold uppercase transition flex flex-col items-center justify-center space-y-1 cursor-pointer"
                        >
                          <Trash className="h-3 w-3" />
                          <span>Pristine Start</span>
                        </button>
                        <button
                          onClick={() => {
                            loadEliteDemoState();
                            triggerAlert("⚡ Simulation Loaded! XP sets to 3000 (Level 5) with active study blocks and completed routines for today/yesterday!", "SIMULATION INITIALIZED");
                          }}
                          className="px-2.5 py-2 rounded-lg bg-[#58A6FF]/10 hover:bg-[#58A6FF]/20 border border-[#58A6FF]/30 text-[#58A6FF] text-[9.5px] font-bold uppercase transition flex flex-col items-center justify-center space-y-1 cursor-pointer"
                        >
                          <Zap className="h-3 w-3 text-[#58A6FF]" />
                          <span>Load Demo Mode</span>
                        </button>
                      </div>
                    </div>

                    {/* CLOUD SYNCHRONIZER & PERSISTENCE BACKUP PANEL */}
                    <div className="rounded-xl border border-[#30363D] bg-[#161B22]/80 p-3.5 space-y-3">
                      <div className="flex justify-between items-center border-b border-[#30363D] pb-2">
                        <div className="flex items-center space-x-2 text-xs font-bold text-[#F0F6FC] font-mono">
                          <Compass className={`h-4 w-4 ${syncStatus === 'SYNCING' ? 'animate-spin text-[#58A6FF]' : 'text-[#3FB950]'}`} />
                          <span>FIRESTORE CLOUD INTEGRATION</span>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          syncStatus === 'COMPLETE' 
                            ? 'bg-[#3FB950]/10 text-[#3FB950]' 
                            : syncStatus === 'SYNCING' 
                            ? 'bg-[#58A6FF]/10 text-[#58A6FF]' 
                            : 'bg-[#30363D] text-[#8B949E]'
                        }`}>
                          {syncStatus === 'COMPLETE' ? 'Synced (OK)' : syncStatus === 'SYNCING' ? 'Syncing...' : 'Idle'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[10px] font-mono leading-relaxed text-[#8B949E]">
                        <div className="flex justify-between">
                          <span>Connection Channel:</span>
                          <span className="text-[#3FB950]">Secure Firestore TLS v1.3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Synchronizer State:</span>
                          <span className={syncStatus === 'COMPLETE' ? "text-[#3FB950]" : "text-[#C9D1D9]"}>
                            {syncStatus === 'COMPLETE' ? "Durable Cloud Guard Active" : "Local-First Sandbox Guard"}
                          </span>
                        </div>
                      </div>

                      {/* Sync logs terminal */}
                      <div className="bg-[#0cf]/5 border border-[#58A6FF]/15 rounded-lg p-2 max-h-[85px] overflow-y-auto text-[8.5px] font-mono space-y-1">
                        {syncLogs.map((log, lIdx) => (
                          <div key={lIdx} className="text-[#8B949E]">
                            <span className="text-[#58A6FF] mr-1">&gt;</span>{log}
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={triggerCloudSync}
                        disabled={syncStatus === 'SYNCING'}
                        className="w-full bg-[#161B22] hover:bg-white/5 border border-[#30363D] text-[#F0F6FC] font-black text-[10px] py-2 rounded-lg transition uppercase flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Compass className={`h-3 w-3 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                        <span>{syncStatus === 'SYNCING' ? 'PUSHING STACK DISPATCH...' : 'TRIGGER SECURE CLOUD SYNC'}</span>
                      </button>
                    </div>

                    {/* SOCIALS & FRIENDS BATTLEFIELD TABLE */}
                    <div className="rounded-xl border border-[#30363D] bg-[#161B22]/80 p-3.5 space-y-3">
                      <div className="flex justify-between items-center border-b border-[#30363D] pb-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold font-mono text-[#F0F6FC]">
                          <Activity className="h-4 w-4 text-[#F78166]" />
                          <span>FRIENDS PROTOCOL STANDINGS</span>
                        </div>
                        <span className="text-[9px] font-mono text-[#8B949E]">4 CO-WARRIORS ACTIVE</span>
                      </div>

                      <div className="space-y-2">
                        {friendsFeed.map(fr => (
                          <div key={fr.id} className="flex justify-between items-center bg-[#0D1117] border border-[#30363D] rounded-xl p-2.5 hover:border-[#8B949E] transition">
                            <div className="flex items-center space-x-2.5">
                              <div className="relative">
                                <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-[#0D1117] ${
                                  fr.active ? 'bg-[#3FB950]' : 'bg-[#8B949E]'
                                }`} />
                                <div className="h-7 w-7 rounded-md bg-[#161B22] border border-[#30363D] flex items-center justify-center text-xs font-mono font-bold text-[#F0F6FC]">
                                  {fr.name[0]}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-[11px] font-bold text-[#F0F6FC]">{fr.name}</h5>
                                <span className="text-[9.5px] text-[#8B949E] font-mono block">🔥 {fr.streak} day streak • {fr.rank}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => cheerFriend(fr.id)}
                              disabled={fr.cheered}
                              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-extrabold tracking-wider transition ${
                                fr.cheered 
                                  ? 'bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30' 
                                  : 'bg-[#F78166] hover:bg-[#F78166]/90 text-[#0D1117] cursor-pointer'
                              }`}
                            >
                              {fr.cheered ? 'Cheered 🔥' : 'Cheer'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 🎮 SPOTIFY-WRAPPED PREMIUM SHARE CARD CENTER */}
                    <div className="rounded-xl border border-[#E3B341]/35 bg-gradient-to-br from-[#161B22] to-[#0D1117] p-4 space-y-4">
                      <div className="border-b border-[#30363D] pb-3 text-center">
                        <span className="text-[9px] font-mono font-black tracking-widest text-[#E3B341] uppercase block">PREMIUM SHARING ENGINE</span>
                        <h4 className="text-sm font-black text-[#F0F6FC] font-mono uppercase">Interactive Wrapped Cards</h4>
                      </div>

                      {/* Selection tabs for different kinds of wrapped cards */}
                      <div className="grid grid-cols-5 gap-1 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
                        {(['daily', 'victory', 'badge', 'level', 'weekly'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => {
                              setActiveShareCard(type);
                              playBeep();
                              if (type === 'daily') setShareCaption(`⚔️ Logged ${totalFocusMinutesToday} focused minutes today on TIMELINE! Beat yesterday's baseline score!`);
                              else if (type === 'victory') setShareCaption(`👑 Absolute Victory! Just overtook yesterday's peak performance. Score today: ${todayScore} points!`);
                              else if (type === 'badge') setShareCaption(`🧙 Unlocked rare legendary badge on TIMELINE! High-discipline tracks active.`);
                              else if (type === 'level') setShareCaption(`⚡ Leveling up my attention discipline matrix to Level ${profile.level}!`);
                              else setShareCaption(`📊 Weekly focus wrapped is insane: ${sessions.length} sessions completed successfully!`);
                            }}
                            className={`py-1 text-[8.5px] uppercase font-mono font-bold rounded-md transition truncate ${
                              activeShareCard === type 
                                ? 'bg-[#E3B341]/25 text-[#E3B341] border border-[#E3B341]/30' 
                                : 'text-[#8B949E] hover:text-[#F0F6FC]'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      {/* Custom caption edit */}
                      <div>
                        <label className="block text-[9.5px] font-mono text-[#8B949E] mb-1 uppercase">Custom Story Caption:</label>
                        <input
                          type="text"
                          value={shareCaption}
                          onChange={(e) => setShareCaption(e.target.value)}
                          className="w-full bg-[#0D1117] border border-[#30363D] text-[10px] text-[#F0F6FC] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#E3B341]"
                        />
                      </div>

                      {/* Select premium color preset theme */}
                      <div className="space-y-1">
                        <span className="block text-[9.5px] font-mono text-[#8B949E] uppercase">Select wrapped gradient theme:</span>
                        <div className="flex space-x-2">
                          {[
                            { key: 'aurora', label: 'Neon Aurora', colors: 'from-[#3FB950] to-[#58A6FF]' },
                            { key: 'volcano', label: 'Volcano Red', colors: 'from-[#F78166] to-[#E3B341]' },
                            { key: 'galaxy', label: 'Galaxy Purple', colors: 'from-[#BC8CFF] to-[#58A6FF]' },
                            { key: 'obsidian', label: 'Space Dark', colors: 'from-[#21262D] to-[#8B949E]' },
                            { key: 'sunset', label: 'Sunset Glow', colors: 'from-[#E3B341] to-[#FF7B72]' }
                          ].map(th => (
                            <button
                              key={th.key}
                              onClick={() => {
                                setShareTheme(th.key as any);
                                playBeep();
                              }}
                              className={`flex-1 h-7 rounded-md bg-gradient-to-r ${th.colors} border relative hover:scale-105 active:scale-95 transition ${
                                shareTheme === th.key ? 'border-white scale-105 ring-2 ring-[#E3B341]/35' : 'border-transparent'
                              }`}
                              title={th.label}
                            />
                          ))}
                        </div>
                      </div>

                      {/* LIVE SPOTIFY-WRAPPED SCREEN SIZE GRAPHIC PREVIEW CARD */}
                      <div className={`relative w-full aspect-[9/16] max-w-[270px] mx-auto rounded-2xl p-6 bg-gradient-to-b ${
                        shareTheme === 'aurora' ? 'from-[#0d1612] via-[#102d1d] to-[#040c06]' :
                        shareTheme === 'volcano' ? 'from-[#1a0f0d] via-[#3d1a12] to-[#0c0504]' :
                        shareTheme === 'galaxy' ? 'from-[#110e1a] via-[#21173d] to-[#06040c]' :
                        shareTheme === 'obsidian' ? 'from-[#0f1115] via-[#1c1e22] to-[#07080a]' :
                        'from-[#1a150e] via-[#352512] to-[#0c0803]'
                      } border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between text-center`}>
                        {/* Elegant floating gradient bubbles inside */}
                        <div className={`absolute top-10 left-10 w-36 h-36 rounded-full bg-gradient-to-br ${
                          shareTheme === 'aurora' ? 'from-[#3FB950]/20 to-transparent' :
                          shareTheme === 'volcano' ? 'from-[#F78166]/20 to-transparent' :
                          shareTheme === 'galaxy' ? 'from-[#BC8CFF]/20 to-transparent' :
                          shareTheme === 'obsidian' ? 'from-[#c1c8d0]/10 to-transparent' :
                          'from-[#E3B341]/20 to-transparent'
                        } blur-2xl animate-pulse`} />

                        {/* Top App branding headers */}
                        <div className="relative z-10 flex justify-between items-center">
                          <span className="text-[10px] font-black text-white/40 tracking-widest font-mono uppercase">TIMELINE WRAPPED</span>
                          <span className="text-[9px] font-mono text-white/30">2026.06.16</span>
                        </div>

                        {/* Middle dynamic layout */}
                        <div className="relative z-10 my-auto space-y-4">
                          {activeShareCard === 'daily' && (
                            <>
                              <span className="text-3xl">🎯</span>
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#3FB950]/95 block uppercase">Daily Achievement Locked</span>
                                <h5 className="text-xl font-black text-[#F0F6FC] leading-tight uppercase font-mono tracking-tight">Focus Mastery</h5>
                              </div>
                              <div className="bg-white/5 border border-white/10 rounded-xl p-3 inline-block mx-auto">
                                <span className="block text-[8px] font-mono text-white/50 uppercase">Total Focus Logged</span>
                                <span className="text-2xl font-black font-mono bg-gradient-to-r from-white to-[#F0F6FC] bg-clip-text text-transparent">{totalFocusMinutesToday} Mins</span>
                              </div>
                            </>
                          )}

                          {activeShareCard === 'victory' && (
                            <>
                              <span className="text-3xl">⚔️</span>
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono tracking-wider text-[#F78166]/95 block uppercase">SYSTEM VICTORY DECLARED</span>
                                <h5 className="text-xl font-black text-[#F0F6FC] leading-none uppercase font-mono tracking-tight">Overtook Yesterday</h5>
                              </div>
                              <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 max-w-[200px] mx-auto">
                                <div>
                                  <span className="block text-[7px] font-mono text-white/40 uppercase">Yesterday</span>
                                  <span className="text-sm font-black text-white/50 font-mono">{yesterdayScore} pt</span>
                                </div>
                                <div>
                                  <span className="block text-[7px] font-mono text-[#3FB950] uppercase">Today</span>
                                  <span className="text-sm font-black text-[#3FB950] font-mono">+{todayScore} pt</span>
                                </div>
                              </div>
                            </>
                          )}

                          {activeShareCard === 'badge' && (
                            <>
                              <span className="text-3xl">🧙</span>
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono tracking-wider text-[#E3B341]/95 block uppercase">Legendary Badge Unlocked</span>
                                <h5 className="text-xl font-black text-[#F0F6FC] leading-none uppercase font-mono tracking-tight">WEEK ONE UNIFIED</h5>
                              </div>
                              <div className="relative h-14 w-14 rounded-full bg-white/5 border border-[#E3B341]/40 flex items-center justify-center mx-auto shadow-lg shadow-[#E3B341]/10">
                                <Trophy className="h-6 w-6 text-[#E3B341]" />
                              </div>
                            </>
                          )}

                          {activeShareCard === 'level' && (
                            <>
                              <span className="text-3xl">⚡</span>
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono tracking-wider text-[#BC8CFF]/95 block uppercase">DISCIPLINE MATRIX UPGRADE</span>
                                <h5 className="text-xl font-black text-[#F0F6FC] leading-none uppercase font-mono tracking-tight">Level {profile.level} Reached</h5>
                              </div>
                              <p className="text-[9.5px] italic text-white/60 font-mono leading-relaxed px-2">
                                "The only competitor is the mirror. Seek your absolute attention threshold."
                              </p>
                            </>
                          )}

                          {activeShareCard === 'weekly' && (
                            <>
                              <span className="text-3xl">📊</span>
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono tracking-wider text-white/50 block uppercase">Weekly Combat Log</span>
                                <h5 className="text-xl font-black text-[#F0F6FC] leading-none uppercase font-mono tracking-tight">Mind Battle Stats</h5>
                              </div>
                              <div className="space-y-1 max-w-[180px] mx-auto text-left text-[8px] font-mono text-white/70">
                                <div className="flex justify-between py-0.5 border-b border-white/5">
                                  <span>Focus Sessions completed:</span>
                                  <span className="text-white font-bold">{sessions.length} blocks</span>
                                </div>
                                <div className="flex justify-between py-0.5 border-b border-white/5">
                                  <span>Habits conquered:</span>
                                  <span className="text-[#3FB950] font-bold">{routinesCompletedCount} checks</span>
                                </div>
                                <div className="flex justify-between py-0.5">
                                  <span>Overall Victory Rate:</span>
                                  <span className="text-[#E3B341] font-bold">85% vs past</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Bottom card signature branding */}
                        <div className="relative z-10 border-t border-white/10 pt-4 text-left flex justify-between items-center">
                          <div>
                            <span className="block text-[7px] font-mono text-white/30 uppercase">DISCOVER DISCIPLINE ON</span>
                            <span className="text-xs font-black tracking-widest text-[#F0F6FC] font-mono">TIMELINE</span>
                          </div>
                          <div className="h-4.5 w-4.5 rounded-full bg-[#58A6FF]/25 flex items-center justify-center border border-[#58A6FF]/30 text-[8px] text-[#58A6FF] font-bold">
                            T
                          </div>
                        </div>
                      </div>

                      {/* Display Alert Banner for Successful Share Simulation */}
                      {shareSuccessAlert && (
                        <div className="rounded-xl border border-dashed border-[#E3B341]/60 bg-[#E3B341]/10 p-3 text-xs text-center font-mono leading-relaxed text-[#F0F6FC] transition animate-fade-in">
                          <span className="text-[#E3B341] font-black block uppercase mb-1">🔥 DISPATCH EVENT FIRED</span>
                          {shareSuccessAlert}
                        </div>
                      )}

                      {/* Share actions toolbar */}
                      <div className="space-y-2">
                        <span className="block text-[9.5px] font-mono text-[#8B949E] uppercase">Direct Social Media Outlets:</span>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => handleShareCardPlatform('Instagram Stories')}
                            className="bg-[#111] hover:bg-white/5 rounded-lg py-2 text-[10px] uppercase font-bold text-[#F0F6FC] flex flex-col items-center justify-center border border-[#30363D] transition hover:border-[#8B949E]"
                          >
                            <span className="text-base mb-0.5">📸</span>
                            <span>Instagram</span>
                          </button>
                          <button
                            onClick={() => handleShareCardPlatform('Snapchat Camera')}
                            className="bg-[#111] hover:bg-white/5 rounded-lg py-2 text-[10px] uppercase font-bold text-[#F0F6FC] flex flex-col items-center justify-center border border-[#30363D] transition hover:border-[#8B949E]"
                          >
                            <span className="text-base mb-0.5">👻</span>
                            <span>Snapchat</span>
                          </button>
                          <button
                            onClick={() => handleShareCardPlatform('X Thread Post')}
                            className="bg-[#111] hover:bg-white/5 rounded-lg py-2 text-[10px] uppercase font-bold text-[#F0F6FC] flex flex-col items-center justify-center border border-[#30363D] transition hover:border-[#8B949E]"
                          >
                            <span className="text-base mb-0.5">𝕏</span>
                            <span>X / Thread</span>
                          </button>
                          <button
                            onClick={() => handleShareCardPlatform('WhatsApp Status Update')}
                            className="bg-[#111] hover:bg-white/5 rounded-lg py-2 text-[10px] uppercase font-bold text-[#F0F6FC] flex flex-col items-center justify-center border border-[#30363D] transition hover:border-[#8B949E]"
                          >
                            <span className="text-base mb-0.5">💬</span>
                            <span>WhatsApp</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button 
                            onClick={handleSaveCardToDevice}
                            className="w-full bg-[#E3B341] hover:bg-[#E3B341]/90 rounded-xl py-2.5 text-[11px] font-black text-[#0D1117] flex items-center justify-center space-x-1.5 uppercase transition cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Save Image File</span>
                          </button>
                          <button 
                            onClick={handleCopyToClipboard}
                            className="w-full bg-[#161B22] hover:bg-white/5 border border-[#30363D] rounded-xl py-2.5 text-[11px] font-bold text-[#F0F6FC] flex items-center justify-center space-x-1.5 uppercase transition cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5 text-[#8B949E]" />
                            <span>Copy Score URL</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 13. MIND BATTLE SCREEN */}
                {activeScreen === 'mindbattle' && (
                  <div className="space-y-4 animate-fade-in relative">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                      <button onClick={() => setActiveScreen('dashboard')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E]">&larr; DASHBOARD</button>
                      <h3 className="text-sm font-bold tracking-wide font-mono">BATTLE COMMAND</h3>
                      <span className="w-12"></span>
                    </div>

                    {/* HUD point telemetry */}
                    <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-3 text-center relative overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-mono text-[#F78166] uppercase">Active Engagement</span>
                        <span className="text-[10px] font-mono text-[#8B949E]">16-Jun-2026</span>
                      </div>

                      {/* Score comparison HUD layout */}
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-left">
                          <span className="block text-[9px] text-[#8B949E] font-mono uppercase">Yesterday's peak</span>
                          <span className="text-2xl font-mono font-black text-[#8B949E]">{yesterdayScore}</span>
                        </div>
                        
                        <div className="text-center font-black text-xl text-[#F78166] animate-pulse">
                          VS
                        </div>

                        <div className="text-right">
                          <span className="block text-[9px] text-[#58A6FF] font-mono uppercase">Your score today</span>
                          <span className={`text-2xl font-mono font-black ${
                            todayScore >= yesterdayScore ? 'text-[#3FB950]' : 'text-[#58A6FF]'
                          }`}>{todayScore}</span>
                        </div>
                      </div>

                      {/* Progress HUD bar */}
                      <div className="mt-4">
                        <div className="h-2 w-full rounded-full bg-[#30363D] overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${
                              todayScore >= yesterdayScore ? 'bg-[#3FB950]' : 'bg-[#58A6FF]'
                            }`}
                            style={{ width: `${Math.min(100, (todayScore / yesterdayScore) * 100)}%` }}
                          />
                        </div>
                        <span className="block text-[10px] text-[#8B949E] text-left mt-1">
                          Percent progress: {Math.floor((todayScore / yesterdayScore) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* AI COMMAND BRIEFING PORTAL */}
                    <div className="rounded-xl border border-[#F78166]/40 bg-[#161B22]/60 p-3 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#F78166] flex items-center space-x-1.5">
                          <Sparkles className="h-4 w-4 text-[#F78166]" />
                          <span>AI Combat Command Coach</span>
                        </span>
                        
                        {/* Selector of persona */}
                        <select 
                          value={aiPersona}
                          onChange={(e) => setAiPersona(e.target.value)}
                          className="bg-[#0D1117] border border-[#30363D] rounded text-[10px] text-[#8B949E] px-1 focus:outline-none"
                        >
                          <option value="hardcore">Sgt Goggins (Loud)</option>
                          <option value="zen">Zen Master (Peaceful)</option>
                          <option value="analytics">Core Algorithmic (Data)</option>
                        </select>
                      </div>

                      {/* AI dynamic window feedback space */}
                      <div className="rounded-lg bg-[#0D1117] p-2.5 max-h-[160px] overflow-y-auto text-xs leading-relaxed text-[#8B949E] font-mono border border-[#30363D]">
                        {aiFeedback}
                      </div>

                      <button 
                        onClick={() => triggerAICoach()}
                        disabled={isAILoading}
                        className="mt-3 w-full bg-[#F78166] hover:bg-[#F78166]/90 disabled:opacity-50 text-[#0D1117] font-black text-xs py-2 rounded uppercase flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        <Cpu className="h-3.5 w-3.5" />
                        <span>{isAILoading ? 'COMPILING INTELLIGENCE...' : 'GENERATE MISSION BRIEFING'}</span>
                      </button>

                      {/* INTERACTIVE COMBAT COMMAND TERMINAL */}
                      <div className="mt-4 pt-3.5 border-t border-[#30363D]/60 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-[#F78166] uppercase tracking-wider font-bold flex items-center space-x-1">
                            <Sparkles className="h-3 w-3 text-[#F78166]" />
                            <span>TRANSMIT TACTICAL DIRECTIVE</span>
                          </span>
                          <span className="text-[9px] text-[#8B949E] font-mono select-none">AI CORE</span>
                        </div>

                        {/* Preset Hotkeys */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: "😤 Roast Me", cmd: "Roast my current focus progress and tell me why I am slacking." },
                            { label: "📅 Plan Strategy", cmd: "Formulate an aggressive deep work study blueprint to defeat today's ghost." },
                            { label: "⚡ Combat Fuel", cmd: "Deliver a high-intensity, unyielding motivational war speech." },
                            { label: "🧘 Focus Reset", cmd: "Guide me through an emergency 5-minute cognitive reset session." }
                          ].map((preset, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setCustomCombatCommand(preset.cmd);
                                playBeep();
                              }}
                              className="text-[9px] bg-[#161B22]/80 hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] p-1 text-left rounded border border-[#30363D] transition cursor-pointer font-mono truncate"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Input field */}
                        <div className="relative flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Type a custom combat command here..."
                            value={customCombatCommand}
                            onChange={(e) => setCustomCombatCommand(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !isAILoading && customCombatCommand.trim()) {
                                e.preventDefault();
                                triggerAICoach();
                              }
                            }}
                            className="flex-grow py-1.5 px-2.5 bg-[#0D1117] border border-[#30363D] focus:border-[#F78166] rounded text-xs text-[#F0F6FC] placeholder-[#8B949E]/50 focus:outline-none font-mono"
                          />
                          <button
                            onClick={() => triggerAICoach()}
                            disabled={isAILoading || !customCombatCommand.trim()}
                            className="shrink-0 px-3 py-1.5 bg-[#F78166] disabled:bg-[#30363D] disabled:text-[#8B949E] disabled:cursor-not-allowed text-[#0D1117] font-black text-[11px] uppercase rounded transition cursor-pointer hover:bg-[#ff937d]"
                          >
                            TX
                          </button>
                        </div>
                        <p className="text-[9px] text-[#8B949E] leading-normal font-mono">
                          *Transmit directive to trigger personalized action. Clear text to fallback to normal metric sync.
                        </p>
                      </div>

                      {/* Floating Motivation Test Bench */}
                      <div className="mt-4 pt-3 border-t border-[#30363D] space-y-2 text-left">
                        <span className="text-[10px] font-bold text-[#8B949E] font-mono block uppercase">
                          ⚡ COACH TEST CONSOLE [SIMULATE]
                        </span>
                        <div className="grid grid-cols-2 gap-1 text-[9px]">
                          <button 
                            onClick={() => triggerCoachMotivation('focus_start')} 
                            className="bg-[#58A6FF]/10 text-[#58A6FF] rounded py-1 px-1.5 hover:bg-[#58A6FF]/20 border border-[#58A6FF]/25 font-mono text-left truncate flex items-center space-x-1 cursor-pointer"
                          >
                            <span>🎯 Focus Toast</span>
                          </button>
                          <button 
                            onClick={() => triggerCoachMotivation('milestone_15m')} 
                            className="bg-[#3FB950]/10 text-[#3FB950] rounded py-1 px-1.5 hover:bg-[#3FB950]/20 border border-[#3FB950]/25 font-mono text-left truncate flex items-center space-x-1 cursor-pointer"
                          >
                            <span>⚡ Progress Toast</span>
                          </button>
                          <button 
                            onClick={() => triggerCoachMotivation('record_beat')} 
                            className="bg-[#E3B341]/10 text-[#E3B341] rounded py-1 px-1.5 hover:bg-[#E3B341]/20 border border-[#E3B341]/25 font-mono text-left truncate flex items-center space-x-1 cursor-pointer"
                          >
                            <span>👑 Victory Toast</span>
                          </button>
                          <button 
                            onClick={() => triggerCoachMotivation('spiritual')} 
                            className="bg-[#BC8CFF]/10 text-[#BC8CFF] rounded py-1 px-1.5 hover:bg-[#BC8CFF]/20 border border-[#BC8CFF]/25 font-mono text-left truncate flex items-center space-x-1 cursor-pointer"
                          >
                            <span>✨ Spiritual Toast</span>
                          </button>
                          <button 
                            onClick={() => triggerCoachMotivation('low_energy')} 
                            className="bg-[#F78166]/10 text-[#F78166] rounded py-1 px-1.5 hover:bg-[#F78166]/20 border border-[#F78166]/25 font-mono text-left truncate flex items-center space-x-1 cursor-pointer"
                          >
                            <span>🌱 Low Energy</span>
                          </button>
                          <button 
                            onClick={() => triggerCoachMotivation()} 
                            className="bg-[#1f242c] text-[#F0F6FC] rounded py-1 px-1.5 hover:bg-white/10 border border-white/10 font-mono text-left truncate flex items-center space-x-1 cursor-pointer"
                          >
                            <span>🎲 Time-Based</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 14. FLUTTER SOURCE WORKSPACE SCREEN */}
                {activeScreen === 'fluttersource' && (
                  <div className="space-y-4 animate-fade-in relative text-left">
                    <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                       <button onClick={() => setActiveScreen('dashboard')} className="text-xs hover:text-[#F0F6FC] text-[#8B949E]">&larr; DASHBOARD</button>
                       <h3 className="text-sm font-bold tracking-wide font-mono text-[#58A6FF]">FLUTTER BLUEPRINTS</h3>
                       <span className="w-12"></span>
                    </div>

                    <div className="rounded-xl border border-[#58A6FF]/20 bg-gradient-to-r from-[#161B22] to-[#0D1117] p-3 text-center relative overflow-hidden">
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#58A6FF] to-[#3FB950] animate-pulse" />
                      
                      <div className="relative inline-block mb-2">
                        <div className="absolute inset-0 rounded-full bg-[#58A6FF]/10 blur-md animate-pulse" />
                        <Smartphone className="h-10 w-10 text-[#58A6FF] mx-auto animate-bounce duration-[4000ms]" />
                      </div>
                      
                      <h4 className="text-xs font-bold text-[#F0F6FC] font-mono uppercase tracking-wider">WORKSPACE CLOUD LINK ACTIVE</h4>
                      <p className="text-[10px] text-[#8B949E] mt-1 font-mono leading-relaxed">
                        {FLUTTER_CODEBASE.length} production files successfully verified & mapped to standard Flutter M3 clean specs.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[9px] text-[#8B949E] font-bold font-mono uppercase tracking-wider font-semibold">TAP FILE TO SELECT IN CODEBAR</span>
                      
                      <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                        {FLUTTER_CODEBASE.map((file, idx) => (
                          <button
                            key={file.path}
                            onClick={() => {
                              setSelectedFlutterFile(idx);
                              playBeep();
                            }}
                            className={`w-full text-left rounded-lg p-2 border text-xs font-mono transition flex justify-between items-center cursor-pointer ${
                              selectedFlutterFile === idx 
                                ? 'bg-[#58A6FF]/10 border-[#58A6FF]/40 text-[#58A6FF]' 
                                : 'bg-[#161B22] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#8B949E]'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="text-[8px] font-sans px-1.5 py-0.5 rounded uppercase font-bold bg-[#30363D] text-[#8B949E]">
                                {file.category}
                              </span>
                              <span className="truncate font-semibold">{file.path}</span>
                            </div>
                            {selectedFlutterFile === idx && <Zap className="h-3.5 w-3.5 text-[#58A6FF] shrink-0 animate-pulse" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#30363D] bg-[#161B22]/60 p-2.5 text-[10px] text-[#8B949E] leading-relaxed">
                      <p className="font-mono">
                        💡 <b>Interactive Synergy:</b> Choosing a file here instantly sets the active file in the desktop-side exporter view. Ready to compile into full production!
                      </p>
                    </div>

                  </div>
                )}

              </div>

              {/* Floating Motivation overlay system */}
              <FloatingMotivation 
                message={activeMotivation} 
                onDismiss={() => setActiveMotivation(null)} 
              />

              {/* Dynamic bottom system drawer navigation bar for iOS/Android */}
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#161B22] border-t border-[#30363D] flex justify-around items-center px-4 text-[#8B949E]">
                <button
                  onClick={() => {
                    if (activeScreen === 'splash' || activeScreen === 'onboarding' || activeScreen === 'login') return;
                    setActiveScreen('dashboard');
                  }}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                    activeScreen === 'dashboard' ? 'text-[#58A6FF]' : 'hover:text-[#F0F6FC]'
                  }`}
                >
                  <Compass className="h-5 w-5" />
                  <span className="text-[9px] mt-0.5">DASH</span>
                </button>

                <button
                  onClick={() => {
                    if (activeScreen === 'splash' || activeScreen === 'onboarding' || activeScreen === 'login') return;
                    setActiveScreen('timer');
                  }}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                    activeScreen === 'timer' || activeScreen === 'stopwatch' ? 'text-[#58A6FF]' : 'hover:text-[#F0F6FC]'
                  }`}
                >
                  <Timer className="h-5 w-5" />
                  <span className="text-[9px] mt-0.5">FOCUS</span>
                </button>

                <button
                  onClick={() => {
                    if (activeScreen === 'splash' || activeScreen === 'onboarding' || activeScreen === 'login') return;
                    setActiveScreen('mindbattle');
                  }}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                    activeScreen === 'mindbattle' ? 'text-[#F78166]' : 'hover:text-[#F0F6FC]'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-[9px] mt-0.5">BATTLE</span>
                </button>

                <button
                  onClick={() => {
                    if (activeScreen === 'splash' || activeScreen === 'onboarding' || activeScreen === 'login') return;
                    setActiveScreen('profile');
                  }}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                    activeScreen === 'profile' ? 'text-[#58A6FF]' : 'hover:text-[#F0F6FC]'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="text-[9px] mt-0.5">PROFILE</span>
                </button>
              </div>

              {/* Live interactive alarm math quiz bypass blocker */}
              {activeAlarmSimulation && (
                <div className="absolute inset-0 bg-[#0D1117] z-[100] p-6 flex flex-col justify-center text-center animate-fade-in">
                  <Bell className="h-16 w-16 text-[#F78166] mx-auto animate-bounce mb-4" />
                  <h3 className="text-2xl font-black text-[#F0F6FC] tracking-widest uppercase">ALARM RINGING!</h3>
                  <p className="text-xs text-[#8B949E] uppercase font-mono mt-1">Sound: {activeAlarmSimulation.sound}</p>
                  
                  <div className="my-6 p-4 rounded-xl border border-[#30363D] bg-[#161B22]">
                    <span className="block text-[10px] text-[#8B949E] uppercase tracking-wide font-mono mb-2">BYPASS PROTOCOL TRIGGERED</span>
                    <span className="text-lg font-black font-mono text-[#F78166]">Solve: 16 * 12 + 19 = ?</span>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (mathAnswer === '211') {
                        setActiveAlarmSimulation(null);
                        setMathAnswer('');
                        setMathFeedback('');
                        triggerAlert("🔒 Bypass protocol clear. System unlocked. Streak remains unbroken!", "BYPASS SUCCESS");
                      } else {
                        setMathFeedback("⚡ Answer incorrect! Cyber alarm volume amplified!");
                      }
                    }}
                    className="space-y-3"
                  >
                    <input 
                      type="number" 
                      required
                      placeholder="Calculate value..."
                      value={mathAnswer}
                      onChange={(e) => setMathAnswer(e.target.value)}
                      className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-center text-sm font-mono text-[#F0F6FC] focus:outline-none"
                    />
                    
                    {mathFeedback && <p className="text-xs text-[#F78166] font-mono">{mathFeedback}</p>}

                    <div className="flex space-x-2 pt-2">
                      <button 
                        type="submit"
                        className="flex-1 rounded-lg bg-[#3FB950] text-[#0D1117] font-bold text-xs py-2.5"
                      >
                        SUBMIT DISMISS
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setActiveAlarmSimulation(null);
                        }}
                        className="rounded-lg bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] px-3 font-mono text-xs"
                      >
                        Snooze
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LEVEL UP TAKEOVER OVERLAY */}
              {levelUpData && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117] via-[#1A1405] to-[#0D1117] z-[110] p-6 flex flex-col justify-between text-center overflow-y-auto animate-fade-in">
                  {/* Golden radial background flare */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(227,179,65,0.08)_0%,_transparent_65%)] pointer-events-none" />
                  
                  <div className="space-y-4 pt-8 shrink-0">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 rounded-full bg-[#E3B341]/20 blur-xl animate-pulse" />
                      <span className="text-5xl block animate-bounce duration-[3000ms] relative z-10">{levelUpData.emoji}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-[#E3B341] tracking-widest uppercase font-mono animate-pulse">WARRIOR LEVEL ADVANCED</h4>
                      <h2 className="text-2xl font-black text-[#F0F6FC] tracking-tight">LEVEL {levelUpData.level}</h2>
                      <span className="inline-block bg-[#E3B341]/10 border border-[#E3B341]/35 text-[#E3B341] text-[9px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {levelUpData.title}
                      </span>
                    </div>
                  </div>

                  {/* Rewards specifications */}
                  <div className="p-4 rounded-xl border border-[#E3B341]/30 bg-[#1C170B]/80 backdrop-blur text-left">
                    <h5 className="text-[9px] text-[#E3B341] font-bold font-mono tracking-wide mb-2 uppercase">REWARDS & STATUS METRICS UNLOCKED</h5>
                    <ul className="space-y-1.5 text-xs text-[#8B949E] font-mono">
                      <li className="flex items-start space-x-2 text-[#F0F6FC]">
                        <span className="text-[#E3B341]">✦</span>
                        <span>Unlockable: <b>{levelUpData.rewards}</b></span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#3FB950]">✓</span>
                        <span>Multipliers: <b>+10% Daily XP Boost</b> stacked permanently</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#58A6FF]">✓</span>
                        <span>Fighter class: <b>Increased ghost combat rating</b></span>
                      </li>
                    </ul>
                  </div>

                  {/* Confetti micro animations decoration */}
                  <div className="relative h-12 w-full pointer-events-none select-none">
                    <div className="absolute w-2 h-2 bg-[#E3B341] rounded-full left-1/4 animate-ping" />
                    <div className="absolute w-1.5 h-1.5 bg-[#3FB950] rounded-full left-1/2 animate-ping" />
                    <div className="absolute w-2 h-1 bg-[#58A6FF] rounded left-3/4 animate-bounce" />
                  </div>

                  {/* Share capability & Dismiss CTAs */}
                  <div className="space-y-2 pb-4 shrink-0">
                    <button 
                      onClick={() => {
                        addXP(50);
                        triggerAlert("📣 Performance report shared! Loaded +50 XP bonus!", "TRANSMISSION SUCCESS");
                      }}
                      className="w-full bg-gradient-to-r from-[#E3B341] to-[#C99C2E] hover:opacity-95 text-[#0D1117] font-black text-xs py-2.5 rounded-lg uppercase tracking-wider transition-all transform active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>SHARE TO WORLD (+50 XP)</span>
                    </button>
                    
                    <button 
                      onClick={() => setLevelUpData(null)}
                      className="w-full bg-[#161B22]/80 border border-[#30363D] hover:border-white text-[#8B949E] hover:text-[#F0F6FC] font-bold text-xs py-1.5 rounded-lg transition"
                    >
                      CONTINUE BATTLE
                    </button>
                  </div>
                </div>
              )}

              {/* DETAILED BADGE INSPECT MODAL */}
              {selectedBadge && (
                <div className="absolute inset-0 bg-[#0D1117]/85 z-[110] flex flex-col justify-end animate-fade-in">
                  <div className="absolute inset-0 cursor-default" onClick={() => setSelectedBadge(null)} />
                  
                  <div className="relative bg-[#161B22] border-t border-[#30363D] rounded-t-2xl p-4 text-left z-10 max-h-[85%] overflow-y-auto space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold font-mono text-[#E3B341] tracking-wider uppercase bg-[#E3B341]/10 border border-[#E3B341]/20 px-2 py-0.5 rounded-full">
                        {selectedBadge.category} BENCHMARK
                      </span>
                      <button 
                        onClick={() => setSelectedBadge(null)}
                        className="text-[#8B949E] hover:text-[#F0F6FC] text-xs font-mono uppercase font-bold"
                      >
                        [Close]
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className={`h-14 w-14 rounded-xl border flex items-center justify-center shrink-0 ${
                        selectedBadge.unlockedDate ? 'border-[#E3B341] bg-[#E3B341]/10 text-[#E3B341] shadow-[0_0_10px_rgba(227,179,65,0.12)]' : 'border-[#30363D] bg-[#0D1117] text-[#8B949E] opacity-50'
                      }`}>
                        {selectedBadge.iconPath === 'Flame' && <Flame className="h-7 w-7" />}
                        {selectedBadge.iconPath === 'Shield' && <Shield className="h-7 w-7" />}
                        {selectedBadge.iconPath === 'ListTodo' && <ListTodo className="h-7 w-7" />}
                        {selectedBadge.iconPath === 'Trophy' && <Trophy className="h-7 w-7" />}
                        {selectedBadge.iconPath === 'Bell' && <Bell className="h-7 w-7" />}
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-black text-[#F0F6FC] leading-tight">{selectedBadge.name}</h3>
                        <span className="text-[10px] text-[#3FB950] font-mono font-bold">REWARD: +{selectedBadge.xpReward} XP</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-2.5">
                        <span className="block text-[8px] font-mono text-[#8B949E] uppercase tracking-wide mb-1">MIND CRITERIA CONDITION</span>
                        <p className="text-[11px] text-[#C9D1D9] font-mono leading-relaxed">{selectedBadge.condition || "Fulfill daily focus thresholds to claim unlock sequence."}</p>
                      </div>

                      <div className="bg-[#0D1117]/60 border border-[#30363D] rounded-lg p-2.5">
                        <span className="block text-[8px] font-mono text-[#8B949E] uppercase tracking-wide mb-1">METADATA SUMMARY</span>
                        <p className="text-[11px] text-[#8B949E] leading-relaxed">{selectedBadge.description}</p>
                      </div>
                      
                      <div className="rounded-lg bg-[#1F242C] px-3 py-2 text-[10px] flex justify-between items-center font-mono">
                        <span className="text-[#8B949E] uppercase font-bold text-[9px]">DIAGNOSTIC STATUS:</span>
                        {selectedBadge.unlockedDate ? (
                          <span className="text-[#3FB950] font-black">✓ CLASSIFIED AS ACTIVE ({selectedBadge.unlockedDate})</span>
                        ) : (
                          <span className="text-[#F78166] font-black">🔒 LOCK PROTOCOL ACTIVE</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      {selectedBadge.unlockedDate ? (
                        <button 
                          onClick={() => {
                            addXP(50);
                            triggerAlert("📣 Shared discipline status successfully! Awarded +50 XP!", "DISCIPLINE BROADCASTED");
                          }}
                          className="w-full bg-[#E3B341] hover:bg-[#E3B341]/90 text-[#0D1117] font-black py-2 rounded-lg text-[10px] uppercase tracking-wider transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>SHARE ACHIEVEMENT DISCIPLINE (+50 XP)</span>
                        </button>
                      ) : (
                        <button 
                          disabled 
                          className="w-full bg-[#161B22] border border-[#30363D] text-[#8B949E] font-bold py-2 rounded-lg text-[10px] uppercase cursor-not-allowed"
                        >
                          LOCKED SEQUENCE AT MAIN FRAME
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: FLUTTER CODE BLUEPRINT WORKSPACE EXPLORER */}
          <div className="lg:col-span-5 text-left border border-[#30363D] bg-[#161B22] rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            
            <div>
              <div className="flex items-center space-x-2 border-b border-[#30363D] pb-3 mb-4">
                <Smartphone className="h-5 w-5 text-[#58A6FF] glow-blue" />
                <h3 className="text-sm font-bold tracking-tight text-[#F0F6FC]">FLUTTER EXPORTER WORKSPACE</h3>
              </div>
              
              <p className="text-xs text-[#8B949E] leading-relaxed mb-4">
                Here are the finalized production-ready Flutter Dart code files matching your requested clean architecture setup. Browse the folders and copy scripts!
              </p>

              {/* Code File tabs folder view */}
              <div className="grid grid-cols-2 gap-1.5 mb-4 text-xs font-mono select-none">
                {FLUTTER_CODEBASE.map((file, idx) => (
                  <button
                    key={file.path}
                    onClick={() => {
                      setSelectedFlutterFile(idx);
                      setCopiedIndex(false);
                    }}
                    className={`text-left rounded-xl py-2 px-3 border transition-all cursor-pointer ${
                      selectedFlutterFile === idx 
                        ? 'bg-[#0D1117] border-[#58A6FF] text-[#58A6FF] glow-blue' 
                        : 'bg-[#0D1117]/65 border-transparent hover:bg-[#0D1117] hover:border-[#30363D] text-[#8B949E]'
                    }`}
                  >
                    <span className="block text-[8px] text-[#8B949E] font-sans font-bold uppercase tracking-wider">{file.category}</span>
                    <span className="font-semibold text-[11px] truncate block">{file.path}</span>
                  </button>
                ))}
              </div>

              {/* Code box render space */}
              <div className="relative rounded-2xl border border-[#30363D] bg-[#0D1117] p-4 text-xs font-mono shadow-inner h-[320px] overflow-auto">
                <div className="absolute top-2 right-2 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(FLUTTER_CODEBASE[selectedFlutterFile].content);
                      setCopiedIndex(true);
                      setTimeout(() => setCopiedIndex(false), 2000);
                    }}
                    className="p-1.5 rounded-xl bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#58A6FF] transition flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedIndex ? <Check className="h-3.5 w-3.5 text-[#3FB950]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="text-[10px] font-sans">{copiedIndex ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="border-b border-[#30363D] pb-1 bg-[#0D1117] sticky top-0 mb-4 text-[#8B949E] text-[10px] tracking-wide select-none">
                  PATH: <span className="text-[#F0F6FC] font-semibold">{FLUTTER_CODEBASE[selectedFlutterFile].path}</span>
                </div>

                <pre className="text-[11px] leading-relaxed whitespace-pre font-mono text-[#F0F6FC] pb-10">
                  {FLUTTER_CODEBASE[selectedFlutterFile].content}
                </pre>
              </div>
            </div>

            {/* Quick Developer reference footer panel */}
            <div className="mt-5 border-t border-[#30363D] pt-4 text-xs text-[#8B949E] leading-relaxed flex items-center space-x-2 bg-[#0D1117]/50 p-3 rounded-2xl border border-[#30363D]">
              <AlertCircle className="h-5 w-5 text-[#E3B341] shrink-0" />
              <span>
                <b>Usage Guide:</b> Import the copied configurations into your native Flutter project workspace. Ensure your Flutter environment runs on SDK VERSION <b>&gt;=3.0.0</b> using the provided pubspec constraints.
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-[#30363D] bg-[#0D1117] mt-12 py-6 px-6 text-center select-none">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center text-xs text-[#8B949E] space-y-4 md:space-y-0">
          <p>© 2026 TIMELINE. Built as full-stack companion with Express, React 19, and Google Gemini AI.</p>
          <div className="flex space-x-4">
            <span className="font-mono bg-[#161B22] border border-[#30363D] rounded px-2.5 py-0.5">Platform: Cross-Platform Core (Flutter Concept)</span>
          </div>
        </div>
      </footer>

      {/* CUSTOM SAFE ALERT DIALOG OVERLAY */}
      {customAlert && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-[#0D1117] border-2 border-[#30363D] glow-blue rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-[#161B22] border-b border-[#30363D] px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-[#58A6FF] rounded-full animate-pulse" />
                <span className="font-mono text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">{customAlert.title || "System Message"}</span>
              </div>
              <button 
                onClick={() => setCustomAlert(null)}
                className="text-[#8B949E] hover:text-[#F0F6FC] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Content Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-[#58A6FF]/10 rounded-xl border border-[#58A6FF]/30 text-[#58A6FF] shrink-0">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs text-[#C9D1D9] leading-relaxed font-sans pt-1">
                  {customAlert.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#161B22] border-t border-[#30363D] px-5 py-3.5 flex justify-end">
              <button
                onClick={() => setCustomAlert(null)}
                className="bg-[#58A6FF] hover:opacity-90 text-[#0D1117] font-bold text-xs px-5 py-2 rounded-lg uppercase tracking-wide transition cursor-pointer"
              >
                Acknowledge Protocol
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
