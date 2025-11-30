
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { TranscriptEntry, Speaker, Job, ApplicationData, AntiCheatReport } from '../types';
import { finalizeInterview, InterviewState } from '../services/interviewPipeline/pipeline';
import { getQuestionForRoleAndStage } from '../services/interviewPipeline/questionBank';
import LogOutIcon from './icons/StopIcon';

// --- Audio Utils (Adapted from Gemini Live API Docs) ---

// Sound notification when user can start speaking (plays at the beginning)
function playStartSound() {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Gentle "ready" chime - single soft tone
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);

        setTimeout(() => audioCtx.close(), 400);
    } catch (e) {
        // Ignore audio errors
    }
}

// Soft sound when AI starts speaking (very subtle, not annoying)
function playAiStartSound() {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Very soft, short "pop" sound - barely noticeable
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.type = 'sine';

        // Very quiet - just a subtle indicator
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.08);

        setTimeout(() => audioCtx.close(), 150);
    } catch (e) {
        // Ignore audio errors
    }
}

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
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + (value / 255)})`;
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

    // UX: Show "You can speak" indicator and finalized AI subtitle
    const [canSpeak, setCanSpeak] = useState(false);
    const [finalizedAiText, setFinalizedAiText] = useState(""); // Only show after AI finishes speaking

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
    const mixedAudioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    // Compositor for burning subtitles
    const compositorCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const subtitlesRef = useRef({ user: "", ai: "" });

    // Update refs whenever text changes for the compositor loop
    useEffect(() => {
        subtitlesRef.current = {
            user: currentInputTrans,
            ai: isAiSpeaking ? currentOutputTrans : finalizedAiText
        };
    }, [currentInputTrans, currentOutputTrans, finalizedAiText, isAiSpeaking]);

    // Reconnect Refs
    const retryCountRef = useRef(0);
    const isReconnectingRef = useRef(false);
    const isAudioSetupRef = useRef(false);
    const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasPlayedStartSoundRef = useRef(false); // Play start sound only once
    const isManuallyEndingRef = useRef(false); // Flag to prevent reconnect on manual end

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
        // 0. Stop Video Interval & Animation Frame
        if (videoIntervalRef.current) {
            clearInterval(videoIntervalRef.current);
            videoIntervalRef.current = null;
        }
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }

        // 1. Stop ALL Tracks (audio + video)
        if (micStreamRef.current) {
            const tracks = micStreamRef.current.getTracks();
            console.log(`Stopping ${tracks.length} tracks...`);
            tracks.forEach(t => {
                console.log(`Stopping track: ${t.kind} - ${t.label}`);
                t.stop();
            });
            micStreamRef.current = null;
        }

        // 2. Also stop video element's srcObject tracks (in case they're different)
        if (videoRef.current && videoRef.current.srcObject) {
            const videoStream = videoRef.current.srcObject as MediaStream;
            if (videoStream && videoStream.getTracks) {
                videoStream.getTracks().forEach(t => {
                    console.log(`Stopping video element track: ${t.kind} - ${t.label}`);
                    t.stop();
                });
            }
            videoRef.current.srcObject = null;
        }

        // 3. Close Audio Contexts
        if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
            try { inputAudioCtxRef.current.close(); } catch (e) { }
        }
        if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') {
            try { outputAudioCtxRef.current.close(); } catch (e) { }
        }

        // 4. Stop Media Recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (e) { }
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
            // Priority 1: MP4 (Best for QuickTime/macOS)
            if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            }
            // Priority 2: WebM with H264 (Better compatibility than VP8/VP9)
            else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
                mimeType = 'video/webm;codecs=h264';
            }
            // Priority 3: Default WebM (Chrome/Firefox default)
            else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            }
            else {
                mimeType = '';
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

    const startCompositor = useCallback(() => {
        if (!compositorCanvasRef.current || !videoRef.current) return;
        const canvas = compositorCanvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Set recording resolution (HD)
        canvas.width = 1280;
        canvas.height = 720;

        const draw = () => {
            if (!videoRef.current || !ctx) return;

            // 1. Draw Video Frame (Scale to fit)
            // We draw raw video. If we want to mirror it like the preview, we need ctx.scale(-1, 1).
            // Let's record standard unmirrored video (like a webcam feed usually is).
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            // 2. Draw Subtitles
            const { user, ai } = subtitlesRef.current;
            // Show AI text if available, otherwise User text
            const text = ai || user;

            if (text && text.trim()) {
                const fontSize = 24;
                const padding = 20;
                const lineHeight = fontSize + 12;
                ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;

                // Simple text wrapping
                const maxTextWidth = canvas.width - (padding * 4); // Double padding on sides
                const words = text.split(' ');
                let line = '';
                const lines = [];

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxTextWidth && n > 0) {
                        lines.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                // Keep only last 3 lines to not cover too much
                const linesToDraw = lines.slice(-3);

                // Background box
                const boxHeight = (linesToDraw.length * lineHeight) + padding * 2;
                const boxY = canvas.height - boxHeight - 40; // 40px from bottom

                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(20, boxY, canvas.width - 40, boxHeight); // Rounded-ish rect look

                // Draw Text
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                linesToDraw.forEach((l, i) => {
                    const y = boxY + padding + (i * lineHeight) + (lineHeight / 2);
                    ctx.fillText(l.trim(), canvas.width / 2, y);
                });
            }

            animationFrameIdRef.current = requestAnimationFrame(draw);
        };

        draw();

        // Return the capture stream for recording
        return canvas.captureStream(30);
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
                const rms = Math.sqrt(inputData.reduce((s, v) => s + v * v, 0) / inputData.length);
                setIsMicActive(rms > 0.01);
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            // 4. Mix Audio for Recording (Mic + AI)
            // We need to bring Mic audio into the Output Context (where AI audio lives) to mix them
            const mixedDest = outputCtx.createMediaStreamDestination();
            mixedAudioDestRef.current = mixedDest;

            // Add AI Audio to Mix
            outputNode.connect(mixedDest);

            // Add Mic Audio to Mix (Cross-context handling)
            // We create a new source in outputCtx from the mic stream
            const micSourceInOutputCtx = outputCtx.createMediaStreamSource(stream);
            micSourceInOutputCtx.connect(mixedDest);

            // 5. Start Compositor & Recording
            // We want to record the Visuals (Canvas) + Mixed Audio
            const canvasStream = startCompositor();

            if (canvasStream) {
                // Add the mixed audio track to the canvas stream
                const mixedAudioTrack = mixedDest.stream.getAudioTracks()[0];
                if (mixedAudioTrack) {
                    canvasStream.addTrack(mixedAudioTrack);
                }
                startRecording(canvasStream);
            } else {
                // Fallback to just mic + camera if compositor fails (shouldn't happen)
                startRecording(stream);
            }

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

            // Generate Strict Question Plan (RAG) - Extended for 10+ minute interview
            const plan = [
                getQuestionForRoleAndStage(job.title, 'Background', 1) || "Расскажите о себе и своем опыте.",
                getQuestionForRoleAndStage(job.title, 'Background', 2) || "Какой проект вы считаете наиболее значимым?",
                getQuestionForRoleAndStage(job.title, 'Core', 2) || "Какие основные инструменты вы используете?",
                getQuestionForRoleAndStage(job.title, 'Core', 3) || "Углубимся в технические детали.",
                getQuestionForRoleAndStage(job.title, 'Core', 3) || "Расскажите о вашем подходе к решению задач.",
                getQuestionForRoleAndStage(job.title, 'DeepDive', 3) || "Опишите сложную ситуацию из практики.",
                getQuestionForRoleAndStage(job.title, 'DeepDive', 4) || "Расскажите о сложной проблеме, которую вы решили.",
                getQuestionForRoleAndStage(job.title, 'Case', 3) || "Давайте разберем практический кейс.",
                getQuestionForRoleAndStage(job.title, 'Case', 4) || "Представьте ситуацию...",
                getQuestionForRoleAndStage(job.title, 'Debug', 3) || "Как бы вы отладили эту проблему?",
                getQuestionForRoleAndStage(job.title, 'WrapUp', 2) || "Какие у вас есть вопросы?"
            ];

            let systemInstruction = `
