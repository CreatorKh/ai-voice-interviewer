/**
 * Advanced Noise Suppression Service
 * Uses Web Audio API with enhanced noise reduction algorithms
 * Similar to Krisp-style noise cancellation
 */

export interface NoiseSuppressionConfig {
  enabled: boolean;
  aggressiveness: 'low' | 'medium' | 'high';
  vadEnabled: boolean; // Voice Activity Detection
}

const DEFAULT_CONFIG: NoiseSuppressionConfig = {
  enabled: true,
  aggressiveness: 'medium',
  vadEnabled: true,
};

// Noise gate thresholds based on aggressiveness
const NOISE_GATE_THRESHOLDS = {
  low: -50,      // dB
  medium: -45,   // dB
  high: -40,     // dB
};

// Attack/Release times for smoother gating
const ATTACK_TIME = 0.01;  // 10ms
const RELEASE_TIME = 0.1;  // 100ms

/**
 * Creates an enhanced audio processing chain for noise suppression
 */
export function createNoiseSuppressionChain(
  audioContext: AudioContext,
  sourceNode: MediaStreamAudioSourceNode,
  config: NoiseSuppressionConfig = DEFAULT_CONFIG
): {
  outputNode: GainNode;
  analyser: AnalyserNode;
  cleanup: () => void;
} {
  // 1. High-pass filter to remove low-frequency rumble (AC hum, traffic, etc.)
  const highPassFilter = audioContext.createBiquadFilter();
  highPassFilter.type = 'highpass';
  highPassFilter.frequency.value = 80; // Cut below 80Hz
  highPassFilter.Q.value = 0.7;

  // 2. Low-pass filter to remove high-frequency hiss
  const lowPassFilter = audioContext.createBiquadFilter();
  lowPassFilter.type = 'lowpass';
  lowPassFilter.frequency.value = 8000; // Cut above 8kHz (preserve speech clarity)
  lowPassFilter.Q.value = 0.7;

  // 3. Notch filter for common interference frequencies (50/60Hz hum harmonics)
  const notchFilter1 = audioContext.createBiquadFilter();
  notchFilter1.type = 'notch';
  notchFilter1.frequency.value = 50;
  notchFilter1.Q.value = 30;

  const notchFilter2 = audioContext.createBiquadFilter();
  notchFilter2.type = 'notch';
  notchFilter2.frequency.value = 60;
  notchFilter2.Q.value = 30;

  // 4. Compressor to even out volume and reduce background noise relative to speech
  const compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 30;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  // 5. Analyser for level detection (VAD)
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.3;

  // 6. Output gain node (for noise gate effect)
  const outputGain = audioContext.createGain();
  outputGain.gain.value = 1.0;

  // Connect the chain
  sourceNode.connect(highPassFilter);
  highPassFilter.connect(lowPassFilter);
  lowPassFilter.connect(notchFilter1);
  notchFilter1.connect(notchFilter2);
  notchFilter2.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(outputGain);

  // Noise gate logic using requestAnimationFrame
  let animationId: number | null = null;
  let currentGain = 1.0;
  const threshold = NOISE_GATE_THRESHOLDS[config.aggressiveness];

  if (config.vadEnabled && config.enabled) {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const processNoise = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const db = 20 * Math.log10(rms / 255);
      
      // Determine target gain based on threshold
      const targetGain = db > threshold ? 1.0 : 0.0;
      
      // Smooth transition (attack/release)
      const transitionSpeed = targetGain > currentGain ? ATTACK_TIME : RELEASE_TIME;
      currentGain += (targetGain - currentGain) * (1 - Math.exp(-1 / (audioContext.sampleRate * transitionSpeed)));
      
      // Apply gain (with minimum to avoid complete silence)
      outputGain.gain.setTargetAtTime(
        Math.max(currentGain, 0.01),
        audioContext.currentTime,
        0.01
      );
      
      animationId = requestAnimationFrame(processNoise);
    };
    
    processNoise();
  }

  const cleanup = () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
    // Disconnect all nodes
    try {
      sourceNode.disconnect();
      highPassFilter.disconnect();
      lowPassFilter.disconnect();
      notchFilter1.disconnect();
      notchFilter2.disconnect();
      compressor.disconnect();
      analyser.disconnect();
      outputGain.disconnect();
    } catch (e) {
      // Nodes may already be disconnected
    }
  };

  return {
    outputNode: outputGain,
    analyser,
    cleanup,
  };
}

