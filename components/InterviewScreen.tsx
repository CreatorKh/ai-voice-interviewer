
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { TranscriptEntry, Speaker, Job, ApplicationData, AntiCheatReport } from '../types';
import { finalizeInterview, InterviewState } from '../services/interviewPipeline/pipeline';
import { getQuestionForRoleAndStage } from '../services/interviewPipeline/questionBank';
import LogOutIcon from './icons/StopIcon';

// --- Audio Utils (Adapted from Gemini Live API Docs) ---

function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, targetSampleRate: number): Float32Array {
    if (inputSampleRate === targetSampleRate) return buffer;
    if (inputSampleRate < targetSampleRate) return buffer; 

    const sampleRateRatio = inputSampleRate / targetSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    
    let offsetResult = 0;
    let offsetBuffer = 0;
    
    while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        
        let accum = 0, count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        
        result[offsetResult] = count > 0 ? accum / count : 0;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // Clamp to Int16 range
        const s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return {
        data: base64,
        mimeType: 'audio/pcm;rate=16000',
    };
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Visualizer Component ---

const AudioVisualizer: React.FC<{ 
    analyser: AnalyserNode | null; 
    mode: 'mic' | 'ai' | 'idle'; 
}> = ({ analyser, mode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const bufferLength = analyser ? analyser.frequencyBinCount : 0;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            if (mode === 'idle' || !analyser) {
                // Breathing circle for idle
                const time = Date.now() / 1000;
                const radius = 30 + Math.sin(time * 2) * 2;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                analyser.getByteFrequencyData(dataArray);
                
                // Circular Equalizer
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = 40;
                const bars = 40; 
                const step = Math.floor(bufferLength / bars);
                
                let r, g, b;
                if (mode === 'mic') { r = 74; g = 222; b = 128; } // Green-400
                else { r = 34; g = 211; b = 238; } // Cyan-400

                for (let i = 0; i < bars; i++) {
                    const value = dataArray[i * step] || 0; 
                    const barHeight = Math.max(4, (value / 255) * 80);

                    const rad = (i / bars) * 2 * Math.PI;
                    const x1 = centerX + Math.cos(rad) * radius;
                    const y1 = centerY + Math.sin(rad) * radius;
                    const x2 = centerX + Math.cos(rad) * (radius + barHeight);
                    const y2 = centerY + Math.sin(rad) * (radius + barHeight);

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + (value/255)})`;
                    ctx.lineWidth = 4;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            }
            
            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [analyser, mode]);

    return <canvas ref={canvasRef} width={300} height={300} className="w-64 h-64 md:w-80 md:h-80" />;
};

// --- Main Component ---

interface InterviewScreenProps {
  job: Job;
    onEnd: (transcript: TranscriptEntry[], recordingUrl: string, evaluation: any, antiCheatReport: AntiCheatReport) => void;
  applicationData: ApplicationData;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ job, onEnd, applicationData }) => {
    // -- State --
    const [status, setStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('CONNECTING');
  const [timer, setTimer] = useState(0);
    const [isMicActive, setIsMicActive] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    
    // Live Transcription State
    const [currentInputTrans, setCurrentInputTrans] = useState("");
    const [currentOutputTrans, setCurrentOutputTrans] = useState("");
    const [transcriptHistory, setTranscriptHistory] = useState<TranscriptEntry[]>([]);

    // -- Refs --
    const isMountedRef = useRef(true); // Track component mount state
    const inputAudioCtxRef = useRef<AudioContext | null>(null);
    const outputAudioCtxRef = useRef<AudioContext | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const micAnalyserRef = useRef<AnalyserNode | null>(null);
    const aiAnalyserRef = useRef<AnalyserNode | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
    const recordingMimeTypeRef = useRef<string>('video/webm');
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Reconnect Refs
    const retryCountRef = useRef(0);
    const isReconnectingRef = useRef(false);
    const isAudioSetupRef = useRef(false);
    const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Track mounted state
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // Timer
    useEffect(() => {
        const i = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(i);
    }, []);

    // Media Cleanup Helper
    const stopMedia = useCallback(() => {
        console.log("Stopping media...");
        // 0. Stop Video Interval
        if (videoIntervalRef.current) {
             clearInterval(videoIntervalRef.current);
             videoIntervalRef.current = null;
        }

        // 1. Stop Mic Tracks
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => {
                t.stop();
                console.log(`Stopped track: ${t.label}`);
            });
            micStreamRef.current = null;
        }
        
        // 2. Close Audio Contexts
        // Use refs directly to avoid closure staleness, but check if they are the current ones? 
        // Simply closing what is in the ref is usually correct for cleanup.
        if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
            try { inputAudioCtxRef.current.close(); } catch(e) {}
        }
        if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') {
            try { outputAudioCtxRef.current.close(); } catch(e) {}
        }
        
        // 3. Stop Media Recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
             try { mediaRecorderRef.current.stop(); } catch(e) {}
        }
        
        // 4. Clear Video
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        
        console.log("All media stopped");
    }, []);

    // -- Cleanup --
    useEffect(() => {
        return () => {
            stopMedia();
        };
    }, [stopMedia]);

    // Define startRecording helper
    const startRecording = useCallback((streamToRecord: MediaStream) => {
        let mimeType = 'video/webm';
        if (typeof MediaRecorder !== 'undefined') {
            if (!MediaRecorder.isTypeSupported('video/webm')) {
                if (MediaRecorder.isTypeSupported('video/mp4')) {
                    mimeType = 'video/mp4';
                } else {
                    mimeType = ''; 
                }
            }
        }
        recordingMimeTypeRef.current = mimeType;

        if (typeof MediaRecorder !== 'undefined') {
            try {
                const recorder = mimeType ? new MediaRecorder(streamToRecord, { mimeType }) : new MediaRecorder(streamToRecord);
                recorder.ondataavailable = e => { 
                    if (e.data.size > 0) recordedChunksRef.current.push(e.data); 
                };
                recorder.start(1000);
                mediaRecorderRef.current = recorder;
                console.log("Recording started with mimeType:", mimeType);
            } catch (e) {
                console.error("Failed to start recorder", e);
            }
        }
    }, []);

    const setupAudioPipeline = useCallback(async () => {
        if (isAudioSetupRef.current) return true;
        if (!isMountedRef.current) return false;

        try {
            // 1. Audio Contexts
            const InputAC = (window.AudioContext || (window as any).webkitAudioContext);
            const OutputAC = (window.AudioContext || (window as any).webkitAudioContext);
            
            const inputCtx = new InputAC(); 
            const outputCtx = new OutputAC({ sampleRate: 24000 }); 
            
            // Store in refs immediately
            inputAudioCtxRef.current = inputCtx;
            outputAudioCtxRef.current = outputCtx;

            // Output Node setup
            const outputNode = outputCtx.createGain();
            outputNode.connect(outputCtx.destination);
            outputNodeRef.current = outputNode;

            // AI Analyser
            const aiAnalyser = outputCtx.createAnalyser();
            aiAnalyser.fftSize = 64;
            outputNode.connect(aiAnalyser); 
            aiAnalyserRef.current = aiAnalyser;

            // 2. Mic Stream - Use Browser Native Processing
            const preferredMicId = localStorage.getItem('preferredMicId');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    deviceId: preferredMicId ? { exact: preferredMicId } : undefined
                },
                video: { facingMode: 'user' }
            });
            
            // CRITICAL CHECK: If unmounted or closed during await
            if (!isMountedRef.current || inputCtx.state === 'closed') {
                console.warn("Component unmounted or context closed during getUserMedia. Aborting.");
                stream.getTracks().forEach(t => t.stop());
                return false;
            }

            micStreamRef.current = stream;

            // Ensure AudioContext is running
            if (inputCtx.state === 'suspended') {
                await inputCtx.resume();
            }
            if (outputCtx.state === 'suspended') {
                try {
                    await outputCtx.resume();
                } catch (e) {
                    console.warn("Output context resume failed:", e);
                }
            }
            
            // CRITICAL CHECK AGAIN
            if (!isMountedRef.current || inputCtx.state === 'closed') return false;

            // Set video source
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Mic Analyser
            const source = inputCtx.createMediaStreamSource(stream);
            const micAnalyser = inputCtx.createAnalyser();
            micAnalyser.fftSize = 64;
            source.connect(micAnalyser);
            micAnalyserRef.current = micAnalyser;

            // 3. Processor: Downsample to 16kHz and Send
            console.log(`Audio Input Rate: ${inputCtx.sampleRate}Hz. Downsampling to 16000Hz.`);
            
            // CRITICAL CHECK AGAIN
            if (inputCtx.state === 'closed') return false;

            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
                // Safety check inside callback
                if (!isMountedRef.current) return;

                const inputData = e.inputBuffer.getChannelData(0);
                
                // Downsample to 16kHz
                const downsampledData = downsampleBuffer(inputData, inputCtx.sampleRate, 16000);
                
                // Send to Gemini
                const pcmBlob = createBlob(downsampledData);
                sessionPromiseRef.current?.then(session => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
                
                // Visualizer
                const rms = Math.sqrt(inputData.reduce((s, v) => s + v*v, 0) / inputData.length);
                setIsMicActive(rms > 0.01); 
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            
            // Record the processed stream
            startRecording(stream);
            
            isAudioSetupRef.current = true;
            return true;

        } catch (err) {
            console.error("Audio Setup failed", err);
            alert("Could not start interview. Check permissions.");
            return false;
        }
    }, [startRecording]);

    const connectToGemini = useCallback(async (isReconnect = false) => {
        // If reconnecting, wait a bit before trying (exponential backoff could be here)
        if (isReconnect) {
            setStatus('RECONNECTING');
            await new Promise(r => setTimeout(r, 2000));
        } else {
            setStatus('CONNECTING');
        }

        if (!isMountedRef.current) return;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const resumeContext = `
Name: ${applicationData.name}
Email: ${applicationData.email}
Profile Summary: ${applicationData.profileSummary || "N/A"}
Skills: ${applicationData.parsedSkills?.join(", ") || "N/A"}
LinkedIN: ${applicationData.linkedInUrl || "N/A"}
GitHub: ${applicationData.githubUrl || "N/A"}
Kaggle: ${applicationData.kaggleUrl || "N/A"}
LeetCode: ${applicationData.leetcodeUrl || "N/A"}
TryHackMe: ${applicationData.tryhackmeUrl || "N/A"}
CodeForces: ${applicationData.codeforcesUrl || "N/A"}
`;

            // Generate Strict Question Plan (RAG)
            const plan = [
                getQuestionForRoleAndStage(job.title, 'Background', 1) || "Расскажите о себе и своем опыте.",
                getQuestionForRoleAndStage(job.title, 'Core', 2) || "Какие основные инструменты вы используете?",
                getQuestionForRoleAndStage(job.title, 'Core', 3) || "Углубимся в технические детали.",
                getQuestionForRoleAndStage(job.title, 'DeepDive', 4) || "Расскажите о сложной проблеме, которую вы решили.",
                getQuestionForRoleAndStage(job.title, 'Case', 3) || "Давайте разберем практический кейс.",
                getQuestionForRoleAndStage(job.title, 'WrapUp', 2) || "Какие у вас есть вопросы?"
            ];

            let systemInstruction = `
ROLE: You are Zarina, an expert technical interviewer from Wind AI.
Your goal is to run a structured, professional technical interview for the ${job.title} role.

STARTING RULES (VERY IMPORTANT):
1. YOU initiate the conversation once (do not wait for the candidate).
2. Greeting script (translate to ${applicationData.language || 'English'}):
   "Здравствуйте, я Зарина из Wind AI. Мы проведём техническое интервью на позицию ${job.title}. Готовы начать?"
3. After the greeting, immediately follow the structure below and DO NOT repeat the greeting later.

INTERVIEW PLAN (STRICTLY FOLLOW THIS SEQUENCE):
1. Greeting & Intro
2. Question 1: ${plan[0]}
3. Question 2: ${plan[1]}
4. Question 3: ${plan[2]}
5. Question 4: ${plan[3]}
6. Question 5: ${plan[4]}
7. Question 6: ${plan[5]}
8. Closing

LANGUAGE RULE:
- Conduct the entire interview strictly in ${applicationData.language || 'English'}.
- If the candidate slips into another language, remind them (politely) to continue in ${applicationData.language || 'English'} and continue.

BEHAVIORAL RULES:
1. Be concise, professional, analytical.
2. Ask only one question at a time.
3. Drill down on vague answers.
4. If the candidate gives a nonsense/very short response (e.g., "s", ".", "не знаю"):
   - Do NOT praise.
   - Say: "Я не расслышала детали. Уточните, пожалуйста." and ask a more focused follow-up.

CANDIDATE CONTEXT:
${resumeContext}
`;

            if (isReconnect && transcriptHistory.length > 0) {
                // Provide context on reconnect
                const lastTurns = transcriptHistory.slice(-10).map(t => `${t.speaker}: ${t.text}`).join('\n');
                systemInstruction += `\n\nSYSTEM NOTICE: The connection was briefly interrupted and restored. Resume the interview naturally from where you left off. Do NOT greet the user again. Here is the recent context:\n${lastTurns}`;
            }

            const config = {
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        if (!isMountedRef.current) return;
                        console.log("Session opened (Reconnect: " + isReconnect + ")");
                        setStatus('CONNECTED');
                        retryCountRef.current = 0;
                        isReconnectingRef.current = false;

                        // KICKSTART: Wait a bit for connection to stabilize, then send text trigger
                        if (!isReconnect) {
                            // Start Video Streaming
                            if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
                            videoIntervalRef.current = setInterval(() => {
                                if (!videoRef.current || !sessionPromiseRef.current) return;
                                
                                const canvas = document.createElement('canvas');
                                canvas.width = 640;
                                canvas.height = 480;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                                    const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                                    
                                    sessionPromiseRef.current.then(session => {
                                        session.sendRealtimeInput({
                                            media: {
                                                mimeType: 'image/jpeg',
                                                data: base64
                                            }
                                        });
                                    });
                                }
                            }, 2000);

                            setTimeout(() => {
                                if (!isMountedRef.current) return;
                                const startPrompt = `SYSTEM: The user has connected. IMMEDIATELY start the interview in ${applicationData.language || 'English'}. Introduce yourself and ask the first question.`;
                                sessionPromiseRef.current?.then(session => {
                                    console.log("Sending kickstart prompt...");
                                    session.sendRealtimeInput({ 
                                        content: [{ text: startPrompt }] 
                                    });
                                });
                            }, 2000);
                        }
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (!isMountedRef.current) return;
                        // 1. Audio Output
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            setIsAiSpeaking(true);
                            const ctx = outputAudioCtxRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            const buffer = await decodeAudioData(
                                decode(audioData),
                                ctx,
                                24000,
                                1
                            );
                            
                            const source = ctx.createBufferSource();
                            source.buffer = buffer;
                            source.connect(outputNodeRef.current!);
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
                            });
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += buffer.duration;
                            sourcesRef.current.add(source);
                        }

                        // 2. Transcription
                        const outTrans = msg.serverContent?.outputTranscription?.text;
                        if (outTrans) setCurrentOutputTrans(prev => prev + outTrans);

                        const inTrans = msg.serverContent?.inputTranscription?.text;
                        if (inTrans) setCurrentInputTrans(prev => prev + inTrans);

                        // 3. Turn Complete
                        if (msg.serverContent?.turnComplete) {
                            const isInterrupted = msg.serverContent?.interrupted;
                            
                            // Flush User Transcript if any
                            setCurrentInputTrans(currIn => {
                                if (currIn.trim()) {
                                    setTranscriptHistory(h => {
                                        // Deduplicate: Don't add if same as last user message
                                        const last = h[h.length - 1];
                                        if (last && last.speaker === Speaker.USER && last.text === currIn.trim()) {
                                            return h;
                                        }
                                        return [...h, { speaker: Speaker.USER, text: currIn.trim(), isFinal: true }];
                                    });
                                }
                                return "";
                            });
                            
                            // Flush AI Transcript if any
                            setCurrentOutputTrans(currOut => {
                                if (currOut.trim()) {
                                    setTranscriptHistory(h => {
                                        // Deduplicate: Don't add if same as last AI message
                                        const last = h[h.length - 1];
                                        if (last && last.speaker === Speaker.AI && last.text === currOut.trim()) {
                                            return h;
                                        }
                                        return [...h, { speaker: Speaker.AI, text: currOut.trim(), isFinal: true }];
                                    });
                                }
                                return "";
                            });

                            if (isInterrupted) {
                                sourcesRef.current.forEach(s => s.stop());
                                sourcesRef.current.clear();
                                nextStartTimeRef.current = 0;
                                setIsAiSpeaking(false);
                            }
                        }
                    },
                    onclose: () => {
                        console.log("Session closed");
                        if (isMountedRef.current && status !== 'DISCONNECTED') { // If not manually closed
                             handleReconnect();
                        }
                    },
                    onerror: (e: any) => {
                        console.error("Session error", e);
                        if (isMountedRef.current && status !== 'DISCONNECTED') {
                             handleReconnect();
                        }
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    systemInstruction: systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                }
            };

            const sessionPromise = ai.live.connect(config);
            sessionPromiseRef.current = sessionPromise;

        } catch (err) {
            console.error("Connection failed", err);
            handleReconnect();
        }
    }, [job, applicationData, transcriptHistory, status]);

    const handleReconnect = useCallback(() => {
        if (isReconnectingRef.current || status === 'DISCONNECTED') return;
        
        if (retryCountRef.current < 5) {
            isReconnectingRef.current = true;
            retryCountRef.current++;
            console.log(`Attempting reconnect ${retryCountRef.current}...`);
            connectToGemini(true);
        } else {
            setStatus('DISCONNECTED');
            alert("Connection lost. Please check your internet.");
        }
    }, [connectToGemini, status]);

    // -- Initialize --
    useEffect(() => {
        const init = async () => {
            const audioReady = await setupAudioPipeline();
            if (isMountedRef.current && audioReady) {
                connectToGemini(false);
            }
        };
        init();
    }, []); 

    const handleEndInterview = async () => {
        setStatus('DISCONNECTED');
        
        // Stop recording properly to ensure ondataavailable fires for the last chunk
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
             await new Promise<void>(resolve => {
                 if (mediaRecorderRef.current) {
                    mediaRecorderRef.current.onstop = () => resolve();
                    mediaRecorderRef.current.stop();
                 } else {
                     resolve();
                 }
             });
        }
        
        // STOP ALL MEDIA HERE
        stopMedia();
        
        // Ensure final transcription bits are saved
        const finalTranscript = [...transcriptHistory];
        if (currentInputTrans.trim()) finalTranscript.push({ speaker: Speaker.USER, text: currentInputTrans.trim(), isFinal: true });
        if (currentOutputTrans.trim()) finalTranscript.push({ speaker: Speaker.AI, text: currentOutputTrans.trim(), isFinal: true });

        // Create blob
        let recordingBlob: Blob | null = null;
        if (recordedChunksRef.current.length > 0) {
             recordingBlob = new Blob(recordedChunksRef.current, { type: recordingMimeTypeRef.current || 'video/webm' });
        }
        const url = recordingBlob ? URL.createObjectURL(recordingBlob) : "";

        // Mock State for pipeline summary generation
        const mockState: InterviewState = {
            role: job.title,
            stage: 'WrapUp',
            difficulty: 3,
            skillProfile: { communication: 0.5, reasoning: 0.5, domain: 0.5 },
            transcript: finalTranscript.map(t => ({
                q: t.speaker === Speaker.AI ? t.text : "",
                a: t.speaker === Speaker.USER ? t.text : ""
            })).reduce((acc: any[], curr) => {
                // Merge adjacent turns roughly
                if (curr.q) acc.push({ q: curr.q, a: "" });
                else if (curr.a && acc.length > 0) acc[acc.length-1].a += " " + curr.a;
                return acc;
            }, []),
            usedQuestions: [],
            finished: true,
            hasGreeted: true,
            consecutiveSilence: 0,
            language: applicationData.language,
            externalContext: ""
        };

        // Generate Summary
        const res = await finalizeInterview(mockState);
        
        onEnd(finalTranscript, url, res.summary, res.antiCheat);
    };

  return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col text-white font-sans overflow-hidden">
            
            {/* Background Video Layer */}
            <div className="absolute inset-0 z-0 opacity-40">
                <video 
                    ref={videoRef} 
                    autoPlay muted playsInline 
                    className="w-full h-full object-cover scale-x-[-1] blur-sm" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center p-6">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold tracking-wider uppercase text-neutral-300">
                        {job.title}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 animate-pulse">
                        <span className="w-2 h-2 bg-red-500 rounded-full" /> LIVE
                    </span>
              </div>
                <div className="font-mono text-neutral-400">
                    {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
          </div>
        </header>

            {/* Main Visualizer Area */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 gap-8">
                
                {/* Status Label */}
                <div className="h-8 flex items-center justify-center">
                    {status === 'CONNECTING' && <span className="text-sm text-neutral-500 animate-pulse">CONNECTING TO GEMINI LIVE...</span>}
                    {status === 'RECONNECTING' && <span className="text-sm text-yellow-500 animate-pulse">CONNECTION LOST. RECONNECTING...</span>}
                    {status === 'CONNECTED' && isAiSpeaking && <span className="text-sm text-cyan-400 font-bold tracking-widest">INTERVIEWER SPEAKING</span>}
                    {status === 'CONNECTED' && !isAiSpeaking && <span className="text-sm text-green-400 font-bold tracking-widest">LISTENING...</span>}
                </div>

                {/* The Canvas Visualizer */}
                <div className="relative flex items-center justify-center">
                    <AudioVisualizer 
                        analyser={isAiSpeaking ? aiAnalyserRef.current : micAnalyserRef.current} 
                        mode={isAiSpeaking ? 'ai' : (status === 'CONNECTED' ? 'mic' : 'idle')}
                    />
      </div>

                {/* Subtitles / Question */}
                <div className="w-full max-w-3xl text-center space-y-6 min-h-[150px]">
                    {/* AI Output */}
                    <h2 className="text-2xl md:text-3xl font-light text-white leading-snug drop-shadow-lg transition-opacity duration-500">
                        {currentOutputTrans || (transcriptHistory.slice().reverse().find(t => t.speaker === Speaker.AI)?.text)}
                    </h2>

                    {/* User Live Transcript Notice */}
                    <p className="text-sm text-neutral-500 italic opacity-80 min-h-[1.5em]">
                        Ваша транскрипция скрыта для приватности, но система продолжает вас слышать.
                    </p>
                </div>

      </main>

            {/* Footer Controls */}
            <footer className="relative z-10 p-8 flex justify-center">
                {status !== 'DISCONNECTED' ? (
        <button
          onClick={handleEndInterview}
                        className="px-6 py-3 rounded-full bg-neutral-800/80 border border-white/10 hover:bg-red-900/50 hover:border-red-500/50 text-neutral-400 hover:text-red-200 transition-all text-sm font-bold tracking-wider uppercase"
        >
                        End Interview
        </button>
                ) : (
                     <span className="text-neutral-400 animate-pulse">Processing results...</span>
                )}
      </footer>

    </div>
  );
};

export default InterviewScreen;
