import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const tools = [
  {
    function_declarations: [
      {
        name: "create_task",
        description: "Create a new scheduled task or a to-do item. Use this for 'add', 'plan', 'schedule' requests.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "The title of the task" },
            startTime: { type: "STRING", description: "HH:MM format (24h). Omit or null for anytime/todo items." },
            duration: { type: "NUMBER", description: "Duration in minutes. Default to 30 if unknown." },
            icon: { type: "STRING", description: "A suggested emoji icon" },
            color: { type: "STRING", description: "A pastel hex color (e.g. #FFC8C3)" },
            subtasks: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "List of subtasks or breakdown steps"
            }
          },
          required: ["title"]
        }
      },
      {
        name: "update_task",
        description: "Update an existing task or todo. Use this for 'change', 'move', 'rename'.",
        parameters: {
          type: "OBJECT",
          properties: {
            originalTitle: { type: "STRING", description: "The current title of the task to find" },
            updates: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                startTime: { type: "STRING" },
                duration: { type: "NUMBER" },
                done: { type: "BOOLEAN" }
              }
            }
          },
          required: ["originalTitle", "updates"]
        }
      },
      {
        name: "delete_task",
        description: "Delete or remove a task or to-do. Identify it by its title.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "The title of the task to remove" }
          },
          required: ["title"]
        }
      },
      {
        name: "clear_all_tasks",
        description: "Completely clear or reset the entire schedule and all todos. Use this only when requested by user.",
        parameters: { type: "OBJECT", properties: {} }
      }
    ]
  }
];

// WebSocket-based Multimodal Live implementation

export const generateSchedule = async (prompt, currentTime, currentTasks = [], currentTodos = []) => {
  return new Promise((resolve, reject) => {
    try {
      const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;
      const ws = new WebSocket(url);
      let actions = [];
      let isResolved = false;

      const finish = (data) => {
        if (isResolved) return;
        isResolved = true;
        if (ws.readyState === WebSocket.OPEN) ws.close();
        resolve(data);
      };

      const fail = (err) => {
        if (isResolved) return;
        isResolved = true;
        if (ws.readyState === WebSocket.OPEN) ws.close();
        reject(err);
      };

      let timeout = setTimeout(() => fail(new Error("AI Request timed out")), 12000);

      ws.onopen = () => {
        console.log("AI WebSocket: Connection Opened");
        // 1. Setup
        if (ws.readyState === WebSocket.OPEN) {
          const setupMessage = {
            setup: {
              model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
              system_instruction: {
                parts: [{ text: "You are a specialized agent for Tiimo that ONLY uses tools to fulfill requests. DO NOT provide any text or audio response. ONLY call the provided tools. \n\nCRITICAL RULES:\n1. ALWAYS suggest a highly relevant emoji 'icon' for every task and todo.\n2. ALWAYS suggest a beautiful, soft pastel 'color' (hex) for the task and todo background.\n3. Break down tasks into subtasks when it makes sense.\n4. To delete 'all', call 'delete_task' for every single item you see in the context OR call 'clear_all_tasks'.\n\nToday: " + currentTime + ".\nScheduled Tasks Context: " + JSON.stringify(currentTasks.map(t => ({ id: t.id, title: t.title, time: t.startTime }))) + "\nAnytime Todos Context: " + JSON.stringify(currentTodos.map(t => ({ id: t.id, title: t.title }))) }]
              },
              generation_config: {
                response_modalities: ["AUDIO"]
              },
              tools: tools
            }
          };
          console.log("AI WebSocket: Sending Setup");
          ws.send(JSON.stringify(setupMessage));
        }

        // 2. Send Prompt slightly after setup
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const promptMsg = {
            client_content: {
              turns: [{
                role: "user",
                parts: [{ text: prompt }]
              }],
              turn_complete: true
            }
          };
          console.log("AI WebSocket: Sending Prompt");
          ws.send(JSON.stringify(promptMsg));
        }, 150);
      };

      ws.onmessage = async (event) => {
        let data;
        try {
          if (event.data instanceof Blob) {
            data = JSON.parse(await event.data.text());
          } else {
            data = JSON.parse(event.data);
          }
        } catch (e) {
          console.error("AI WebSocket: Message Parse Error", e);
          return;
        }

        console.log("AI WebSocket: Received Message", data);

        // Handle Tool Calls
        if (data.toolCall?.functionCalls) {
          console.log("AI WebSocket: Function Calls received:", data.toolCall.functionCalls);
          actions = data.toolCall.functionCalls.map(call => {
            if (call.name === 'create_task') {
              return { type: 'create', ...call.args };
            }
            if (call.name === 'update_task') {
              // Search in both tasks and todos
              const target = [...currentTasks, ...currentTodos].find(t => t.title.toLowerCase().includes(call.args.originalTitle.toLowerCase()));
              return { type: 'update', id: target?.id, updates: call.args.updates };
            }
            if (call.name === 'delete_task') {
              // Search in both tasks and todos
              const target = [...currentTasks, ...currentTodos].find(t => t.title.toLowerCase().includes(call.args.title.toLowerCase()));
              return { type: 'delete', id: target?.id };
            }
            if (call.name === 'clear_all_tasks') {
              return { type: 'clear_all' };
            }
            return null;
          }).filter(Boolean);
        }

        // Resolve immediately if we have tool calls
        if (data.toolCall) {
          console.log("AI WebSocket: Tool Call confirmed, resolving actions.");
          clearTimeout(timeout);
          // Small delay to ensure any parallel chunks are processed
          setTimeout(() => finish({ actions }), 200);
          return;
        }

        // Fallback for turn complete or model finished without tools
        if (data.serverContent?.turnComplete) {
          console.log("AI WebSocket: Turn Complete received.");
          clearTimeout(timeout);
          finish({ actions });
        }

        if (data.serverContent?.interrupted) {
          console.warn("AI WebSocket: Interrupted");
        }
      };

      ws.onerror = (e) => {
        console.error("AI WebSocket: Error Event", e);
        clearTimeout(timeout);
        fail(new Error("WebSocket connection failed"));
      };

      ws.onclose = (e) => {
        console.log("AI WebSocket: Connection Closed", e.code, e.reason);
        if (!isResolved) finish({ actions: [] });
      };

    } catch (error) {
      reject(error);
    }
  });
};
