// audio-processor-worklet.js - AudioWorklet для обработки аудио вместо ScriptProcessorNode
class AudioProcessorWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0 && input[0].length > 0) {
      const inputChannel = input[0];
      
      // Копируем входные данные в буфер
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex++] = inputChannel[i];
        
        // Когда буфер заполнен, отправляем его
        if (this.bufferIndex >= this.bufferSize) {
          this.port.postMessage({
            type: 'audioData',
            data: new Float32Array(this.buffer),
          });
          this.bufferIndex = 0;
        }
      }
    }

    // Пропускаем аудио на выход (pass-through)
    if (output.length > 0 && output[0].length > 0 && input.length > 0 && input[0].length > 0) {
      output[0].set(input[0]);
    }

    return true; // Продолжаем обработку
  }
}

registerProcessor('audio-processor-worklet', AudioProcessorWorklet);