/**
 * Enhanced getUserMedia constraints for maximum noise suppression
 */
export function getEnhancedAudioConstraints(
  deviceId?: string,
  config: NoiseSuppressionConfig = DEFAULT_CONFIG
): MediaTrackConstraints {
  return {
    deviceId: deviceId ? { exact: deviceId } : undefined,
    channelCount: 1,
    sampleRate: { ideal: 48000 },
    sampleSize: { ideal: 16 },
    // Browser's built-in processing
    echoCancellation: true, // Force AEC
    noiseSuppression: true,
    autoGainControl: true,
    // Advanced constraints (Chrome)
    // @ts-ignore - These are Chrome-specific
    googEchoCancellation: true,
    googAutoGainControl: true,
    googNoiseSuppression: true,
    googHighpassFilter: true,
    googTypingNoiseDetection: true,
    googAudioMirroring: false,
  };
}

/**
 * Voice Activity Detection (VAD) utility
 * Returns true if speech is detected
 */
export function detectVoiceActivity(
  analyser: AnalyserNode,
  threshold: number = -45
): boolean {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  
  // Focus on speech frequency range (300Hz - 3400Hz)
  // Assuming 48kHz sample rate and 256 FFT size
  const binWidth = 48000 / 256;
  const startBin = Math.floor(300 / binWidth);
  const endBin = Math.ceil(3400 / binWidth);
  
  let sum = 0;
  let count = 0;
  for (let i = startBin; i <= endBin && i < dataArray.length; i++) {
    sum += dataArray[i] * dataArray[i];
    count++;
  }
  
  const rms = Math.sqrt(sum / count);
  const db = 20 * Math.log10(rms / 255);
  
  return db > threshold;
}

/**
 * Spectral subtraction for background noise estimation and removal
 * This is a simplified version - real Krisp uses deep learning
 */
export class SpectralNoiseReducer {
  private noiseProfile: Float32Array | null = null;
  private readonly alpha = 0.98; // Noise estimation smoothing
  private readonly beta = 2.0;   // Over-subtraction factor
  private readonly floor = 0.01; // Spectral floor to avoid musical noise

  updateNoiseProfile(frequencyData: Float32Array): void {
    if (!this.noiseProfile) {
      this.noiseProfile = new Float32Array(frequencyData.length);
      this.noiseProfile.set(frequencyData);
      return;
    }

    // Exponential moving average for noise estimation
    for (let i = 0; i < frequencyData.length; i++) {
      // Only update noise estimate when signal is likely noise (low energy)
      if (frequencyData[i] < this.noiseProfile[i] * 1.5) {
        this.noiseProfile[i] = this.alpha * this.noiseProfile[i] + 
                               (1 - this.alpha) * frequencyData[i];
      }
    }
  }

  applyReduction(frequencyData: Float32Array): Float32Array {
    if (!this.noiseProfile) {
      return frequencyData;
    }

    const output = new Float32Array(frequencyData.length);
    
    for (let i = 0; i < frequencyData.length; i++) {
      // Spectral subtraction with over-subtraction
      const reduced = frequencyData[i] - this.beta * this.noiseProfile[i];
      // Apply spectral floor
      output[i] = Math.max(reduced, this.floor * frequencyData[i]);
    }

    return output;
  }

  reset(): void {
    this.noiseProfile = null;
  }
}

export { DEFAULT_CONFIG as defaultNoiseSuppressionConfig };

