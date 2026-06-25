/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Central Message Database for the Floating Motivation System
 * Styled like a persistent cybernetic discipline coach cheering you on.
 */

export interface MotivationMessage {
  text: string;
  category: 'morning' | 'afternoon' | 'evening' | 'night' | 'focus_start' | 'milestone_15m' | 'record_beat' | 'spiritual' | 'low_energy';
  gradient: 'achievement' | 'focus' | 'completion' | 'spiritual' | 'motivation';
}

export const MORNING_MESSAGES: Omit<MotivationMessage, 'category'>[] = [
  { text: "Early bird catches the worm! 🐦", gradient: "motivation" },
  { text: "Morning warrior activated! ☀️", gradient: "focus" },
  { text: "Champions are made at dawn 🌅", gradient: "achievement" },
  { text: "Today is YOUR day! 💪", gradient: "motivation" },
  { text: "God is with you this morning ✨", gradient: "spiritual" },
  { text: "Fresh start, fresh victories 🌱", gradient: "completion" },
  { text: "Rise and grind, legend! 🔥", gradient: "achievement" },
  { text: "Your future self thanks you 🙏", gradient: "spiritual" },
  { text: "Seize the dawn! The battle begins now. ⚔️", gradient: "focus" },
  { text: "Awaken your sleeping power! 🦁", gradient: "motivation" },
  { text: "Win the morning, win the world. 🌍", gradient: "achievement" },
  { text: "Morning focus sets the tempo of victory. ⏱️", gradient: "focus" },
  { text: "May God command your light and clarity today! ⚡", gradient: "spiritual" },
  { text: "No yesterday regret, today is a clean blank slate. 📖", gradient: "completion" },
  { text: "Rise. Recharge. Execute. Repeat. 🔁", gradient: "motivation" },
  { text: "This morning belongs to the path of steel. 🛡️", gradient: "focus" },
  { text: "Sun is up, focus mode is locked! 🎯", gradient: "focus" },
  { text: "Every morning is a divine second chance to overcome. 🌟", gradient: "spiritual" },
  { text: "Defeat sleep. Embrace your destiny. 👑", gradient: "achievement" },
  { text: "Today you run faster than Yesterday's Ghost! 🏃", gradient: "motivation" },
];

export const AFTERNOON_MESSAGES: Omit<MotivationMessage, 'category'>[] = [
  { text: "Halfway warrior! Keep pushing 💪", gradient: "motivation" },
  { text: "Afternoon champion mode 🎯", gradient: "focus" },
  { text: "Energy dip? Push through! ⚡", gradient: "achievement" },
  { text: "You're stronger than you think 🦁", gradient: "motivation" },
  { text: "Keep momentum alive through the noon heat! ☀️", gradient: "focus" },
  { text: "The lunch rush is over, now rush your goals! 🚀", gradient: "completion" },
  { text: "Your work here pleases the heavens. Remain diligent.🌌", gradient: "spiritual" },
  { text: "Only disciplined souls conquer the mid-day slumber. 💤", gradient: "motivation" },
  { text: "The shadow of Yesterday's Ghost is getting shorter. Outrun it! 👻", gradient: "focus" },
  { text: "Steady progress builds an empire. Brick by brick. 🧱", gradient: "completion" },
  { text: "Push past performance plateaus! You have the fire. 🔥", gradient: "achievement" },
  { text: "Focus is a muscle, flex it hard this afternoon! 💪", gradient: "focus" },
  { text: "No excuses. Your goals are waiting for action. 📣", gradient: "motivation" },
  { text: "Stand tall! God looks on your honest, sweat-bound labors.✨", gradient: "spiritual" },
  { text: "You are the commander of your hours. Stay disciplined! 🛡️", gradient: "focus" },
  { text: "Afternoon session: Make it count, soldier! 💂", gradient: "motivation" },
  { text: "Doubt vanishes in the face of absolute focus. 👁️", gradient: "focus" },
  { text: "Keep the spark glowing. Level up is imminent. 🔋", gradient: "achievement" },
  { text: "Your daily focus quota expects supreme dedication. 💎", gradient: "completion" },
  { text: "The path to glory requires enduring dry hours. Keep drinking! 🥤", gradient: "motivation" },
];