ROLE: You are Zarina, an expert interviewer from Wind AI.
Your goal is to UNCOVER THE CANDIDATE'S STRENGTHS.
You are NOT here to "fail" or "trick" the candidate. You are a talent scout looking for reasons to HIRE.

=== CORE PHILOSOPHY ===
1. **Find Strengths**: If the candidate struggles with a topic, don't drill them into the ground. Gently pivot to a related topic where they might shine.
2. **Be a Partner**: Help them formulate their thoughts. If they are nervous, reassure them.
3. **Dig for Gold**: When they mention a success or a skill, ask deep follow-ups to fully reveal their competence.
4. **Goal**: The output of this interview will be used to match them with the best possible company. Your job is to find that match by understanding what they are TRULY good at.

=== CRITICAL EMERGENCY RULE ===
If the candidate says "stop", "finish", "end", "хватит", "закончим", "стоп", "все" (in the context of ending), you MUST IMMEDIATELY:
1. Say goodbye politely (e.g., "Хорошо, завершаем интервью. Спасибо за уделённое время. Всего доброго!").
2. STOP asking any further questions.
This is the HIGHEST PRIORITY rule.

=== CRITICAL LANGUAGE RULE (ABSOLUTE PRIORITY) ===
THE INTERVIEW LANGUAGE IS: ${applicationData.language || 'Russian'}
YOU MUST SPEAK **ONLY** IN ${applicationData.language || 'Russian'} - THIS IS NON-NEGOTIABLE.
- EVERY word you say MUST be in ${applicationData.language || 'Russian'}.
- Do NOT mix languages. Do NOT say even one word in another language.
- If the candidate speaks in a different language, YOU STILL respond in ${applicationData.language || 'Russian'}.
- If language is "English", speak ONLY English. If "Russian", speak ONLY Russian.
- This rule applies to greetings, questions, acknowledgments, and goodbyes.

