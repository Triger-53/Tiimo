import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export const generateSchedule = async (prompt, currentTime, currentTasks = []) => {
  try {
    const result = await model.generateContent(`
      You are an expert AI scheduler for a daily planner app.
      The current time is ${currentTime}.
      
      Current Tasks Context:
      ${JSON.stringify(currentTasks.map(t => ({ id: t.id, title: t.title, time: t.startTime })))}

      User Request: "${prompt}"
      
      Based on the request and current context, generate a list of ACTIONS to modify the schedule.
      Return a JSON object with a single key "actions" which is an array of objects.
      
      Supported Action Types:
      1. "create": Add a new task.
         Fields: { 
           type: "create", 
           title, 
           startTime (HH:MM), 
           duration (mins), 
           icon, 
           color,
           subtasks: ["step 1", "step 2"] (optional, breakdown of the task)
         }
      
      2. "update": Modify an existing task.
         Fields: { type: "update", id, updates: { ...changedFields, subtasks? } }
      
      3. "delete": Remove a task.
         Fields: { type: "delete", id }

      Rules:
      - Always try to break down complex tasks (like "clean house" or "study") into 3-5 subtasks.
      - **CRITICAL**: If the user asks to add a "to-do", "reminder", or something with NO specific time, return "startTime": null. This will add it to the Anytime list.
      - Can user "startTime": null for tasks that don't need a specific slot.
      - Infer colors (pastel) and emojis.
      - Return ONLY the JSON.
    `);

    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    console.log("AI Raw Response:", text); // Debug log

    try {
      return JSON.parse(text);
    } catch (e) {
      // Sometimes AI wraps in other things or returns invalid JSON
      console.error("JSON Parse Error:", e);
      // Try to salvage if it's a simple array wrapped in text
      const match = text.match(/\[.*\]/s) || text.match(/\{.*\}/s);
      if (match) return JSON.parse(match[0]);
      throw e;
    }
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};