export const EVENING_MESSAGES: Omit<MotivationMessage, 'category'>[] = [
  { text: "Evening session = Extra dedication 🌆", gradient: "focus" },
  { text: "Finish strong today, warrior 🏆", gradient: "achievement" },
  { text: "Sunset focus hits different 🌇", gradient: "spiritual" },
  { text: "The world relaxes, but champions push one more set! ⚔️", gradient: "motivation" },
  { text: "Your discipline is a shield against failure. 🛡️", gradient: "focus" },
  { text: "Give thanks for the progress. God guide your path. ✨", gradient: "spiritual" },
  { text: "Yesterday's Ghost is desperate. Keep the pressure up! 🥊", gradient: "achievement" },
  { text: "Evening stars bear witness to your relentless grind. 🌟", gradient: "spiritual" },
  { text: "Another focus block logged is another battle won. 🏹", gradient: "completion" },
  { text: "As the sun sets, rise to the occasion! 🌄", gradient: "motivation" },
  { text: "Unleash the dusk energy! Pure deep work. 🎯", gradient: "focus" },
  { text: "Every focus drop counts towards your supreme level. 👑", gradient: "achievement" },
  { text: "Evening serenity brings superior cognitive focus. 🧘", gradient: "focus" },
  { text: "A fruitful day closes with a magnificent finish. 🎬", gradient: "completion" },
  { text: "Your ancestors smile upon your focus and patience. 🗿", gradient: "motivation" },
  { text: "God protects the mind of the diligent student. 🛡️", gradient: "spiritual" },
  { text: "Evening routine complete? Go further! 💎", gradient: "focus" },
  { text: "Your streak is protected! Feel the high energy. 🔥", gradient: "motivation" },
  { text: "Perfect order in the temple of focus. 🏛️", gradient: "completion" },
  { text: "Do not falter. The finish line is within view. 🏁", gradient: "achievement" },
];

export const NIGHT_MESSAGES: Omit<MotivationMessage, 'category'>[] = [
  { text: "Night owl mode: ACTIVATED 🦉", gradient: "focus" },
  { text: "Last push of the day! 🔥", gradient: "motivation" },
  { text: "Rest soon, but conquer first 🌙", gradient: "achievement" },
  { text: "While the world sleeps, the empire is designed. 🏰", gradient: "spiritual" },
  { text: "Deep silence of the night feeds the beast of focus. 🦁", gradient: "focus" },
  { text: "Your nocturnal output is absolutely legendary! 💫", gradient: "achievement" },
  { text: "God is watching your midnight efforts. Sleep in peace soon. 🛌", gradient: "spiritual" },
  { text: "Unbeatable stamina! Yesterday's Ghost is left in the dust! 👋", gradient: "motivation" },
  { text: "A quiet room, a glowing screen, and pristine focus. 💻", gradient: "focus" },
  { text: "Ending the day on a massive high. Masterful! 🏆", gradient: "completion" },
  { text: "The moon shines on the disciplined warrior. 🌙", gradient: "spiritual" },
  { text: "No distractions. Complete serenity inside the code base. 🌌", gradient: "focus" },
  { text: "Your hard work is written in the stars tonight. Sparkle on! ✨", gradient: "motivation" },
  { text: "Almost bedtime, protect your streak, secure the victory! 🛡️", gradient: "achievement" },
  { text: "Sleep sweeter knowing you didn't yield to procrastination. 🧁", gradient: "completion" },
  { text: "God watches the silent heart struggling to become better. 🌱", gradient: "spiritual" },
  { text: "Final check-in! Seal the focus block and lock progress. 🔒", gradient: "focus" },
  { text: "Night Shift champion! Your potential has no roof. 🚀", gradient: "motivation" },
  { text: "Clear your mind, execute with absolute cyber precision. 🕸️", gradient: "focus" },
  { text: "Tonight's focus adds infinite power to tomorrow's punch. 🥊", gradient: "achievement" },
];