=== STARTING RULES (CRITICAL - HIGHEST PRIORITY) ===
1. YOU MUST initiate the conversation IMMEDIATELY when you receive a "START NOW" or connection message.
2. DO NOT WAIT for the user to speak first. YOU speak first.
3. Greet the candidate EXACTLY ONCE in ${applicationData.language || 'Russian'}:
   ${applicationData.language === 'English'
                    ? `"Hello! My name is Zarina, I'm from Wind AI. Nice to meet you! Today we'll conduct an interview for the ${job.title} position. How are you feeling? Ready to begin?"`
                    : `"Здравствуйте! Меня зовут Зарина, я из Wind AI. Рада вас видеть! Сегодня мы проведём интервью на позицию ${job.title}. Как ваше настроение? Готовы начать?"`
                }
4. NEVER repeat the greeting. If the connection drops or user says "hello" again, just acknowledge and move to the NEXT question.
5. After greeting, wait for the candidate to respond, then proceed to Phase 1.

=== LISTENING & NOISE RULES ===
1. IGNORE NOISE: If the user input is just noise, silence, or very short/meaningless sounds (like "<noise>", "...", "а", "м"), DO NOT accept it as an answer.
2. Ask for clarification in ${applicationData.language || 'Russian'}: ${applicationData.language === 'English' ? '"Sorry, I didn\'t catch that. Could you repeat?" or "Could you clarify?"' : '"Не расслышала, повторите пожалуйста" or "Можете уточнить?"'}
3. DO NOT acknowledge noise with words like "I see" or "Понятно".
4. **CRITICAL: DO NOT INTERRUPT**.
   - Candidates often pause to think.
   - WAIT at least 5-7 SECONDS of complete silence before assuming they finished.
   - If they say "Umm...", "Well...", "Let me think...", "Give me a second" - WAIT.
   - Better to wait too long than to interrupt their thought process.

