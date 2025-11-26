
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
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    setMicLevel(0);
  };

  const setupDevices = async () => {
    stopStreams();
    setError(null);
    try {
      // Request permission first - removed noise constraints
      const initialStream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: false, echoCancellation: false, autoGainControl: false },
        video: true
      });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      setCams(videoDevices);
      setMics(audioDevices);

      // Use saved preferences or defaults
      const savedCam = localStorage.getItem('preferredCamId');
      const savedMic = localStorage.getItem('preferredMicId');

      const currentCamId = camId || (videoDevices.find(d => d.deviceId === savedCam)?.deviceId || videoDevices[0]?.deviceId);
      const currentMicId = micId || (audioDevices.find(d => d.deviceId === savedMic)?.deviceId || audioDevices[0]?.deviceId);
      
      setCamId(currentCamId);
      setMicId(currentMicId);
      
      // Stop initial stream to release devices before restarting with specific IDs
      initialStream.getTracks().forEach(track => track.stop());

      if(currentCamId || currentMicId) {
          const newStream = await navigator.mediaDevices.getUserMedia({ 
              video: currentCamId ? { deviceId: { exact: currentCamId } } : false,
              audio: currentMicId ? { 
                  deviceId: { exact: currentMicId }, 
                  noiseSuppression: false, 
                  echoCancellation: false,
                  autoGainControl: false
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
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1.5;
    source.connect(gainNode);
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
  }, [camId, micId]); 

  const handleStart = () => {
      // Save preferences explicity
      if (camId) localStorage.setItem('preferredCamId', camId);
      if (micId) localStorage.setItem('preferredMicId', micId);
      
      setRoute({name: "interviewLive", jobId: job.id, applicationData});
  };

  return (
    <div className="grid lg:grid-cols-[1fr,360px] gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">System Check</h1>
        <p className="text-sm text-neutral-400 mt-1">Ensure your audio and video are clear before beginning.</p>

        <div className="mt-6 relative aspect-video rounded-2xl border border-white/10 bg-black overflow-hidden grid place-items-center shadow-2xl shadow-cyan-900/10">
          <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted autoPlay playsInline />
          {error && <div className="absolute text-center p-4 text-red-400 text-sm bg-black/80 backdrop-blur rounded-lg border border-red-500/30">{error}</div>}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
             <div className="flex-1 bg-black/60 backdrop-blur rounded-lg p-1.5 border border-white/5">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-400 transition-all duration-75 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{width: `${Math.min(100, Math.round(micLevel * 300))}%`}}/>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
             <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Camera Source</label>
             <select value={camId} onChange={e => setCamId(e.target.value)} className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm focus:border-cyan-500 outline-none transition-colors text-white">
                {cams.length === 0 ? <option>No cameras found</option> : cams.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${cams.indexOf(d) + 1}`}</option>)}
             </select>
          </div>
          <div>
             <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Microphone Source</label>
             <select value={micId} onChange={e => setMicId(e.target.value)} className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm focus:border-cyan-500 outline-none transition-colors text-white">
                {mics.length === 0 ? <option>No microphones found</option> : mics.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${mics.indexOf(d) + 1}`}</option>)}
             </select>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold opacity-80 mb-4 text-white">Progress</h3>
          <Stepper current={2}/>
           <ul className="mt-6 text-sm space-y-3 text-neutral-400">
            <li className="flex items-center gap-3 opacity-50"><span className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-xs">✓</span> Basic Info</li>
            <li className="flex items-center gap-3 text-white font-medium"><span className="w-6 h-6 rounded-full bg-cyan-500 text-black grid place-items-center text-xs shadow-lg shadow-cyan-500/20">2</span> Device Check</li>
            <li className="flex items-center gap-3 opacity-50"><span className="w-6 h-6 rounded-full border border-white/10 grid place-items-center text-xs">3</span> Interview</li>
          </ul>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6">
          <h3 className="text-sm font-semibold mb-2 text-white">Ready to join?</h3>
          <p className="text-xs text-neutral-400 mb-6">The interview is automated and timed. Please ensure you are in a quiet environment.</p>
          <Button disabled={!!error || !camId || !micId} className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-900/20 transition-all hover:shadow-cyan-500/20" onClick={handleStart}>
            {error ? 'Check Permissions' : 'Start Interview'}
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default DeviceCheckPage;