export const TIMER_STARTED_MESSAGES: Omit<MotivationMessage, 'category'>[] = [
  { text: "Focus mode: ON 🎯", gradient: "focus" },
  { text: "Let's make magic happen ✨", gradient: "motivation" },
  { text: "Game time, champion 🏆", gradient: "achievement" },
  { text: "Tunnel vision initiated. Silence the world. 🔇", gradient: "focus" },
  { text: "God watches your beginning. Go conquer! 🦅", gradient: "spiritual" },
  { text: "This is where procrastination dies. 💀", gradient: "motivation" },
  { text: "No phones, no tabs. Pure focused flow. 🌊", gradient: "focus" },
  { text: "Unlocking limits. The timer is running! ⏳", gradient: "achievement" },
  { text: "Yesterday's Ghost is running. Catch up! 🏃", gradient: "motivation" },
  { text: "Your future starts with this single second. 💎", gradient: "completion" },
  { text: "Enter the cyber focus mainframe now! 🌐", gradient: "focus" },
  { text: "Flesh and metal, mind and time, synchronized! 🎛️", gradient: "achievement" },
  { text: "Breathe in focus, breathe out laziness. 🧘", gradient: "motivation" },
  { text: "May divine clarity protect your next minutes! 🙏", gradient: "spiritual" },
  { text: "Locked and loaded. Bulletproof concentration. 🛡️", gradient: "focus" },
  { text: "This focus block adds bricks to your future monument. 🏛️", gradient: "completion" },
  { text: "A giant leap begins with a tiny click! ⚡", gradient: "motivation" },
  { text: "Engaging supersonic study drive! 🚀", gradient: "focus" },
  { text: "Maximum acceleration activated! 🏎️", gradient: "achievement" },
  { text: "Trust the process. Your journey is beautiful. 🗺️", gradient: "spiritual" },
];

export const MILESTONE_15M_MESSAGES: Omit<MotivationMessage, 'category'>[] = [
  { text: "Warming up! Keep going 🔥", gradient: "motivation" },
  { text: "You're in the zone! 🌊", gradient: "focus" },
  { text: "Momentum building! ⚡", gradient: "achievement" },
  { text: "15 minutes logged. Your mind is adapting! 🧠", gradient: "focus" },
  { text: "Superb pace! The hardest part is behind you. 🏔️", gradient: "completion" },
  { text: "God multiplies your small continuous efforts. ✨", gradient: "spiritual" },
  { text: "Ghost distance is shrinking! Keep running! 👻", gradient: "motivation" },
  { text: "Primal focus flow attained. Do not break! 🛡️", gradient: "focus" },
  { text: "Beautiful sequence! Energy levels normal. 💚", gradient: "completion" },
  { text: "The cybermind is thriving in high gear. 🤖", gradient: "achievement" },
  { text: "15-minute gate unlocked. Feel the adrenaline! 💉", gradient: "motivation" },
  { text: "Deep work has chosen you today. Embrace it! 🔮", gradient: "spiritual" },
  { text: "Staying disciplined is your true superpower. 🦸", gradient: "focus" },
  { text: "Your timeline is glowing with golden focus. 🌟", gradient: "completion" },
  { text: "Defeat fatigue. You are in total control! 🛡️", gradient: "achievement" },
  { text: "A flow state is the highest human playground. Enjoy! 🎈", gradient: "motivation" },
  { text: "God's strength carries your persistent focus. 🙏", gradient: "spiritual" },
  { text: "Perfect alignment! Time is your servant today. 👑", gradient: "focus" },
  { text: "15m anchor drop! Build the fortress of habit! 🏯", gradient: "achievement" },
  { text: "Yesterday's Ghost is sweating in terror! 😰", gradient: "motivation" },
];