=== CONVERSATION STYLE ===
1. Be WARM and ENCOURAGING - smile through your voice.
2. Use VARIED acknowledgments IN ${applicationData.language || 'Russian'} ONLY:
   ${applicationData.language === 'English'
                    ? `- "Uh-huh" (natural)
   - "Okay" (casual)
   - "Got it"
   - "Right"
   - "Interesting"
   - "I see"`
                    : `- "Угу" (natural and good, use freely)
   - "Окей" (casual and friendly)
   - "Хорошо"
   - "Так"
   - "Принято"
   - "Интересно"`
                }
   Avoid saying the SAME word twice in a row.
3. Ask ONE question at a time, then WAIT for a complete answer.

=== INTERVIEW STRUCTURE (15-20 MINUTES TOTAL) ===
Each phase should include follow-up questions based on the candidate's answers.
ALL QUESTIONS AND FOLLOW-UPS MUST BE IN ${applicationData.language || 'Russian'}.

PHASE 1 - WARMUP & BACKGROUND (3-4 min):
Main questions:
- ${plan[0]}
- ${plan[1]}
Follow-up examples (in ${applicationData.language || 'Russian'}): ${applicationData.language === 'English' ? '"Tell me more", "What were the results?", "What was most challenging?"' : '"Расскажите подробнее", "Какие были результаты?", "Что было самым сложным?"'}

PHASE 2 - CORE SKILLS (5-6 min):
Main questions:
- ${plan[2]}
- ${plan[3]}
- ${plan[4]}
Follow-up examples: ${applicationData.language === 'English' ? '"Why that approach?", "Give a specific example", "How did you measure success?"' : '"Почему именно так?", "Приведите конкретный пример", "Как вы измеряли успех?"'}

PHASE 3 - DEEP DIVE (4-5 min):
Main questions:
- ${plan[5]}
- ${plan[6]}
Follow-up examples: ${applicationData.language === 'English' ? '"What if...?", "What would you do differently?", "What alternatives were there?"' : '"А если бы...", "Что бы вы сделали иначе?", "Какие были альтернативы?"'}

PHASE 4 - PRACTICAL CASES (3-4 min):
Main questions:
- ${plan[7]}
- ${plan[8]}
- ${plan[9]}
Follow-up examples: ${applicationData.language === 'English' ? '"How would you handle if...?", "What other options?"' : '"Как бы вы поступили если...", "Какие ещё варианты?"'}

PHASE 5 - WRAP UP (2-3 min):
- ${plan[10]}
- ${applicationData.language === 'English' ? '"Is there anything you\'d like to share that we haven\'t covered?"' : '"Есть ли что-то, о чём вы хотели бы рассказать, но мы не затронули?"'}
- Closing: ${applicationData.language === 'English' ? '"Thank you for your time! It was great talking with you. We\'ll be in touch soon. Goodbye!"' : '"Спасибо за уделённое время! Было очень интересно пообщаться. Мы свяжемся с вами в ближайшее время. Всего доброго!"'}

=== FOLLOW-UP RULES ===
After EVERY answer, ask at least ONE follow-up question IN ${applicationData.language || 'Russian'}:
${applicationData.language === 'English'
                    ? `- "Tell me more about..."
- "What were the specific results?"
- "What challenges did you face?"
- "How did you measure that?"
- "What would you do differently now?"
- "Why did you choose that approach?"`
                    : `- "Расскажите подробнее о..."
- "Какие были конкретные результаты?"
- "С какими трудностями столкнулись?"
- "Как вы это измеряли?"
- "Что бы вы сделали по-другому сейчас?"
- "Почему вы выбрали именно такой подход?"`
                }

