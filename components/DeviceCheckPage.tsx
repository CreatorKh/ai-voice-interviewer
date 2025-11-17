import React, { useState, useEffect, useRef } from 'react';
import { Job, AppRoute, ApplicationData } from '../types';
import Button from './Button';
import Stepper from './Stepper';

interface DeviceCheckPageProps {
  job: Job;
  setRoute: (r: AppRoute) => void;
  applicationData: ApplicationData;
}

const DeviceCheckPage: React.FC<DeviceCheckPageProps> = ({ job, setRoute, applicationData }) => {
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [camId, setCamId] = useState("");
  const [micId, setMicId] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // FIX: Initialize useRef with null for consistency and to avoid potential issues with falsy values like 0.
  const animationFrameRef = useRef<number | null>(null);

  const stopStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // FIX: Changed the check to handle the case where animationFrameRef.current could be 0, which is a valid ID.
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    setMicLevel(0);
  };

  const setupDevices = async () => {
    stopStreams();
    setError(null);
    try {
      // Request permissions and get initial stream
      const initialStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
        video: true
      });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      setCams(videoDevices);
      setMics(audioDevices);

      const currentCamId = camId || videoDevices[0]?.deviceId;
      const currentMicId = micId || audioDevices[0]?.deviceId;
      if (currentCamId) setCamId(currentCamId);
      if (currentMicId) setMicId(currentMicId);
      
      // Stop initial permissive stream before creating specific ones
      initialStream.getTracks().forEach(track => track.stop());

      // Start specific streams
      if(currentCamId || currentMicId) {
          const newStream = await navigator.mediaDevices.getUserMedia({ 
              video: currentCamId ? { deviceId: { exact: currentCamId } } : false,
              audio: currentMicId ? {
                deviceId: { exact: currentMicId },
                noiseSuppression: true,
                echoCancellation: true,
                autoGainControl: true,
              } : false,
          });
          streamRef.current = newStream;
          if (videoRef.current) videoRef.current.srcObject = newStream;
          if (currentMicId) setupMicVisualizer(newStream);
      }
    } catch (err) {
      console.error(err);
      setError("Could not access camera or microphone. Please check browser permissions.");
    }
  };

  const setupMicVisualizer = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    // Create audio processing nodes for a cleaner signal in the visualizer.
    const highPassFilter = audioContext.createBiquadFilter();
    highPassFilter.type = 'highpass';
    highPassFilter.frequency.value = 100;

    const lowPassFilter = audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 7000;
    
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1.5;

    // Connect the audio graph: source -> filters -> compressor -> gain -> analyser
    source.connect(highPassFilter);
    highPassFilter.connect(lowPassFilter);
    lowPassFilter.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(analyser);

    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setMicLevel(avg / 255);
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  useEffect(() => {
    setupDevices();
    return () => stopStreams();
  }, [camId, micId]); // Re-run when user changes device selection

  return (
    <div className="grid lg:grid-cols-[1fr,360px] gap-8">
      <div>
        <h1 className="text-2xl font-bold">Device Check</h1>
        <p className="text-sm text-neutral-400 mt-1">Let's make sure your camera and microphone are ready.</p>

        <div className="mt-4 aspect-video rounded-2xl border border-white/10 bg-black overflow-hidden grid place-items-center">
          <video ref={videoRef} className="w-full h-full object-cover" muted autoPlay playsInline style={{ transform: 'scaleX(-1)' }} />
          {error && <div className="absolute text-center p-4 text-red-400 text-sm bg-black/50 rounded-lg">{error}</div>}
        </div>

        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <select value={camId} onChange={e => setCamId(e.target.value)} className="rounded-lg bg-white/[0.05] border border-white/10 px-3 py-2 text-sm">
            {cams.length === 0 ? <option>No cameras found</option> : cams.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${cams.indexOf(d) + 1}`}</option>)}
          </select>
          <select value={micId} onChange={e => setMicId(e.target.value)} className="rounded-lg bg-white/[0.05] border border-white/10 px-3 py-2 text-sm">
            {mics.length === 0 ? <option>No microphones found</option> : mics.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${mics.indexOf(d) + 1}`}</option>)}
          </select>
        </div>
        <div className="mt-2 text-sm font-semibold opacity-80 mb-2">Microphone Level</div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-cyan-400 transition-all" style={{width: `${Math.round(micLevel * 100)}%`}}/></div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold opacity-80 mb-3">Application Progress</h3>
          <Stepper current={2}/>
           <ul className="mt-4 text-sm space-y-2 text-neutral-300">
            <li className="opacity-60">1. Basic Information</li>
            <li className="font-semibold text-white">2. Device Check</li>
            <li className="opacity-60">3. AI Interview</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-sm font-semibold opacity-80 mb-2">Before you start...</h3>
          <ul className="text-sm text-neutral-300 list-disc pl-4 space-y-2">
            <li>Find a quiet, well-lit space.</li>
            <li>The interview will take about 20 minutes.</li>
            <li>Be ready to discuss your experience in detail.</li>
          </ul>
          <Button disabled={!!error || !camId || !micId} className="w-full mt-4" onClick={() => setRoute({name: "interviewLive", jobId: job.id, applicationData})}>
            {error ? 'Permissions Needed' : 'Start Interview'}
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default DeviceCheckPage;