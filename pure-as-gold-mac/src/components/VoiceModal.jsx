import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaTimes, FaStop } from 'react-icons/fa';
import { AudioRecorder, AudioPlayer } from '../utils/audioUtils';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const MODEL = "models/gemini-2.5-flash-native-audio-preview-09-2025";

const VoiceModal = ({ isOpen, onClose, onAIActions, currentTasks, currentTodos }) => {
    const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected, error
    const [isSpeaking, setIsSpeaking] = useState(false);
    const wsRef = useRef(null);
    const recorderRef = useRef(null);
    const playerRef = useRef(null);
    const audioContextRef = useRef(null);

    // Tools Definition
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
                            startTime: { type: "STRING", description: "HH:MM format (24h). Omit for anytime/todo items." },
                            duration: { type: "NUMBER", description: "Duration in minutes. Default to 30 if unknown." },
                            icon: { type: "STRING", description: "A suggested emoji icon" },
                            color: { type: "STRING", description: "A pastel hex color (e.g. #FFC8C3)" },
                            subtasks: {
                                type: "ARRAY",
                                items: { type: "STRING" },
                                description: "List of subtasks or checklist items"
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
                    description: "Delete or remove a task.",
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
                    description: "Completely clear or reset the entire schedule and all todos. Use this only when specifically requested by user.",
                    parameters: { type: "OBJECT", properties: {} }
                }
            ]
        }
    ];

    useEffect(() => {
        if (isOpen) {
            connect();
        } else {
            disconnect();
        }
        return () => disconnect();
    }, [isOpen]);

    const connect = async () => {
        try {
            setStatus('connecting');
            const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = async () => {
                console.log("WebSocket connected");
                setStatus('connected');

                // precise Bidi Setup
                const setupMessage = {
                    setup: {
                        model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
                        system_instruction: {
                            parts: [{ text: "Always speak in English. You are a specialized agent for Tiimo that uses tools to fulfill requests. Be fast and do as users intend. call the provided tools. \n\nRules:\n1. ALWAYS suggest a highly relevant emoji 'icon' for every task.\n2. ALWAYS suggest a beautiful, soft pastel 'color' (hex) for the task background.\n3. Break down tasks into subtasks when it makes sense.\n4. To delete 'all', call 'delete_task' for every single item you see in the context OR call 'clear_all_tasks'.\n\nIf a time isn't mentioned, treat it as a to-do by omitting the startTime. \n\nScheduled Tasks Context: " + JSON.stringify(currentTasks.map(t => ({ id: t.id, title: t.title, time: t.startTime }))) + "\nAnytime Todos Context: " + JSON.stringify(currentTodos.map(t => ({ id: t.id, title: t.title }))) }]
                        },
                        generation_config: {
                            response_modalities: ["AUDIO"],
                            speech_config: {
                                voice_config: { prebuilt_voice_config: { voice_name: "Puck" } }
                            }
                        },
                        tools: tools
                    }
                };
                ws.send(JSON.stringify(setupMessage));

                // Start Audio Recording
                recorderRef.current = new AudioRecorder(16000);
                await recorderRef.current.start((pcmData) => {
                    // Send audio chunks
                    if (ws.readyState === WebSocket.OPEN) {
                        const base64Audio = btoa(
                            String.fromCharCode(...pcmData)
                        );
                        ws.send(JSON.stringify({
                            realtime_input: {
                                media_chunks: [{
                                    mime_type: "audio/pcm",
                                    data: base64Audio
                                }]
                            }
                        }));
                    }
                });

                playerRef.current = new AudioPlayer(24000);
            };

            ws.onmessage = async (event) => {
                let data;
                if (event.data instanceof Blob) {
                    data = JSON.parse(await event.data.text());
                } else {
                    data = JSON.parse(event.data);
                }

                // CRITICAL: Handle Interruption
                if (data.serverContent?.interrupted) {
                    console.log("AI Interrupted - clearing audio buffer");
                    if (playerRef.current) playerRef.current.stop();
                    setIsSpeaking(false);
                    return;
                }

                // Handle Turn Completion
                if (data.serverContent?.turnComplete) {
                    setIsSpeaking(false);
                }

                // Handle Audio Output
                if (data.serverContent?.modelTurn?.parts) {
                    const parts = data.serverContent.modelTurn.parts;
                    for (const part of parts) {
                        if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                            // Decode base64 and play
                            const binaryString = atob(part.inlineData.data);
                            const len = binaryString.length;
                            const bytes = new Uint8Array(len);
                            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
                            playerRef.current.playChunk(bytes);
                            setIsSpeaking(true);
                            // Reset speaking indicator after a bit roughly
                            setTimeout(() => setIsSpeaking(false), 2000);
                        }
                    }
                }

                // Handle Tool Calls
                if (data.toolCall) {
                    handleToolCall(data.toolCall);
                }
            };

            ws.onerror = (e) => {
                console.error("WebSocket Error", e);
                setStatus('error');
            };

            ws.onclose = (event) => {
                console.log("WebSocket disconnected", event.code, event.reason);
                if (status !== 'error') setStatus('disconnected');
            };

        } catch (error) {
            console.error("Connection failed", error);
            setStatus('error');
        }
    };

    const handleToolCall = (toolCall) => {
        const functionCalls = toolCall.functionCalls;
        if (!functionCalls) return;

        const responses = [];

        functionCalls.forEach(call => {
            console.log("Tool Called:", call.name, call.args);
            let result = { result: "success" };

            // Execute locally via onAIActions wrapper logic
            // We convert the tool call format to our internal "action" format
            if (call.name === 'create_task') {
                const action = {
                    type: 'create',
                    title: call.args.title,
                    startTime: call.args.startTime,
                    duration: call.args.duration || 30,
                    icon: call.args.icon || '📅',
                    color: call.args.color || '#ddd',
                    subtasks: call.args.subtasks
                };
                onAIActions({ actions: [action] });
            } else if (call.name === 'update_task') {
                // Find task ID by title (fuzzy match)
                const allItems = [...currentTasks, ...currentTodos];
                const target = allItems.find(t => t.title.toLowerCase().includes(call.args.originalTitle.toLowerCase()));

                if (target) {
                    const action = {
                        type: 'update',
                        id: target.id,
                        updates: call.args.updates
                    };
                    onAIActions({ actions: [action] });
                } else {
                    result = { result: "error", message: "Task not found" };
                }
            } else if (call.name === 'delete_task') {
                const allItems = [...currentTasks, ...currentTodos];
                const target = allItems.find(t => t.title.toLowerCase().includes(call.args.title.toLowerCase()));
                if (target) {
                    const action = {
                        type: 'delete',
                        id: target.id
                    };
                    onAIActions({ actions: [action] });
                } else {
                    result = { result: "error", message: "Task not found" };
                }
            } else if (call.name === 'clear_all_tasks') {
                onAIActions({ actions: [{ type: 'clear_all' }] });
            }

            responses.push({
                id: call.id,
                name: call.name,
                response: result
            });
        });

        // Send Tool Response back to AI
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const responseMsg = {
                tool_response: {
                    function_responses: responses
                }
            };
            wsRef.current.send(JSON.stringify(responseMsg));
            // also prompt gemini to continue (usually automatic, but good to ensure flow)
        }
    };

    const disconnect = () => {
        if (recorderRef.current) recorderRef.current.stop();
        if (wsRef.current) wsRef.current.close();
        setStatus('disconnected');
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: 40, right: 40, background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                >
                    <FaTimes size={32} />
                </button>

                <motion.div
                    animate={{
                        scale: isSpeaking ? [1, 1.2, 1] : [1, 1.05, 1],
                        opacity: isSpeaking ? 1 : 0.8
                    }}
                    transition={{ repeat: Infinity, duration: isSpeaking ? 0.8 : 2 }}
                    style={{
                        width: 120, height: 120,
                        background: status === 'error' ? '#ff6b6b' : 'var(--primary)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 40px',
                        boxShadow: `0 0 60px ${status === 'error' ? 'rgba(255,107,107,0.4)' : 'rgba(108,124,221,0.4)'}`
                    }}
                >
                    <FaMicrophone size={40} color="white" />
                </motion.div>

                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {status === 'connecting' && "Connecting..."}
                    {status === 'connected' && (isSpeaking ? "Speaking..." : "Listening...")}
                    {status === 'error' && "Connection Failed"}
                </h2>
                <p style={{ opacity: 0.6, marginTop: '8px' }}>
                    {status === 'connected' ? "Try saying: 'Add a coffee break at 4pm'" : "Please check your network"}
                </p>
            </div>
        </div>
    );
};

export default VoiceModal;