=== PACING ===
- Interview MUST last at least 15 minutes.
- Do NOT rush through questions.
- Do NOT end until all 5 phases are covered.

=== ENDING THE INTERVIEW (CRITICAL) ===
1. After you say ${applicationData.language === 'English' ? '"Goodbye!"' : '"Всего доброго!" or "До свидания!"'} - THE INTERVIEW IS OVER.
2. After the closing phrase, you MUST NOT respond to ANY further questions or comments from the candidate.
3. If the candidate asks anything after you said goodbye, respond ONLY with: ${applicationData.language === 'English' ? '"The interview is complete. Thank you!"' : '"Интервью завершено. Спасибо!"'}
4. Do NOT answer general knowledge questions (like building heights, facts, etc.) - you are an INTERVIEWER, not a general assistant.
5. If the candidate tries to continue the conversation after closing, say: ${applicationData.language === 'English' ? '"The interview is complete. Results will be sent to your email."' : '"Интервью завершено. Результаты будут отправлены вам на почту."'}

=== CANDIDATE CONTEXT ===
${resumeContext}
`;

            if (isReconnect && transcriptHistory.length > 0) {
                // Provide context on reconnect with STRICT instruction
                const lastTurns = transcriptHistory.slice(-10).map(t => `${t.speaker}: ${t.text}`).join('\n');
                systemInstruction += `\n\n=== RECONNECTION CONTEXT ===\nThe connection was temporarily lost and has been restored.\nSTRICT RULE: DO NOT GREET THE USER AGAIN. DO NOT SAY "HELLO" OR "HI".\nResume the interview exactly where it left off. If you asked a question, wait for the answer. If the user was speaking, ask them to continue.\n\nRecent conversation history:\n${lastTurns}`;
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

                                // Play start sound ONCE when interview begins
                                if (!hasPlayedStartSoundRef.current) {
                                    hasPlayedStartSoundRef.current = true;
                                    playStartSound();
                                }

                                const startPrompt = `SYSTEM: The user has connected. IMMEDIATELY start the interview in ${applicationData.language || 'English'}. Introduce yourself and ask the first question.`;
                                sessionPromiseRef.current?.then(session => {
                                    console.log("Sending kickstart prompt...");
                                    session.sendRealtimeInput({
                                        content: [{ text: startPrompt }]
                                    });

                                    // Send a second trigger after a short delay to ensure AI responds
                                    setTimeout(() => {
                                        if (!isMountedRef.current) return;
                                        console.log("Sending follow-up trigger...");
                                        session.sendRealtimeInput({
                                            content: [{ text: "START NOW" }]
                                        });
                                    }, 1000);
                                });
                            }, 3000);
                        }
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (!isMountedRef.current) return;
                        // 1. Audio Output
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            // AI started speaking - no sound notification (was annoying)
                            setIsAiSpeaking(true);
                            setCanSpeak(false); // AI is speaking, user should wait
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

                            // Flush AI Transcript if any AND show finalized subtitle
                            setCurrentOutputTrans(currOut => {
                                if (currOut.trim()) {
                                    // Show finalized AI text as subtitle
                                    setFinalizedAiText(currOut.trim());

                                    // Check if AI said goodbye - auto-end interview
                                    const goodbyePhrases = [
                                        'всего доброго',
                                        'до свидания',
                                        'интервью завершено',
                                        'спасибо за уделённое время',
                                        'мы свяжемся с вами',
                                        'goodbye',
                                        'thank you for your time'
                                    ];
                                    const lowerText = currOut.toLowerCase();
                                    const isGoodbye = goodbyePhrases.some(phrase => lowerText.includes(phrase));

                                    if (isGoodbye) {
                                        console.log("[Interview] AI said goodbye, auto-ending interview in 3 seconds...");
                                        // Auto-end interview after AI finishes speaking
                                        setTimeout(() => {
                                            if (isMountedRef.current) {
                                                handleEndInterview();
                                            }
                                        }, 3000); // Wait 3 seconds for audio to finish
                                    }

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

                            // UX: Show "can speak" indicator after AI turn completes
                            setTimeout(() => {
                                if (isMountedRef.current) {
                                    setCanSpeak(true);
                                }
                            }, 500);

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
                        // Only reconnect if not manually ending and component is still mounted
                        if (isMountedRef.current && !isManuallyEndingRef.current && status !== 'DISCONNECTED') {
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
        // Don't reconnect if manually ending interview
        if (isManuallyEndingRef.current || isReconnectingRef.current || status === 'DISCONNECTED') return;

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
        // Mark as manually ending to prevent reconnect attempts
        isManuallyEndingRef.current = true;
        setStatus('DISCONNECTED');

        // Close the Gemini session first to stop AI from responding
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                if (session && session.close) {
                    session.close();
                }
            } catch (e) {
                console.log("Session already closed or error closing:", e);
            }
            sessionPromiseRef.current = null;
        }

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

        // STOP ALL MEDIA HERE (camera, mic, etc.)
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
                else if (curr.a && acc.length > 0) acc[acc.length - 1].a += " " + curr.a;
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

        onEnd(finalTranscript, url, res.summary, res.antiCheat, recordingBlob || undefined);
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

                {/* Status Label with "Can Speak" Indicator */}
                <div className="h-12 flex flex-col items-center justify-center gap-1">
                    {status === 'CONNECTING' && <span className="text-sm text-neutral-500 animate-pulse">CONNECTING TO GEMINI LIVE...</span>}
                    {status === 'RECONNECTING' && <span className="text-sm text-yellow-500 animate-pulse">CONNECTION LOST. RECONNECTING...</span>}
                    {status === 'CONNECTED' && isAiSpeaking && (
                        <>
                            <span className="text-sm text-cyan-400 font-bold tracking-widest">INTERVIEWER SPEAKING</span>
                            <span className="text-xs text-neutral-500">Подождите...</span>
                        </>
                    )}
                    {status === 'CONNECTED' && !isAiSpeaking && canSpeak && (
                        <>
                            <span className="text-sm text-green-400 font-bold tracking-widest animate-pulse">ВАША ОЧЕРЕДЬ</span>
                            <span className="text-xs text-green-300/70">Можете говорить</span>
                        </>
                    )}
                    {status === 'CONNECTED' && !isAiSpeaking && !canSpeak && (
                        <span className="text-sm text-neutral-400 animate-pulse">PROCESSING...</span>
                    )}
                </div>

                {/* The Canvas Visualizer */}
                <div className="relative flex items-center justify-center">
                    <AudioVisualizer
                        analyser={isAiSpeaking ? aiAnalyserRef.current : micAnalyserRef.current}
                        mode={isAiSpeaking ? 'ai' : (status === 'CONNECTED' ? 'mic' : 'idle')}
                    />
                </div>

                {/* Subtitles / Question - Show real-time streaming text */}
                <div className="w-full max-w-3xl text-center space-y-6 min-h-[150px]">
                    {/* AI Output - Show streaming text in real-time */}
                    <h2 className="text-2xl md:text-3xl font-light text-white leading-snug drop-shadow-lg transition-all duration-300">
                        {currentOutputTrans || finalizedAiText || (transcriptHistory.slice().reverse().find(t => t.speaker === Speaker.AI)?.text) || ""}
                    </h2>

                    {/* User Live Transcript Notice */}
                    <p className="text-sm text-neutral-500 italic opacity-80 min-h-[1.5em]">
                        {canSpeak ? "Говорите — система вас слушает" : "Ваша транскрипция скрыта для приватности"}
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

            {/* Hidden Canvas for Recording Compositor */}
            <canvas ref={compositorCanvasRef} className="hidden" />
        </div>
    );
};

export default InterviewScreen;
