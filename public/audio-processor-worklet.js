class AudioProcessorWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.VAD_THRESHOLD = 0.005; 
    this.vadActive = false;
    this.silenceFrames = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const inputChannel = input[0];
    
    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < inputChannel.length; i++) {
      sum += inputChannel[i] * inputChannel[i];
    }
    const rms = Math.sqrt(sum / inputChannel.length);

    // Simple Hysteresis VAD
    if (rms > this.VAD_THRESHOLD) {
      this.vadActive = true;
      this.silenceFrames = 0;
    } else {
      this.silenceFrames++;
      if (this.silenceFrames > 20) { // ~0.2s of silence to close gate
        this.vadActive = false;
      }
    }

    for (let i = 0; i < inputChannel.length; i++) {
      // If VAD is active, write audio. If not, write 0 (silence) or skip.
      // Writing 0 ensures we keep sending "heartbeats" of audio if needed, 
      // but skipping saves bandwidth. 
      // Let's write 0s to maintain timing for now, effectively muting the noise.
      
      this.buffer[this.bufferIndex++] = this.vadActive ? inputChannel[i] : 0;

      if (this.bufferIndex >= this.bufferSize) {
        this.port.postMessage({
            audio: this.buffer.slice(),
            rms: rms
        });
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor('audio-processor-worklet', AudioProcessorWorklet);