export const RECORD_BEAT_MESSAGES: Omit<MotivationMessage, 'category'>[] = [
  { text: "NEW RECORD! YOU LEGEND! 👑", gradient: "achievement" },
  { text: "History made today! 📜", gradient: "completion" },
  { text: "Unstoppable force! 🚀", gradient: "motivation" },
  { text: "You just shattered your prior benchmark! 💥", gradient: "achievement" },
  { text: "Yesterday's Ghost is left crying behind! 👻", gradient: "motivation" },
  { text: "God expanded your territory of focus today! 🌅", gradient: "spiritual" },
  { text: "Unprecedented mental stamina demonstrated! 🧠", gradient: "focus" },
  { text: "The records of the academy have been re-written! 🏛️", gradient: "completion" },
  { text: "Absolutely state-of-the-art discipline! 💎", gradient: "achievement" },
  { text: "Peak human performance achieved today! 🏆", gradient: "motivation" },
  { text: "The highest star has been conquered! 🌠", gradient: "spiritual" },
  { text: "Mind overload: Success level is infinite! ⚡", gradient: "focus" },
  { text: "Divine inspiration meets tireless work! 🙏", gradient: "spiritual" },
  { text: "You are an elite sentinel of time management now. 🛡️", gradient: "focus" },
  { text: "Your scoreboard is crying from too much triumph! 😂", gradient: "completion" },
  { text: "Legend status unlocked permanently! 🎭", gradient: "achievement" },
  { text: "No longer a recruit, you are a master of time! ⚔️", gradient: "motivation" },
  { text: "The universe bows to your unstoppable willpower! 🌌", gradient: "spiritual" },
  { text: "Records are made to be broken, and you broke them all! 🔨", gradient: "completion" },
  { text: "Outstanding focus! You are the champion of hours! 🕒", gradient: "achievement" },
];

export const SPIRITUAL_DEEP_MESSAGES: Omit<MotivationMessage, 'category'>[] = [
  { text: "God watches your efforts ✨", gradient: "spiritual" },
  { text: "Your discipline pleases the universe 🌌", gradient: "spiritual" },
  { text: "Every minute, you become better 🦋", gradient: "completion" },
  { text: "Your future self is cheering 🏆", gradient: "motivation" },
  { text: "Discipline today = Freedom tomorrow 🗝️", gradient: "focus" },
  { text: "You ARE the motivation 💫", gradient: "motivation" },
  { text: "Champions are made in moments nobody sees 👁️", gradient: "achievement" },
  { text: "Your character is forged in silent struggle. ⚔️", gradient: "focus" },
  { text: "God knows the silent weight of your highest hopes. 🙏", gradient: "spiritual" },
  { text: "Your dedication is a temple of focus. Keep it holy. 🏛️", gradient: "spiritual" },
  { text: "When you focus, you honor your divine potential. ✨", gradient: "spiritual" },
  { text: "He who holds discipline holds the keys to life. 🗝️", gradient: "achievement" },
  { text: "Your growth is like a cedar tree: slow, deep, strong. 🌲", gradient: "completion" },
  { text: "Trust the divine design of your brilliant destiny. 🗺️", gradient: "spiritual" },
  { text: "Sow in tears of focus, reap in shouts of victory. 🌾", gradient: "completion" },
  { text: "God's hand guides the focus of the humble seeker. ✨", gradient: "spiritual" },
  { text: "In quietness and confidence shall be your strength. 🕯️", gradient: "focus" },
  { text: "You are designed for greatness; reject mediocrity. 🦅", gradient: "motivation" },
  { text: "A pure heart combined with a focused mind is unbeatable. 🤍", gradient: "spiritual" },
  { text: "Your focus is your signature on the canvas of destiny. ✍️", gradient: "achievement" },
  { text: "Every disciplined hour is a beautiful prayer in action. 🧎‍♀️", gradient: "spiritual" },
];

