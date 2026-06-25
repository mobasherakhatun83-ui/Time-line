/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Trophy, Award, Heart, HelpCircle, Star, Zap } from 'lucide-react';
import { MotivationMessage } from '../data/motivation_messages';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'star';
  angle: number;
  speedY: number;
  speedX: number;
}

interface FloatingMotivationProps {
  message: MotivationMessage | null;
  onDismiss: () => void;
}

export const FloatingMotivation: React.FC<FloatingMotivationProps> = ({ message, onDismiss }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!message) {
      setParticles([]);
      return;
    }

    // Auto-dismiss after 4.5 seconds (4 seconds stay + 0.5s fade out)
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);

    // Generate particles based on message type
    const newParticles: Particle[] = [];
    const count = 30;
    const colors = getGradientColors(message.gradient);

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const speed = Math.random() * 3 + 1;
      
      newParticles.push({
        id: i,
        // Start from center of the screen card area
        x: 50 + (Math.random() * 40 - 20), 
        y: 80 + (Math.random() * 10 - 5),
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: getParticleShape(message.gradient),
        angle: angle,
        speedY: -(Math.random() * 2 + 1), // Drift upwards
        speedX: Math.random() * 2 - 1,   // Slight horizontal drift
      });
    }

    setParticles(newParticles);

    // Particle animation frame loop
    let frameId: number;
    const updateParticles = () => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + p.speedX * 0.5,
          y: p.y + p.speedY * 0.5,
          size: Math.max(0, p.size - 0.05), // Shrink slowly
        })).filter(p => p.size > 0 && p.y > -20 && p.x > -10 && p.x < 110)
      );
      frameId = requestAnimationFrame(updateParticles);
    };

    updateParticles();

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [message, onDismiss]);

  if (!message) return null;

  // Visual characteristics mapping
  const gradientClass = {
    achievement: 'bg-gradient-to-r from-[#FFD700] via-[#FFA400] to-[#E3B341]',
    focus: 'bg-gradient-to-r from-[#58A6FF] via-[#1E90FF] to-[#0052CC]',
    completion: 'bg-gradient-to-r from-[#3FB950] via-[#2EA043] to-[#218838]',
    spiritual: 'bg-gradient-to-r from-[#BC8CFF] via-[#8A2BE2] to-[#601A94]',
    motivation: 'bg-gradient-to-r from-[#F78166] via-[#FF6347] to-[#D53B21]'
  }[message.gradient];

  const glowShadow = {
    achievement: 'shadow-[0_0_20px_rgba(227,179,65,0.45)] border-[#E3B341]/40',
    focus: 'shadow-[0_0_20px_rgba(88,166,255,0.45)] border-[#58A6FF]/40',
    completion: 'shadow-[0_0_20px_rgba(63,185,80,0.45)] border-[#3FB950]/40',
    spiritual: 'shadow-[0_0_20px_rgba(188,140,255,0.45)] border-[#BC8CFF]/40',
    motivation: 'shadow-[0_0_20px_rgba(247,129,102,0.45)] border-[#F78166]/40'
  }[message.gradient];

  const categoryIcon = {
    achievement: <Trophy className="h-4.5 w-4.5 text-[#F0F6FC] shrink-0 animate-bounce" />,
    focus: <Zap className="h-4.5 w-4.5 text-[#F0F6FC] shrink-0 animate-pulse" />,
    completion: <Award className="h-4.5 w-4.5 text-[#F0F6FC] shrink-0" />,
    spiritual: <Star className="h-4.5 w-4.5 text-[#F0F6FC] shrink-0" />,
    motivation: <Flame className="h-4.5 w-4.5 text-[#F0F6FC] shrink-0" />
  }[message.gradient];

  return (
    <>
      {/* Particle Effect Containers */}
      <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none overflow-hidden z-[115]">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'star' ? '25%' : '0px',
              backgroundColor: p.color,
              filter: `blur(${p.shape === 'star' ? '0.5px' : '0px'})`,
              boxShadow: `0 0 8px ${p.color}`,
              opacity: p.size / 10
            }}
          />
        ))}
      </div>

      {/* Main Alert Message Bubbles */}
      <div className="absolute inset-x-0 bottom-24 flex justify-center z-[120] pointer-events-none px-4">
        <AnimatePresence>
          <motion.div
            id="floating_motivation_bubble"
            initial={{ y: 80, scale: 0.9, opacity: 0 }}
            animate={{ 
              y: 0, 
              scale: [1.03, 0.98, 1], // Bouncing arrival
              opacity: 1 
            }}
            exit={{ y: 50, scale: 0.95, opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.175, 0.885, 0.32, 1.275] // Nice spring bounce sequence
            }}
            className={`w-11/12 max-w-sm pointer-events-auto flex items-center space-x-3 p-4 rounded-[20px] bg-[#0D1117]/90 backdrop-blur-md border border-[1.5px] ${glowShadow} text-left cursor-pointer transition-all active:scale-95`}
            onClick={onDismiss}
          >
            {/* Left side circular token */}
            <div className={`h-9 w-9 rounded-full ${gradientClass} flex items-center justify-center shadow-inner shrink-0`}>
              {categoryIcon}
            </div>

            {/* Content text */}
            <div className="flex-1 min-w-0 pr-1">
              <span className="block text-[8px] font-black uppercase font-mono tracking-widest text-[#8B949E] mb-0.5">
                {message.category.replace('_', ' ')} session coach
              </span>
              <p className="text-xs font-semibold text-[#F0F6FC] leading-relaxed select-none">
                {message.text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

// Helpers mapped for beautiful particle generation
function getGradientColors(gradient: MotivationMessage['gradient']): string[] {
  switch (gradient) {
    case 'achievement': return ['#FFD700', '#FFA500', '#E3B341', '#FFEC94', '#F39C12'];
    case 'focus': return ['#58A6FF', '#1E90FF', '#00C4FF', '#8FF7FF', '#3B82F6'];
    case 'completion': return ['#3FB950', '#2EA043', '#2ECC71', '#A3E4D7', '#27AE60'];
    case 'spiritual': return ['#BC8CFF', '#8A2BE2', '#AF7AC5', '#E8DAEF', '#9B59B6'];
    case 'motivation': return ['#F78166', '#FF6347', '#FFBF00', '#E59866', '#E74C3C'];
    default: return ['#FFFFFF'];
  }
}

function getParticleShape(gradient: MotivationMessage['gradient']): 'circle' | 'square' | 'star' {
  switch (gradient) {
    case 'spiritual': return 'star';
    case 'achievement': return 'circle';
    case 'completion': return 'square';
    case 'focus': return 'star';
    default: return 'circle';
  }
}
