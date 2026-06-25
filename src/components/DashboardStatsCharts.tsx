/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity, Award, Calendar, Flame, TrendingUp, Compass, Cpu } from 'lucide-react';

interface StatsChartsProps {
  sessions: any[];
  routines: any[];
}

export const DashboardStatsCharts: React.FC<StatsChartsProps> = ({ sessions, routines }) => {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [hoveredValue, setHoveredValue] = useState<{ label: string; val: string } | null>(null);

  // Focus Category data aggregator
  const getCategoryRatio = () => {
    const focusTypeCount = sessions.reduce((acc: any, s: any) => {
      const cat = s.type || 'Custom';
      acc[cat] = (acc[cat] || 0) + s.duration;
      return acc;
    }, { 'Pomodoro': 120, 'Short Break': 25, 'Long Break': 45, 'Custom Work': 60 });
    return focusTypeCount;
  };

  const categoryRatios = getCategoryRatio();
  const categoryKeys = Object.keys(categoryRatios);
  const categoryColors = {
    'Pomodoro': '#58A6FF',
    'Short Break': '#3FB950',
    'Long Break': '#BC8CFF',
    'Custom Work': '#E3B341',
    'Custom': '#F78166'
  } as any;

  // Yearly contribution grid helper (GitHub commitment structure)
  const drawHeatmapDays = () => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Draw 30 columns, representing 30 weeks
    for (let column = 0; column < 28; column++) {
      const colDays = [];
      for (let row = 0; row < 7; row++) {
        // Random level: 0 (none), 1 (light focus), 2 (moderate), 3 (extreme battle)
        const totalIndex = column * 7 + row;
        let value = 0;
        if (totalIndex % 7 === 0) value = Math.floor(Math.random() * 4);
        else if (totalIndex % 5 === 0) value = Math.floor(Math.random() * 3);
        else if (totalIndex % 13 === 0) value = 3;
        else value = Math.random() > 0.65 ? Math.floor(Math.random() * 2) : 0;
        
        colDays.push(value);
      }
      data.push(colDays);
    }
    return data;
  };

  const heatmapGrid = drawHeatmapDays();

  // Weekly bar data
  const weeklyData = [
    { name: 'Mon', value: 45, ghost: 60 },
    { name: 'Tue', value: 120, ghost: 90 },
    { name: 'Wed', value: 85, ghost: 100 },
    { name: 'Thu', value: 150, ghost: 120 },
    { name: 'Fri', value: 90, ghost: 65 },
    { name: 'Sat', value: 240, ghost: 180 },
    { name: 'Sun', value: 180, ghost: 140 }
  ];

  // Monthly line data
  const monthlyData = [
    { name: 'W1', value: 450 },
    { name: 'W2', value: 680 },
    { name: 'W3', value: 920 },
    { name: 'W4', value: 1150 }
  ];

  return (
    <div className="space-y-4 text-left">
      {/* 1. Day / Week / Month / Year Switcher */}
      <div className="flex space-x-1 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
        {(['day', 'week', 'month', 'year'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setHoveredValue(null);
            }}
            className={`flex-1 text-[10px] uppercase font-bold py-1 px-1.5 rounded transition ${
              activeTab === tab 
                ? 'bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/35' 
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. Top Tier High Metrics Numbers */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-2.5">
          <span className="text-[8px] font-mono text-[#8B949E] uppercase block">Total Focus</span>
          <span className="text-sm font-black text-[#58A6FF] font-mono">
            {activeTab === 'day' ? '120m' : activeTab === 'week' ? '820m' : activeTab === 'month' ? '3,450m' : '41,200m'}
          </span>
        </div>
        <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-2.5">
          <span className="text-[8px] font-mono text-[#8B949E] uppercase block">vs Target</span>
          <span className="text-sm font-black text-[#3FB950] font-mono">
            {activeTab === 'day' ? '+15%' : activeTab === 'week' ? '+24%' : activeTab === 'month' ? '+18%' : '+32%'}
          </span>
        </div>
        <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-2.5">
          <span className="text-[8px] font-mono text-[#8B949E] uppercase block">Efficiency</span>
          <span className="text-sm font-black text-[#E3B341] font-mono">
            {activeTab === 'day' ? '92%' : activeTab === 'week' ? '88%' : activeTab === 'month' ? '90%' : '94%'}
          </span>
        </div>
      </div>

      {/* 3. Dynamic Interactive Area */}
      <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-3 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-[#30363D] pb-2">
          <h4 className="text-[10px] font-black text-[#F0F6FC] font-mono uppercase tracking-wider flex items-center space-x-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-[#58A6FF]" />
            <span>{activeTab === 'week' ? 'Weekly Dual Ghost Tracker' : `${activeTab} focus output`}</span>
          </h4>
          {hoveredValue ? (
            <span className="text-[9px] font-mono text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded border border-[#58A6FF]/30">
              {hoveredValue.label}: {hoveredValue.val}
            </span>
          ) : (
            <span className="text-[9px] font-mono text-[#8B949E]">Hover columns for values</span>
          )}
        </div>

        {/* CHART - WEEK VIEW (Bar chart comparing User vs Yesterday's Ghost) */}
        {activeTab === 'week' && (
          <div className="aspect-[2/1] w-full flex items-end justify-between px-1 h-32 pt-4 border-b border-[#30363D]">
            {weeklyData.map((d, index) => {
              const maxVal = 250;
              const userHeight = (d.value / maxVal) * 100;
              const ghostHeight = (d.ghost / maxVal) * 100;
              return (
                <div 
                  key={d.name} 
                  className="flex flex-col items-center flex-1 group cursor-pointer"
                  onMouseEnter={() => setHoveredValue({ label: d.name, val: `User ${d.value}m / Ghost ${d.ghost}m` })}
                  onMouseLeave={() => setHoveredValue(null)}
                >
                  <div className="relative w-full flex justify-center items-end h-24 space-x-[2px] px-1">
                    {/* Yesterday's Ghost value */}
                    <div 
                      className="w-1.5 bg-[#4F5B66] rounded-t transition-all group-hover:bg-[#8B949E] opacity-60"
                      style={{ height: `${ghostHeight}%` }}
                    />
                    {/* Active User focus value */}
                    <div 
                      className="w-2.5 bg-gradient-to-t from-[#58A6FF] to-[#3FB950] rounded-t transition-all group-hover:brightness-125"
                      style={{ height: `${userHeight}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-[#8B949E] mt-1.5">{d.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* CHART - DAY VIEW (Interactive Circle Time Allocation) */}
        {activeTab === 'day' && (
          <div className="flex items-center space-x-6 py-2">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              {/* Outer stroke wheel simulation */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="38" stroke="#30363D" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="48" cy="48" r="38" 
                  stroke="#58A6FF" strokeWidth="8" fill="transparent" 
                  strokeDasharray="238" strokeDashoffset="48" 
                />
                <circle 
                  cx="48" cy="48" r="38" 
                  stroke="#3FB950" strokeWidth="8" fill="transparent" 
                  strokeDasharray="238" strokeDashoffset="180" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-[#8B949E] uppercase leading-none font-mono">DENSITY</span>
                <span className="text-sm font-black text-[#F0F6FC] leading-none mt-1">2.5 HRS</span>
              </div>
            </div>

            {/* Legend block */}
            <div className="flex-1 space-y-1.5 text-[10px] font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#58A6FF]" />
                  <span className="text-[#F0F6FC]">Deep Work</span>
                </div>
                <span className="text-[#8B949E]">120 min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3FB950]" />
                  <span className="text-[#F0F6FC]">Short Recess</span>
                </div>
                <span className="text-[#8B949E]">25 min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#BC8CFF]" />
                  <span className="text-[#F0F6FC]">Routines completed</span>
                </div>
                <span className="text-[#8B949E]">45 min</span>
              </div>
            </div>
          </div>
        )}

        {/* CHART - MONTH VIEW (Line trend) */}
        {activeTab === 'month' && (
          <div className="relative pt-4">
            <svg viewBox="0 0 300 100" className="w-full">
              {/* Grid Lines */}
              <line x1="10" y1="10" x2="290" y2="10" stroke="#1F242C" strokeWidth="1" />
              <line x1="10" y1="50" x2="290" y2="50" stroke="#1F242C" strokeWidth="1" />
              <line x1="10" y1="90" x2="290" y2="90" stroke="#1F242C" strokeWidth="1" />
              {/* Area path */}
              <path d="M 10 90 L 80 70 L 150 45 L 220 30 L 290 10 L 290 90 Z" fill="url(#monthGrad)" />
              {/* Main Line */}
              <path 
                d="M 10 90 Q 80 70, 150 45 T 290 10" 
                fill="none" 
                stroke="#58A6FF" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#58A6FF" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#58A6FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Interactive nodes */}
              <circle cx="10" cy="90" r="3" fill="#3FB950" />
              <circle cx="80" cy="70" r="3" fill="#3FB950" />
              <circle cx="150" cy="45" r="3" fill="#3FB950" />
              <circle cx="220" cy="30" r="3" fill="#3FB950" />
              <circle cx="290" cy="10" r="3.5" fill="#E3B341" className="animate-ping" />
            </svg>
            <div className="flex justify-between text-[9px] font-mono text-[#8B949E] mt-2">
              <span>Week 1 (450m)</span>
              <span>Week 2 (680m)</span>
              <span>Week 3 (920m)</span>
              <span>Week 4 (1150m)</span>
            </div>
          </div>
        )}

        {/* CHART - YEAR VIEW (Interactive Grid Heatmap) */}
        {activeTab === 'year' && (
          <div className="space-y-2 pt-1 font-mono text-[9px]">
            <p className="text-[8px] text-[#8B949E] mb-1">CYBER DISCIPLINE HEATMAP (28 COLS x 7 DAYS)</p>
            
            <div className="flex space-x-[2.5px] overflow-x-auto pb-1 max-w-full justify-between">
              {heatmapGrid.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col space-y-[2.5px]">
                  {week.map((level, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={() => setHoveredValue({ label: `Column ${wIdx + 1}, Day ${dIdx + 1}`, val: `Completed level ${level}/3` })}
                      onMouseLeave={() => setHoveredValue(null)}
                      className={`w-2.5 h-2.5 rounded-xs transition-colors cursor-help ${
                        level === 0 ? 'bg-[#1F242C]' :
                        level === 1 ? 'bg-[#0E4429]' :
                        level === 2 ? 'bg-[#006D32]' :
                        'bg-[#39D353] glow-green'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-[8px] text-[#8B949E] pt-1">
              <span>Less focus</span>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-[#1F242C] rounded-xs" />
                <span className="w-2.5 h-2.5 bg-[#0E4429] rounded-xs" />
                <span className="w-2.5 h-2.5 bg-[#006D32] rounded-xs" />
                <span className="w-2.5 h-2.5 bg-[#39D353] rounded-xs" />
              </div>
              <span>More battles won</span>
            </div>
          </div>
        )}

      </div>

      {/* 4. Beautiful Insights Card */}
      <div className="rounded-xl border border-dashed border-[#58A6FF]/30 bg-[#161B22]/40 p-3 text-xs space-y-2.5">
        <h5 className="text-[9px] font-black font-mono text-[#E3B341] uppercase tracking-wide flex items-center space-x-1.5">
          <Compass className="h-3.5 w-3.5" />
          <span>CYBERNETIC COGNITIVE INSIGHTS [SECURE]</span>
        </h5>
        
        <div className="space-y-2 leading-relaxed">
          <div className="flex items-start space-x-2">
            <span className="text-[#3FB950] font-mono text-sm">✦</span>
            <p className="text-[#C9D1D9]">
              Your most productive study day is <b className="text-[#F0F6FC]">Saturday</b>, clocking in over <b className="text-[#58A6FF]">240m</b> of focused deep work.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-[#58A6FF] font-mono text-sm">✦</span>
            <p className="text-[#C9D1D9]">
              Cognitive optimization spikes around <b className="text-[#F0F6FC]">06:00 AM - 08:30 AM</b>. Morning focus has a <span className="text-[#3FB950]">14% higher XP completion rate</span>.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-[#BC8CFF] font-mono text-sm">✦</span>
            <p className="text-[#C9D1D9]">
              Awesome job! This week, you expanded your total focus duration by <b className="text-[#3FB950]">+32%</b>, effectively reducing Yesterday Ghost's combat threat parameters to absolute zero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
