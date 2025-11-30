/**
 * Noise Suppression Audio Worklet Processor
 * Uses spectral gating and adaptive noise estimation
 * Designed for real-time voice processing
 */

class NoiseSuppressionProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    
    // Configuration from options
    const config = options.processorOptions || {};
    this.aggressiveness = config.aggressiveness || 'medium';
    this.vadEnabled = config.vadEnabled !== false;
    
    // FFT size for spectral analysis
    this.fftSize = 512;
    this.hopSize = 128;
    
    // Noise estimation buffers
    this.noiseFloor = new Float32Array(this.fftSize / 2 + 1);
    this.noiseFloor.fill(0.001);
    
    // Smoothing coefficients based on aggressiveness
    this.smoothingCoeffs = {
      low: { attack: 0.95, release: 0.8, subtraction: 1.0, floor: 0.1 },
      medium: { attack: 0.9, release: 0.7, subtraction: 2.0, floor: 0.05 },
      high: { attack: 0.85, release: 0.6, subtraction: 3.0, floor: 0.02 }
    };
    
    this.coeffs = this.smoothingCoeffs[this.aggressiveness];
    
    // Input/output buffers
    this.inputBuffer = new Float32Array(this.fftSize);
    this.outputBuffer = new Float32Array(this.fftSize);
    this.bufferIndex = 0;
    
    // VAD state
    this.isSpeaking = false;
    this.silenceFrames = 0;
    this.speechThreshold = this.aggressiveness === 'high' ? 0.02 : 
                           this.aggressiveness === 'medium' ? 0.015 : 0.01;
    
    // Gain smoothing for artifact reduction
    this.currentGain = 1.0;
    this.targetGain = 1.0;
    this.gainSmoothingFactor = 0.95;
    
    // Message port for communication
    this.port.onmessage = (event) => {
      if (event.data.type === 'setAggressiveness') {
        this.aggressiveness = event.data.value;
        this.coeffs = this.smoothingCoeffs[this.aggressiveness];
      }
    };
  }
  
  /**
   * Simple RMS energy calculation
   */
  calculateRMS(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }
  
  /**
   * Voice Activity Detection
   */
  detectVoiceActivity(buffer) {
    const rms = this.calculateRMS(buffer);
    
    if (rms > this.speechThreshold) {
      this.isSpeaking = true;
      this.silenceFrames = 0;
    } else {
      this.silenceFrames++;
      // Keep speech state for ~200ms after silence to avoid cutting off words
      if (this.silenceFrames > 15) {
        this.isSpeaking = false;
      }
    }
    
    return this.isSpeaking;
  }
  
  /**
   * Update noise floor estimation during silence
   */
  updateNoiseFloor(buffer) {
    const rms = this.calculateRMS(buffer);
    
    // Only update noise floor during confirmed silence
    if (!this.isSpeaking && rms < this.speechThreshold * 0.5) {
      for (let i = 0; i < buffer.length && i < this.noiseFloor.length; i++) {
        const magnitude = Math.abs(buffer[i]);
        // Exponential moving average
        this.noiseFloor[i] = this.coeffs.attack * this.noiseFloor[i] + 
                            (1 - this.coeffs.attack) * magnitude;
      }
    }
  }
  
  /**
   * Apply spectral subtraction noise reduction
   */
  applyNoiseReduction(buffer) {
    const output = new Float32Array(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      const sample = buffer[i];
      const magnitude = Math.abs(sample);
      const noiseEst = i < this.noiseFloor.length ? this.noiseFloor[i] : 0.001;
      
      // Spectral subtraction with over-subtraction factor
      let reducedMagnitude = magnitude - this.coeffs.subtraction * noiseEst;
      
      // Spectral floor to prevent musical noise
      reducedMagnitude = Math.max(reducedMagnitude, this.coeffs.floor * magnitude);
      
      // Preserve sign
      const gain = magnitude > 0 ? reducedMagnitude / magnitude : 0;
      output[i] = sample * Math.min(gain, 1.0);
    }
    
    return output;
  }
  
  /**
   * Apply soft noise gate
   */
  applySoftGate(buffer, isSpeaking) {
    // Determine target gain
    this.targetGain = isSpeaking ? 1.0 : 0.01; // Don't go to complete silence
    
    // Smooth gain transition
    const output = new Float32Array(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      // Smooth gain changes per sample to avoid clicks
      this.currentGain = this.gainSmoothingFactor * this.currentGain + 
                        (1 - this.gainSmoothingFactor) * this.targetGain;
      output[i] = buffer[i] * this.currentGain;
    }
    
    return output;
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !input[0] || input[0].length === 0) {
      return true;
    }
    
    const inputChannel = input[0];
    const outputChannel = output[0];
    
    // Voice Activity Detection
    const isSpeaking = this.vadEnabled ? this.detectVoiceActivity(inputChannel) : true;
    
    // Update noise floor during silence
    this.updateNoiseFloor(inputChannel);
    
    // Apply noise reduction
    let processed = this.applyNoiseReduction(inputChannel);
    
    // Apply soft noise gate if VAD enabled
    if (this.vadEnabled) {
      processed = this.applySoftGate(processed, isSpeaking);
    }
    
    // Copy to output
    for (let i = 0; i < outputChannel.length; i++) {
      outputChannel[i] = processed[i] || 0;
    }
    
    return true;
  }
}

registerProcessor('noise-suppression-processor', NoiseSuppressionProcessor);

