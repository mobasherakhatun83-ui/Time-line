import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY") || key === "") {
      console.warn("GEMINI_API_KEY is not configured or holds a placeholder. Falling back to local AI mock response.");
      throw new Error("API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI Mind Battle Coach endpoint
app.post("/api/chat-coach", async (req, res) => {
  try {
    const { name, level, streak, yesterdayScore, todayScore, focusSessionsCount, focusMinutes, tasksCompleted, routinesCompleted, coachPersona, customCommand } = req.body;

    const personaInstructions: Record<string, string> = {
      hardcore: "You are a hardcore squad leader like David Goggins. Loud, intense, direct, demands 100% accountability, uses military/combat references. Call out their focus directly. Tell them how to destroy yesterday's ghost.",
      zen: "You are a serene, wise Zen monastery master. Calm, meditative, deeply reflective, focused on gradual mastery, presence, breathing, and balanced effort.",
      analytics: "You are an elite, cold, high-performance systems algorithm/data analyst. Speak in quantitative terms, metrics, optimization matrices, efficiency loops, and biological hardware upgrades."
    };

    const instruction = personaInstructions[coachPersona] || personaInstructions.hardcore;

    let promptSuffix = `Write a short, highly customized tactical briefing matching your persona. Mention their specific focus time (${focusMinutes} mins vs yesterday) and guide them on what action to take next to win today's combat. Keep it under 150 words. Do not print markdown code blocks, just return pure engaging typography.`;
    if (customCommand) {
      promptSuffix = `The user has sent a specific tactical combat command or inquiry: "${customCommand}". Answer this command/question in full accordance with your persona character style. Weave in their focus statistics for today if relevant to back up your recommendation or roast them. Keep the answer highly immersive, action-oriented, under 150 words, and do not use markdown code blocks.`;
    }

    const prompt = `
      User Info:
      - Name: ${name || 'Soldier'}
      - Level: ${level || 1}
      - Daily Battle Streak: ${streak || 0} days
      
      Battle Statistics:
      - Yesterday's Ghost Score to beat: ${yesterdayScore} pts
      - Today's Live Score: ${todayScore} pts
      - Focus Sessions logged today: ${focusSessionsCount}
      - Focus minutes gained today: ${focusMinutes} mins
      - Tasks Completed today: ${tasksCompleted}
      - Daily Habits (Routines) ticked off: ${routinesCompleted}
      - Battle Status: ${todayScore >= yesterdayScore ? 'WINNING THE BATTLE (Ahead of yesterday)' : 'BEHIND GHOST (Needs immediate hustle)'}

      ${promptSuffix}
    `;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are the TIMELINE Personal Mind Battle Combat Mentor. ${instruction}`,
          temperature: 0.85,
        }
      });

      res.json({
        coachFeedback: response.text || "Your commander is temporarily offline, but your primary directive remains unchanged: beat yesterday's ghost."
      });
    } catch (aiError: any) {
      // Fallback response for missing API keys or errors
      const fallbacks: Record<string, string> = {
        hardcore: customCommand 
          ? `[OFFLINE COMM FEED] COMMAND RECEIVED: "${customCommand}". LISTEN UP, ${name ? name.toUpperCase() : 'SOLDIER'}! Your custom tactical command is locked in, but my direct satellite feed is blocked because the Gemini API connection is missing. Regardless, you are at ${todayScore}/${yesterdayScore} pts today. Stop typing commands and start grinding! Win today's engagement!`
          : `LISTEN UP, ${name ? name.toUpperCase() : 'SOLDIER'}. Your comms-link shows your Gemini API key is missing or not updated. But I don't care about excuses! Your objective is ${yesterdayScore} points. You are at ${todayScore} points right now. That is a difference of ${Math.max(0, yesterdayScore - todayScore)} points! Set your target, focus for another session, lock in your habits, and beat yesterday's ghost! OUT.`,
        zen: customCommand
          ? `[OFFLINE INTENT] INQUIRY CACHED: "${customCommand}". Dear ${name || 'seeker'}, our voice is muted in this container without a key, yet the pathway to clarity is broad. Breathe, reflect on your query deeply, and find alignment in your next breath.`
          : `Dear ${name || 'seeker'}, our voice is muted in this container without a key, yet the pathway to clarity is broad. Yesterday's quiet progress was ${yesterdayScore} steps, today you have taken ${todayScore}. Breathe, align your intent, and take one more deliberate step in quiet focus.`,
        analytics: customCommand
          ? `[OFFLINE QUERY CORE] INQUIRY SUBMITTED: "${customCommand}". SYSTEM DIAGNOSTIC: API token missing or deactivated. Commencing manual emergency algorithm. Resolve the connection gap to run custom model evaluation. For now, sustain deep focus blocks to output maximum efficiency.`
          : `[SYSTEM DIAGNOSTIC] API token missing or deactivated. Commencing manual emergency algorithm. Current profile: Name=${name}, Target=${yesterdayScore}, Achieved=${todayScore}. Performance variance is ${yesterdayScore - todayScore} points. Recommended mitigation: Initialize 25-minute Pomodoro protocol immediately to achieve nominal performance balance.`
      };

      res.json({
        coachFeedback: fallbacks[coachPersona] || fallbacks.hardcore,
        error: "Note: Running in offline fallback mode. Enter a real Gemini API Key in AI Studio Secrets to unlock real generative coaches!"
      });
    }
  } catch (err: any) {
    console.error("Server endpoint error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// AI Schedule Generator endpoint
app.post("/api/generate-schedule", async (req, res) => {
  try {
    const { goals, userName } = req.body;
    const prompt = `
      User ${userName || 'Warrior'} provided their focus goals:
      "${goals || 'Improve focus routines, finish books, and prepare for exams'}"
      
      Generate a recommended weekly productivity block schedule.
      Output exactly 5 core recurring scheduled slots. Format the response as a valid JSON array, and nothing else.
      Each item in the JSON array must strictly have these fields:
      - id (string, unique short id like 'sc_x')
      - title (string, name of focusing block e.g., 'Deep Work: Coding')
      - days (array of strings, e.g. ["Mon", "Wed", "Fri"] or ["Tue", "Thu"] or ["Sat", "Sun"])
      - startTime (string, format 'HH:MM', e.g., '09:00', '14:30', '18:00')
      - duration (number, in minutes, select from [30, 45, 60, 90, 120])
      - category (string, select from: 'work', 'study', 'health', 'spirit', 'mind')

      Ensure no extra talking or markdown code blocks (no \`\`\`json etc.). Return ONLY the JSON array.
    `;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const responseText = response.text || "[]";
      let cleanJson = responseText.trim();
      // Safeguard in case model output contains markdown
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.substring(7);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      const scheduleArray = JSON.parse(cleanJson.trim());
      res.json({ success: true, schedule: scheduleArray });

    } catch (aiError) {
      // Fallback schedule array if Gemini API returns error or is missing key
      const fallbackSchedule = [
        { id: "sc_auto_1", title: "🌅 Sunrise Focus (Goal Builder)", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "07:00", duration: 45, category: "mind" },
        { id: "sc_auto_2", title: "💼 Deep Production Combat", days: ["Mon", "Wed", "Fri"], startTime: "09:30", duration: 90, category: "work" },
        { id: "sc_auto_3", title: "📚 Skill Drill / Exam Study", days: ["Tue", "Thu"], startTime: "14:00", duration: 120, category: "study" },
        { id: "sc_auto_4", title: "🌱 Energy Reset (Breathe & Stretch)", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "16:30", duration: 30, category: "health" },
        { id: "sc_auto_5", title: "🌌 Evening Retrospective & Read", days: ["Sat", "Sun"], startTime: "20:30", duration: 60, category: "spirit" }
      ];
      res.json({ 
        success: true, 
        schedule: fallbackSchedule,
        isFallback: true,
        message: "Note: Running on manual template tracker fallback. Add a real Gemini key in Secrets to activate real-time customized generation!"
      });
    }
  } catch (err: any) {
    console.error("Schedule generation error:", err);
    res.status(500).json({ error: "Schedule generation failed" });
  }
});

// AI Weekly Performance Coach Report
app.post("/api/coach-report", async (req, res) => {
  try {
    const { userName, level, streak, sessions } = req.body;
    const statsSummary = sessions && sessions.length > 0 
      ? `User has completed ${sessions.length} sessions totaling ${sessions.reduce((acc: number, cur: any) => acc + (cur.minutes || 0), 0)} focus minutes. Sessions detail: ${JSON.stringify(sessions)}`
      : 'User has logged 5 focused hours over past week, with high active intensity on Sat and Wed.';

    const prompt = `
      User Name: ${userName || 'Warrior'}
      Level: ${level || 1}
      Streak: ${streak || 0} days
      Weekly focus data: ${statsSummary}

      Analyze this participant's activity map and compile an elite Cognitive Coach Intelligence report.
      Include these four sections strictly:
      1. Identified Behavioral Patterns (e.g. daily habits, best hours)
      2. Strengths to Celebrate
      3. Focus Optimization Suggestions (e.g. managing energy dips, scheduling modifications)
      4. Targeted Key Performance Parameters (goals) for next week
      
      Begin each section with a clear visual identifier header (e.g. '📋 SECTION NAME').
      Speak in an inspirational, high-performance coaching tone. Word count around 220 words.
    `;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.8,
        }
      });
      res.json({ success: true, report: response.text });
    } catch (aiError) {
      const fallbackReport = `
### 📋 COGNITIVE ANALYSIS FOR THE STRIVER

#### 1. IDENTIFIED BEHAVIORAL PATTERNS
• **Morning Acceleration**: Data indicates high motivation levels prior to 09:00, with focus sessions on Mon/Wed showing 95% completion rates.
• **Afternoon Energy Variance**: Focus duration drops by 40% between 14:00 and 16:30, signaling cognitive friction or physiological energy dips.

#### 2. CELEBRATING YOUR STRENGTHS
• **Unbreakable Alignment**: Ticking off daily habits consistently has maintained an active streak of ${streak} days.
• **Master Resilience**: Your ability to resume focus sessions on Sat establishes a secure weekend peak baseline.

#### 3. COGNITIVE OPTIMIZATION MATRIX
• **Introduce Tactical Margins**: Add a 5-minute deep-breathing routine at 15:00 to refresh neural pathways.
• **Consolidate Deep Work Blocks**: Schedule complex thinking tasks during 09:00 - 11:30 and simple tracking tasks during afternoon fatigue periods.

#### 4. NEXT WEEK'S INTEGRATED BENCHMARKS
• **Target 1**: Maintain streak above 7 days.
• **Target 2**: Log at least 3 high-intensity sessions of 45 mins.
• **Target 3**: Set quiet hours starting strictly at 22:30 to maximize recovery sleep efficiency.
      `;
      res.json({ success: true, report: fallbackReport, isFallback: true });
    }
  } catch (err: any) {
    console.error("Coach report endpoint error:", err);
    res.status(500).json({ error: "Coach report failed" });
  }
});

// Configure Vite middleware or static files depending on environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