export const LOW_ENERGY_MESSAGES: Omit<MotivationMessage, 'category'>[] = [
  { text: "Even 10 minutes counts. Start small 🌱", gradient: "motivation" },
  { text: "Showing up is half the battle 💪", gradient: "motivation" },
  { text: "Be gentle with yourself today 🤍", gradient: "spiritual" },
  { text: "Tomorrow is another battle 🌅", gradient: "motivation" },
  { text: "Tired? Rest, but do not quit. 🌸", gradient: "spiritual" },
  { text: "God understands your fatigue. Take a small break. 🙏", gradient: "spiritual" },
  { text: "Just do one minute. That's enough to spark. ⚡", gradient: "focus" },
  { text: "No pressure today, let's just make subtle strides. 🐢", gradient: "completion" },
  { text: "A quiet step is still a step forward. 👣", gradient: "motivation" },
  { text: "Your body is a temple, listen to its quiet rhythm. 💆‍♂️", gradient: "spiritual" },
  { text: "Even a small spark can light up a dark corridor. 🕯️", gradient: "focus" },
  { text: "Protect your streak with minimal, gentle study. 🏵️", gradient: "achievement" },
  { text: "Take a deep breath. Exhale the exhaustion. 🧘", gradient: "motivation" },
  { text: "God blesses your patience. Keep holding the line. 🛡️", gradient: "spiritual" },
  { text: "Procrastination is loudest when you are tired. Silently resist. 🤫", gradient: "focus" },
  { text: "A tiny block of 10-minutes is a victory today. 🏅", gradient: "completion" },
  { text: "Compassion for yourself is key to long endurance. ❤️‍🩹", gradient: "spiritual" },
  { text: "You don't need to fly, just walk or crawl today. 🪵", gradient: "motivation" },
  { text: "The sun will shine bright again tomorrow. Standby. ☀️", gradient: "completion" },
  { text: "Rest your mind, protect your energy, keep hope active. 🕊️", gradient: "spiritual" },
];

export const ALL_MOTIVATION_MESSAGES: MotivationMessage[] = [
  ...MORNING_MESSAGES.map(m => ({ ...m, category: 'morning' as const })),
  ...AFTERNOON_MESSAGES.map(m => ({ ...m, category: 'afternoon' as const })),
  ...EVENING_MESSAGES.map(m => ({ ...m, category: 'evening' as const })),
  ...NIGHT_MESSAGES.map(m => ({ ...m, category: 'night' as const })),
  ...TIMER_STARTED_MESSAGES.map(m => ({ ...m, category: 'focus_start' as const })),
  ...MILESTONE_15M_MESSAGES.map(m => ({ ...m, category: 'milestone_15m' as const })),
  ...RECORD_BEAT_MESSAGES.map(m => ({ ...m, category: 'record_beat' as const })),
  ...SPIRITUAL_DEEP_MESSAGES.map(m => ({ ...m, category: 'spiritual' as const })),
  ...LOW_ENERGY_MESSAGES.map(m => ({ ...m, category: 'low_energy' as const })),
];

/**
 * Returns a smart selected motivational message based on time of day or action triggers.
 */
export function getSmartMotivationMessage(
  trigger?: 'focus_start' | 'milestone_15m' | 'record_beat' | 'spiritual' | 'low_energy'
): MotivationMessage {
  if (trigger) {
    const subset = ALL_MOTIVATION_MESSAGES.filter(m => m.category === trigger);
    return subset[Math.floor(Math.random() * subset.length)] || ALL_MOTIVATION_MESSAGES[0];
  }

  // Get current hour
  const currentHour = new Date().getHours();
  let category: MotivationMessage['category'] = 'afternoon';

  if (currentHour >= 5 && currentHour < 12) {
    category = 'morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    category = 'afternoon';
  } else if (currentHour >= 17 && currentHour < 22) {
    category = 'evening';
  } else {
    category = 'night';
  }

  // Draw random message from subset or spiritual
  const useSpiritual = Math.random() < 0.25; // 25% chance of spiritual messages
  const chosenCat = useSpiritual ? 'spiritual' : category;

  const subset = ALL_MOTIVATION_MESSAGES.filter(m => m.category === chosenCat);
  return subset[Math.floor(Math.random() * subset.length)] || ALL_MOTIVATION_MESSAGES[0];
}
