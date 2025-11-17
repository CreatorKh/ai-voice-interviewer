import React, { useState, useEffect, useRef, useCallback } from 'react';

import { GoogleGenAI, Modality, Blob as GenAIBlob, LiveServerMessage } from '@google/genai';

import { SYSTEM_PROMPT_TEMPLATE } from '../constants';

import { TranscriptEntry, Speaker, Job, ApplicationData } from '../types';

import { InterviewPipeline } from '../services/interviewPipeline/pipeline';

import { QuestionPlan } from '../services/interviewPipeline/types';

import { LIVE_MODEL_ID } from '../config/models';

import {

  RnnoiseWorkletNode,

  loadRnnoise,

} from '@sapphi-red/web-noise-suppressor';

// Audio helper functions

const decode = (base64: string): Uint8Array => {

  const binaryString = atob(base64);

  const len = binaryString.length;

  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {

    bytes[i] = binaryString.charCodeAt(i);

  }

  return bytes;

};

const encode = (bytes: Uint8Array): string => {

  let binary = '';

  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {

    binary += String.fromCharCode(bytes[i]);

  }

  return btoa(binary);

};

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

const blobToBase64 = (blob: Blob): Promise<string> => {

  return new Promise((resolve) => {

    const reader = new FileReader();

    reader.onloadend = () => {

      resolve((reader.result as string).split(',')[1]);

    };

    reader.readAsDataURL(blob);

  });

};

interface InterviewScreenProps {

  job: Job;

  onEnd: (transcript: TranscriptEntry[], recordingUrl: string) => void;

  applicationData: ApplicationData;

}

const FRAME_RATE = 3; // Reduced from 10 to save bandwidth and reduce API load

const JPEG_QUALITY = 0.7;

const MAX_RETRIES = 10;

// ВАЖНО: файлы должны лежать в public/rnnoise/

const RNNOISE_WORKLET_URL = '/rnnoise/rnnoiseWorklet.js';

const RNNOISE_WASM_URL = '/rnnoise/rnnoise.wasm';

const RNNOISE_SIMD_WASM_URL = '/rnnoise/rnnoise_simd.wasm';

type Status = 'CONNECTING' | 'LISTENING' | 'SPEAKING' | 'THINKING' | 'ENDED' | 'ERROR' | 'RECONNECTING';

const StopIcon = () => (

  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">

    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />

  </svg>

);

const SpeakerIcon = () => (

  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">

    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />

  </svg>

);

const TypingIndicator: React.FC = () => (

  <div className="flex items-center space-x-1 ml-2 self-end mb-0.5" aria-label="Typing">

    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />

    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />

    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />

        </div>

);

const InterviewScreen: React.FC<InterviewScreenProps> = ({ job, onEnd, applicationData }) => {

  const [status, setStatus] = useState<Status>('CONNECTING');

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const [timer, setTimer] = useState(0);

  const statusRef = useRef(status);

  useEffect(() => {

    statusRef.current = status;

  }, [status]);

  const sessionRef = useRef<any | null>(null);

  const isConnectingRef = useRef(false);

  const inputAudioContextRef = useRef<AudioContext | null>(null);

  const outputAudioContextRef = useRef<AudioContext | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const processorRef = useRef<AudioWorkletNode | null>(null);
  const workletLoadedRef = useRef(false);

  const inputTranscriptionBufferRef = useRef('');

  const outputTranscriptionBufferRef = useRef('');

  const nextAudioStartTimeRef = useRef(0);

  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const processedAudioChunksRef = useRef<Set<string>>(new Set());

  const noiseGateAnalyserRef = useRef<AnalyserNode | null>(null);

  const rnnoiseWasmBinaryRef = useRef<ArrayBuffer | null>(null);

  const rnnoiseEnabledRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const frameIntervalRef = useRef<number | null>(null);

  const retryCountRef = useRef(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const recordedChunksRef = useRef<Blob[]>([]);

  const onEndCalledRef = useRef(false);

  // Pipeline refs

  const pipelineRef = useRef<InterviewPipeline | null>(null);

  const currentQuestionPlanRef = useRef<QuestionPlan | null>(null);

  const questionStartTimeRef = useRef<number>(0);

  const answerStartTimeRef = useRef<number>(0);

  const currentQuestionRef = useRef<string>('');

  const finalTranscript = useRef(transcript);

  // Prevent double processing of turns
  const turnEvalInProgressRef = useRef(false);
  const nextQuestionInProgressRef = useRef(false);

  useEffect(() => {

    finalTranscript.current = transcript;

  }, [transcript]);

  const stopInterviewFlow = useCallback((isComplete: boolean) => {

    if (isComplete) {

      if (frameIntervalRef.current) {

        clearInterval(frameIntervalRef.current);

        frameIntervalRef.current = null;

      }

      if (sessionRef.current) {

        try {

          if (sessionRef.current && typeof sessionRef.current.close === 'function') {

            sessionRef.current.close();

          }

        } catch (error) {

          console.warn('Error closing session:', error);

        }

        sessionRef.current = null;

      }

      isConnectingRef.current = false;

      if (streamRef.current) {

        streamRef.current.getTracks().forEach((track) => track.stop());

        streamRef.current = null;

      }

      if (processorRef.current) {

        processorRef.current.disconnect();

        processorRef.current = null;

      }

      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {

        inputAudioContextRef.current.close();

      }

      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {

        audioSourcesRef.current.forEach((source) => source.stop());

        audioSourcesRef.current.clear();

        outputAudioContextRef.current.close();

      }

      processedAudioChunksRef.current.clear();

      setStatus('ENDED');

    } else {

      if (frameIntervalRef.current) {

        clearInterval(frameIntervalRef.current);

    frameIntervalRef.current = null;

      }

    if (sessionRef.current) {

        try {

          if (sessionRef.current && typeof sessionRef.current.close === 'function') {

        sessionRef.current.close();

          }

        } catch (error) {

          console.warn('Error closing session during reconnection:', error);

        }

        sessionRef.current = null;

    }

      isConnectingRef.current = false;

    if (processorRef.current) {

        processorRef.current.disconnect();

        processorRef.current = null;

      }

      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {

        inputAudioContextRef.current.close();

        inputAudioContextRef.current = null;

      }

      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {

        audioSourcesRef.current.forEach((source) => source.stop());

        audioSourcesRef.current.clear();

        outputAudioContextRef.current.close();

        outputAudioContextRef.current = null;

      }

      processedAudioChunksRef.current.clear();

    }

  }, []);

  const handleEndInterview = useCallback(() => {

    if (onEndCalledRef.current) {

      console.warn('onEnd already called, skipping duplicate call from handleEndInterview');

      return;

    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {

      mediaRecorderRef.current.stop();

    } else {

      if (!onEndCalledRef.current) {

        onEndCalledRef.current = true;

        stopInterviewFlow(true);

        const pipelineState = pipelineRef.current?.getState();
        onEnd(finalTranscript.current, '', pipelineState);

      }

    }

  }, [stopInterviewFlow, onEnd]);

  const floatTo16BitPCM = (input: Float32Array): Int16Array => {

    const output = new Int16Array(input.length);

    for (let i = 0; i < input.length; i++) {

      const s = Math.max(-1, Math.min(1, input[i]));

      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;

    }

    return output;

  };

  // Resample audio to target sample rate (linear interpolation)
  const resampleAudio = (input: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array => {
    if (inputSampleRate === outputSampleRate) {
      return input;
    }
    const ratio = inputSampleRate / outputSampleRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
      const t = srcIndex - srcIndexFloor;
      output[i] = input[srcIndexFloor] * (1 - t) + input[srcIndexCeil] * t;
    }
    return output;
  };

  const startInterview = useCallback(async () => {

    if (isConnectingRef.current || sessionRef.current) {

      console.log('Connection already in progress or established, skipping...');

      return;

    }

    isConnectingRef.current = true;

    try {

      // Get raw stream WITHOUT browser processing (RNNoise will handle it)
      const stream = await navigator.mediaDevices.getUserMedia({

        audio: {

          channelCount: 1,

          sampleRate: 48000, // RNNoise expects 48kHz

          noiseSuppression: false, // Disabled - RNNoise will handle

          echoCancellation: false, // Disabled - RNNoise will handle

          autoGainControl: false, // Disabled - we'll add gain control after RNNoise

        },

        video: true,

      });

      streamRef.current = stream;

      if (videoRef.current) {

        videoRef.current.srcObject = stream;

      }

      if (retryCountRef.current === 0) {

        recordedChunksRef.current = [];

        onEndCalledRef.current = false;

        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

        mediaRecorderRef.current.ondataavailable = (event) => {

          if (event.data.size > 0) recordedChunksRef.current.push(event.data);

        };

        mediaRecorderRef.current.onstop = () => {

          if (onEndCalledRef.current) {

            console.warn('onEnd already called, skipping duplicate call from onstop');

            return;

          }

          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

          const url = URL.createObjectURL(blob);

          stopInterviewFlow(true);

          onEndCalledRef.current = true;

          const pipelineState = pipelineRef.current?.getState();
          onEnd(finalTranscript.current, url, pipelineState);

        };

        mediaRecorderRef.current.start();

    } else {

        onEndCalledRef.current = false;

      }

      // RNNoise works best at 48kHz, we'll resample to 16kHz for Gemini
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({

        sampleRate: 48000, // RNNoise expects 48kHz

      });

      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({

        sampleRate: 24000,

      });

      // RNNoise init (локальные файлы + fallback)

      rnnoiseEnabledRef.current = false;

      rnnoiseWasmBinaryRef.current = null;

      try {

        const wasmBinary = await loadRnnoise({

          url: RNNOISE_WASM_URL,

          simdUrl: RNNOISE_SIMD_WASM_URL,

        });

        rnnoiseWasmBinaryRef.current = wasmBinary;

        await inputAudioContextRef.current!.audioWorklet.addModule(RNNOISE_WORKLET_URL);

        rnnoiseEnabledRef.current = true;

        console.log('RNNoise initialized');

      } catch (err) {

        console.warn('RNNoise init failed, using fallback chain without RNNoise:', err);

        rnnoiseEnabledRef.current = false;

      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      let reconnectPromptAddition = '';

      if (retryCountRef.current > 0 && finalTranscript.current.length > 0) {

        const historyText = finalTranscript.current.map((t) => `${t.speaker}: ${t.text}`).join('\n');

        reconnectPromptAddition = `



---



IMPORTANT: The connection was just re-established. Please resume the interview based on the transcript so far. Do not greet the user again, just continue with the next logical question.



TRANSCRIPT:

${historyText}

---`;

      }

      if (!pipelineRef.current) {

        const systemPrompt = SYSTEM_PROMPT_TEMPLATE

          .replace(/{CANDIDATE_NAME}/g, applicationData.name)

          .replace(/{ROLE}/g, job.title)

          .replace(/{LANGUAGE}/g, applicationData.language);

        pipelineRef.current = new InterviewPipeline(process.env.API_KEY as string, systemPrompt, applicationData.parsedSkills || []);

      }

      const nextQuestionPlan = await pipelineRef.current.generateNextQuestion(

        job.title,

        applicationData.name,

        applicationData.language,

      );

      currentQuestionPlanRef.current = {

        topic: nextQuestionPlan.metadata.topic,

        questionType: nextQuestionPlan.metadata.type as any,

        depth: 'medium',

        goal: 'Explore candidate knowledge',

      };

      currentQuestionRef.current = nextQuestionPlan.question;

      questionStartTimeRef.current = Date.now();

      // Get pipeline state safely (after generateNextQuestion)
      const pipelineState = pipelineRef.current?.getState();

      // Safe access to pipeline state properties
      const discoveredStrengths = Array.isArray(pipelineState?.discoveredStrengths)
        ? pipelineState.discoveredStrengths
        : [];

      const skillProfile = pipelineState?.skillProfile;
      // skillProfile is an array of SkillScore in new pipeline
      const topSkills = Array.isArray(skillProfile)
        ? skillProfile.slice(0, 3)
        : [];

      const pipelineContext = `

      

Current Interview Context:

- Questions asked: ${pipelineState?.questionsAsked ?? 0} / ${pipelineState?.totalQuestions ?? 10}

- Interview phase: ${pipelineState?.interviewPhase ?? 'initial'}

- Discovered strengths: ${
        discoveredStrengths.length
          ? discoveredStrengths.join(', ')
          : 'None yet'
      }

- Top skills: ${
        topSkills.length
          ? topSkills.map((s: any) => `${s.name} (${s.level ?? 50})`).join(', ')
          : 'None yet'
      }



Next question focus: ${nextQuestionPlan?.metadata?.topic ?? 'general'}

Question type: ${nextQuestionPlan?.metadata?.type ?? 'general'}

`;

      const systemInstruction =

        SYSTEM_PROMPT_TEMPLATE.replace(/{CANDIDATE_NAME}/g, applicationData.name)

          .replace(/{ROLE}/g, job.title)

          .replace(/{LANGUAGE}/g, applicationData.language) +

        reconnectPromptAddition +

        pipelineContext;
      
      const sessionPromise = ai.live.connect({

        model: LIVE_MODEL_ID,

        config: {

          responseModalities: [Modality.AUDIO],

          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },

          systemInstruction,

          inputAudioTranscription: {},

          outputAudioTranscription: {},

        },

        callbacks: {

          onopen: async () => {

            isConnectingRef.current = false;

            const wasReconnecting = statusRef.current === 'RECONNECTING' || retryCountRef.current > 0;

            setStatus('LISTENING');

            retryCountRef.current = 0;

            if (wasReconnecting) {

              onEndCalledRef.current = false;

            }

            if (finalTranscript.current.length === 0) {

              const silence = new Float32Array(4096).fill(0);

              const silentPcmBlob: GenAIBlob = {

                  data: encode(new Uint8Array(floatTo16BitPCM(silence).buffer)),

                  mimeType: 'audio/pcm;rate=16000',

              };

              sessionPromise

                .then((session) => {

                  if (session && sessionRef.current === session) {

                    try {

                      session.sendRealtimeInput({ media: silentPcmBlob });

                    } catch (error) {

                      console.warn('Failed to send silence burst:', error);

                    }

                  }

                })

                .catch((error) => {

                  console.warn('Session promise rejected when sending silence:', error);

                });

            }

            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);

            // Пытаемся использовать AudioWorklet (современный API), fallback на ScriptProcessorNode
            let audioProcessor: AudioNode;
            try {
              if (!workletLoadedRef.current) {
                // Пробуем разные пути для AudioWorklet
                const workletPaths = [
                  '/audio-processor-worklet.js',
                  './audio-processor-worklet.js',
                  new URL('/audio-processor-worklet.js', window.location.href).href,
                ];
                
                let workletLoaded = false;
                for (const path of workletPaths) {
                  try {
                    await inputAudioContextRef.current!.audioWorklet.addModule(path);
                    workletLoaded = true;
                    console.log(`[AudioWorklet] Successfully loaded from: ${path}`);
                    break;
                  } catch (pathErr) {
                    console.warn(`[AudioWorklet] Failed to load from ${path}:`, pathErr);
                  }
                }
                
                if (!workletLoaded) {
                  throw new Error('Failed to load AudioWorklet from all attempted paths');
                }
                
                workletLoadedRef.current = true;
              }
              const workletNode = new AudioWorkletNode(inputAudioContextRef.current!, 'audio-processor-worklet');
              processorRef.current = workletNode;
              audioProcessor = workletNode;
              console.log('[AudioWorklet] AudioWorkletNode created successfully');
            } catch (err) {
              console.warn('[AudioWorklet] AudioWorklet not available, using ScriptProcessorNode (deprecated):', err);
              // Fallback на ScriptProcessorNode для совместимости
              const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
              processorRef.current = scriptProcessor as any;
              audioProcessor = scriptProcessor;
              console.log('[AudioWorklet] Using ScriptProcessorNode fallback');
            }
            
            // Сохраняем ссылку для последующего использования
            const audioProcessorRef = audioProcessor;

            const analyser = inputAudioContextRef.current!.createAnalyser();

            analyser.fftSize = 512;

            analyser.smoothingTimeConstant = 0.3;

            noiseGateAnalyserRef.current = analyser;

            const highPassFilter = inputAudioContextRef.current!.createBiquadFilter();

            highPassFilter.type = 'highpass';

            highPassFilter.frequency.value = 100;

            const lowPassFilter = inputAudioContextRef.current!.createBiquadFilter();

            lowPassFilter.type = 'lowpass';

            lowPassFilter.frequency.value = 7000;

            const compressor = inputAudioContextRef.current!.createDynamicsCompressor();

            compressor.threshold.value = -50;

            compressor.knee.value = 40;

            compressor.ratio.value = 12;

            compressor.attack.value = 0.003;

            compressor.release.value = 0.25;

            const gainNode = inputAudioContextRef.current!.createGain();

            gainNode.gain.value = 1.5;

            let processedSource: AudioNode = source;

            if (rnnoiseEnabledRef.current && rnnoiseWasmBinaryRef.current) {

              try {

                const rnnoiseNode = new RnnoiseWorkletNode(inputAudioContextRef.current!, {

                  maxChannels: 1,

                  wasmBinary: rnnoiseWasmBinaryRef.current,

                });

                source.connect(analyser); // визуализация на чистом сигнале после mic

                source.connect(rnnoiseNode);

                processedSource = rnnoiseNode;

              } catch (err) {

                console.warn('Failed to create RNNoise node, continuing without it:', err);

                processedSource = source;

                source.connect(analyser);

              }

            } else {

              source.connect(analyser);

              processedSource = source;

            }

            processedSource.connect(highPassFilter);

            highPassFilter.connect(lowPassFilter);

            lowPassFilter.connect(compressor);

            compressor.connect(gainNode);

            gainNode.connect(audioProcessor);
            
            // Обработка аудио данных
            const handleAudioData = (inputData: Float32Array) => {

              if (!sessionRef.current || statusRef.current === 'ENDED') {

                return;

              }

              // Improved VAD gate after RNNoise
              let energy = 0;
              let peakEnergy = 0;
              let zeroCrossings = 0;

              for (let i = 0; i < inputData.length; i++) {

                const s = inputData[i];

                const a = Math.abs(s);

                energy += a * a;

                if (a > peakEnergy) peakEnergy = a;

                // Zero crossing rate (voice has more crossings than noise)
                if (i > 0 && (inputData[i] >= 0) !== (inputData[i - 1] >= 0)) {
                  zeroCrossings++;
                }

              }

              const rms = Math.sqrt(energy / inputData.length);
              const zcr = zeroCrossings / inputData.length;

              // Adaptive thresholds - more lenient after RNNoise
              const MIN_RMS = 0.008; // Lower threshold since RNNoise already cleaned
              const MIN_PEAK = 0.03;
              const MIN_ZCR = 0.01; // Voice typically has higher ZCR

              const isVoice = rms > MIN_RMS && peakEnergy > MIN_PEAK && zcr > MIN_ZCR;

              if (!isVoice) {

                return; // Gate closed - silence

              }

              // Resample from 48kHz to 16kHz for Gemini
              const resampledData = resampleAudio(inputData, 48000, 16000);
              
              const pcm16 = floatTo16BitPCM(resampledData);

              const pcmBlob: GenAIBlob = {

                data: encode(new Uint8Array(pcm16.buffer)),

                mimeType: 'audio/pcm;rate=16000',

              };

              sessionPromise

                .then((session) => {

                  if (session && sessionRef.current === session && statusRef.current !== 'ENDED') {

                    try {

                      session.sendRealtimeInput({ media: pcmBlob });

                    } catch (error) {

                      if (

                        error instanceof Error &&

                        !error.message.includes('CLOSING') &&

                        !error.message.includes('CLOSED')

                      ) {

                        console.warn('Failed to send audio input:', error);

                      }

                    }

                  }

                })

                .catch((error) => {

                  if (statusRef.current !== 'ENDED') {

                    console.warn('Session promise rejected when sending audio:', error);

                  }

                });

            };

            // Подключаем обработчики в зависимости от типа процессора
            if (processorRef.current instanceof AudioWorkletNode) {
              // AudioWorkletNode - используем port.onmessage
              processorRef.current.port.onmessage = (event) => {
                if (event.data.type === 'audioData') {
                  handleAudioData(event.data.data);
                }
              };
            } else {
              // ScriptProcessorNode - используем onaudioprocess (fallback)
              (processorRef.current as any).onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                handleAudioData(inputData);
              };
            }
            
            const muteNode = inputAudioContextRef.current!.createGain();

            muteNode.gain.value = 0;

            audioProcessorRef.connect(muteNode);

            muteNode.connect(inputAudioContextRef.current!.destination);
            
            if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);

            frameIntervalRef.current = window.setInterval(() => {

              if (!sessionRef.current || statusRef.current === 'ENDED') {

                return;

              }

              if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {

                const videoEl = videoRef.current;

                const canvasEl = canvasRef.current;

                const ctx = canvasEl.getContext('2d');

                    if (!ctx) return;
                    
                canvasEl.width = videoEl.videoWidth;

                canvasEl.height = videoEl.videoHeight;

                ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);

                canvasEl.toBlob(

                        async (blob) => {

                    if (blob && sessionRef.current && statusRef.current !== 'ENDED') {

                                const base64Data = await blobToBase64(blob);

                      sessionPromise

                        .then((session) => {

                          if (session && sessionRef.current === session && statusRef.current !== 'ENDED') {

                            try {

                              session.sendRealtimeInput({

                                media: { data: base64Data, mimeType: 'image/jpeg' },

                              });

                            } catch (error) {

                              if (

                                error instanceof Error &&

                                !error.message.includes('CLOSING') &&

                                !error.message.includes('CLOSED')

                              ) {

                                console.warn('Failed to send video frame:', error);

                              }

                            }

                          }

                        })

                        .catch((error) => {

                          if (statusRef.current !== 'ENDED') {

                            console.warn('Session promise rejected when sending video:', error);

                          }

                        });

                    }

                  },

                  'image/jpeg',

                  JPEG_QUALITY,

                );

              }

            }, 1000 / FRAME_RATE);

          },

          onmessage: async (message: LiveServerMessage) => {

             if (message.serverContent?.inputTranscription) {

              const newText = message.serverContent.inputTranscription.text;

              if (newText && answerStartTimeRef.current === 0) {

                answerStartTimeRef.current = Date.now();

              }

              if (newText && !inputTranscriptionBufferRef.current.includes(newText)) {

                inputTranscriptionBufferRef.current += newText;

                setTranscript((prev) => {

                const last = prev[prev.length - 1];

                if (last?.speaker === Speaker.USER && !last.isFinal) {

                  return [...prev.slice(0, -1), { ...last, text: inputTranscriptionBufferRef.current }];

                  }

                  return [

                    ...prev,

                    { speaker: Speaker.USER, text: inputTranscriptionBufferRef.current, isFinal: false },

                  ];

                });

              }

            }

            if (message.serverContent?.outputTranscription) {

              const newText = message.serverContent.outputTranscription.text;

              if (newText && questionStartTimeRef.current === 0) {

                questionStartTimeRef.current = Date.now();

                answerStartTimeRef.current = 0;

              }

              if (newText && !outputTranscriptionBufferRef.current.includes(newText)) {

              setStatus('SPEAKING');

                outputTranscriptionBufferRef.current += newText;

                setTranscript((prev) => {

                const last = prev[prev.length - 1];

                if (last?.speaker === Speaker.AI && !last.isFinal) {

                    return [...prev.slice(0, -1), { ...last, text: outputTranscriptionBufferRef.current }];

                }

                return [...prev, { speaker: Speaker.AI, text: outputTranscriptionBufferRef.current, isFinal: false }];

              });

            }

            }

            if (message.serverContent?.turnComplete) {

              setTranscript((prev) => prev.map((entry) => ({ ...entry, isFinal: true })));

              const userAnswer = inputTranscriptionBufferRef.current.trim();

              const aiQuestion = outputTranscriptionBufferRef.current.trim() || currentQuestionRef.current;

              if (userAnswer && pipelineRef.current && currentQuestionPlanRef.current) {

                const responseTime =

                  answerStartTimeRef.current > 0

                    ? answerStartTimeRef.current - questionStartTimeRef.current

                    : 0;

                const answerDuration = Date.now() - (answerStartTimeRef.current || Date.now());

                // Prevent double processing
                if (turnEvalInProgressRef.current) {
                  console.log('[Pipeline] Turn evaluation already in progress, skipping...');
                  return;
                }

                turnEvalInProgressRef.current = true;

                pipelineRef.current

                  .processAnswer(aiQuestion, userAnswer, currentQuestionPlanRef.current, responseTime, answerDuration)

                  .then((evaluation) => {

                    console.log('[Pipeline] Answer evaluated:', evaluation);

                  })

                  .catch((error) => {

                    console.error('[Pipeline] Error processing answer:', error);

                  })

                  .finally(() => {

                    turnEvalInProgressRef.current = false;

                  });

                // Prevent double next question generation
                if (nextQuestionInProgressRef.current) {
                  console.log('[Pipeline] Next question generation already in progress, skipping...');
                  return;
                }

                nextQuestionInProgressRef.current = true;

                pipelineRef.current

                  .generateNextQuestion(job.title, applicationData.name, applicationData.language)

                  .then((nextPlan) => {

                    currentQuestionPlanRef.current = {

                      topic: nextPlan.metadata.topic,

                      questionType: nextPlan.metadata.type as any,

                      depth: 'medium',

                      goal: 'Explore candidate knowledge',

                    };

                    currentQuestionRef.current = nextPlan.question;

                    questionStartTimeRef.current = Date.now();

                    answerStartTimeRef.current = 0;

                  })

                  .catch((error) => {

                    console.error('[Pipeline] Error generating next question:', error);

                  })

                  .finally(() => {

                    nextQuestionInProgressRef.current = false;

                  });

              }

                inputTranscriptionBufferRef.current = '';

                outputTranscriptionBufferRef.current = '';

              if (statusRef.current === 'SPEAKING') setStatus('LISTENING');

            }

            const modelTurn = message.serverContent?.modelTurn;

            const base64Audio = modelTurn?.parts?.[0]?.inlineData?.data;

            if (base64Audio && outputAudioContextRef.current) {

              const audioHash = `${base64Audio.substring(0, 100)}_${base64Audio.length}`;

              if (processedAudioChunksRef.current.has(audioHash)) {

                console.log('Skipping duplicate audio chunk');

                return;

              }

              processedAudioChunksRef.current.add(audioHash);

              if (processedAudioChunksRef.current.size > 50) {

                const firstHash = Array.from(processedAudioChunksRef.current)[0];

                processedAudioChunksRef.current.delete(firstHash);

              }

              try {

                const audioBuffer = await decodeAudioData(

                  decode(base64Audio),

                  outputAudioContextRef.current,

                  24000,

                  1,

                );

                if (!audioBuffer || audioBuffer.length === 0) {

                  processedAudioChunksRef.current.delete(audioHash);

                  return;

                }

                const source = outputAudioContextRef.current.createBufferSource();

                source.buffer = audioBuffer;

                source.connect(outputAudioContextRef.current.destination);
                
                const currentTime = outputAudioContextRef.current.currentTime;

                nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, currentTime);
                
                source.start(nextAudioStartTimeRef.current);

                nextAudioStartTimeRef.current += audioBuffer.duration;

                audioSourcesRef.current.add(source);

                source.onended = () => {

                  audioSourcesRef.current.delete(source);

                  setTimeout(() => {

                    processedAudioChunksRef.current.delete(audioHash);

                  }, 2000);

                };

                // @ts-ignore

                source.onerror = () => {

                  audioSourcesRef.current.delete(source);

                  processedAudioChunksRef.current.delete(audioHash);

                };

              } catch (error) {

                console.error('Error decoding/playing audio:', error);

                processedAudioChunksRef.current.delete(audioHash);

              }

            }

          },

          onerror: (e: ErrorEvent) => {

            console.error('Session error:', e);

            isConnectingRef.current = false;

            if (statusRef.current !== 'ENDED' && statusRef.current !== 'RECONNECTING') {

              console.log('Connection error, will attempt to reconnect...');

              setStatus('RECONNECTING');

            }

          },

          onclose: () => {

            console.log('Session closed');

            isConnectingRef.current = false;

            if (statusRef.current !== 'ENDED' && statusRef.current !== 'RECONNECTING') {

              console.log('Connection closed, will attempt to reconnect...');

              setStatus('RECONNECTING');

            }

          },

        },

      });

      sessionRef.current = await sessionPromise;

      isConnectingRef.current = false;

    } catch (error) {

      console.error('Failed to start interview:', error);

      isConnectingRef.current = false;

      if (statusRef.current !== 'ENDED' && statusRef.current !== 'RECONNECTING') {

        console.log('Failed to start, will attempt to reconnect...');

        setStatus('RECONNECTING');

      }

    }

  }, [job.title, onEnd, applicationData.name, applicationData.language, stopInterviewFlow]);
  
  useEffect(() => {

    if (status === 'RECONNECTING') {

      stopInterviewFlow(false);

      if (retryCountRef.current < MAX_RETRIES) {

        retryCountRef.current++;

        const delay = 1000 * Math.pow(2, retryCountRef.current - 1);

        const timer = setTimeout(() => startInterview(), delay);

        return () => clearTimeout(timer);

      } else {

        setStatus('ERROR');

        handleEndInterview();

      }

    }

  }, [status, startInterview, stopInterviewFlow, handleEndInterview]);
  
  useEffect(() => {

    startInterview();

    const intervalId = setInterval(() => setTimer((t) => t + 1), 1000);

    return () => {

      clearInterval(intervalId);

      stopInterviewFlow(true);

    };

  }, [startInterview, stopInterviewFlow]);

  const formatTime = (seconds: number) =>

    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const getStatusIndicator = () => {

    switch (status) {

      case 'CONNECTING':

        return { text: 'Connecting...', color: 'bg-yellow-500' };

      case 'RECONNECTING':

        return { text: `Reconnecting (${retryCountRef.current})...`, color: 'bg-orange-500' };

      case 'LISTENING':

        return { text: 'Listening...', color: 'bg-green-500' };

      case 'SPEAKING':

        return { text: 'AI is Speaking...', color: 'bg-cyan-500' };

      case 'THINKING':

        return { text: 'Thinking...', color: 'bg-indigo-500' };

      case 'ENDED':

        return { text: 'Interview Ended', color: 'bg-neutral-500' };

      case 'ERROR':

        return { text: 'Connection Error', color: 'bg-red-500' };

      default:

        return { text: 'Initializing...', color: 'bg-neutral-500' };

    }

  };

  const { text: statusText, color: statusColor } = getStatusIndicator();

  return (

    <div className="bg-neutral-900 rounded-2xl shadow-2xl border border-white/10 w-full h-[80vh] flex flex-col">

       <div className="relative w-full aspect-video bg-black rounded-t-2xl overflow-hidden">

        <video

          ref={videoRef}

          autoPlay

          muted

          playsInline

          className="w-full h-full object-cover"

          style={{ transform: 'scaleX(-1)' }}

        />

        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />

        <header className="absolute bottom-0 left-0 w-full flex justify-between items-end p-4 text-white">

          <h2 className="text-xl font-bold">{job.title} Interview</h2>

          <div className="flex items-center space-x-4">

              <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm p-2 rounded-lg">

              <div

                className={`w-3 h-3 rounded-full ${statusColor} ${

                  status !== 'ENDED' && status !== 'ERROR' ? 'animate-pulse' : ''

                }`}

              ></div>

                  <span className="text-sm">{statusText}</span>

              </div>

            <div className="bg-black/30 backdrop-blur-sm font-mono text-lg px-3 py-1 rounded-lg">

              {formatTime(timer)}

          </div>

          </div>

        </header>

      </div>

      <main className="flex-grow overflow-y-auto p-4 pr-2">

        {/* Баннер о деградации LLM */}
        {pipelineRef.current?.getState()?.hasLLMDegraded && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-400 flex items-center gap-2">
              <span>⚠</span>
              <span>LLM перегружен / квота ограничена. Оценка и вопросы частично строятся локально, без глубокого анализа.</span>
            </p>
          </div>
        )}

        <div className="space-y-6">

          {transcript.map((entry, index) => (

            <div

              key={index}

              className={`flex items-start gap-3 ${entry.speaker === Speaker.USER ? 'justify-end' : ''}`}

            >

              {entry.speaker === Speaker.AI && (

                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 grid place-items-center">

                  <SpeakerIcon />

                </div>

              )}

              <div

                className={`max-w-xl p-4 rounded-2xl ${

                  entry.speaker === Speaker.AI ? 'bg-neutral-800 rounded-tl-none' : 'bg-cyan-600 text-white rounded-br-none'

                }`}

              >

                <p className="font-bold text-sm mb-1 opacity-80">{entry.speaker}</p>

                <div className="flex items-end">

                  <p className={`text-base ${entry.isFinal ? '' : 'opacity-70'}`}>

                    {entry.text || '\u200B'}

                  </p>

                  {!entry.isFinal && <TypingIndicator />}

                </div>

              </div>

            </div>

          ))}

        </div>

      </main>

      <footer className="p-4 border-t border-white/10 flex justify-center">

        <button

          onClick={handleEndInterview}

          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full flex items-center space-x-2 transition-transform transform hover:scale-105"

        >

          <StopIcon />

          <span>End Interview</span>

        </button>

      </footer>

      <canvas ref={canvasRef} className="hidden"></canvas>

    </div>

  );

};

export default InterviewScreen;
