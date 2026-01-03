// Audio recorder worklet code (stringified to avoid separate file complexity for now)
const workletCode = `
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      this.port.postMessage(input[0]);
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

export class AudioRecorder {
    constructor(sampleRate = 16000) {
        this.targetSampleRate = sampleRate;
        this.audioContext = null;
        this.stream = null;
        this.mediaStreamSource = null;
        this.workletNode = null;
        this.onDataAvailable = null;
    }

    async start(onData) {
        this.onDataAvailable = onData;
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: this.targetSampleRate
            }
        });

        this.audioContext = new AudioContext({ sampleRate: this.targetSampleRate });

        try {
            await this.audioContext.audioWorklet.addModule(
                URL.createObjectURL(new Blob([workletCode], { type: 'application/javascript' }))
            );
        } catch (e) {
            console.error("Failed to load AudioWorklet", e);
            return;
        }

        this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
        this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor');

        this.workletNode.port.onmessage = (e) => {
            const inputData = e.data;
            // inputData is Float32. Convert to Int16 PCM.
            const pcm16 = this.floatTo16BitPCM(inputData);
            if (this.onDataAvailable) {
                this.onDataAvailable(pcm16);
            }
        };

        this.mediaStreamSource.connect(this.workletNode);
        this.workletNode.connect(this.audioContext.destination);
    }

    stop() {
        if (this.stream) this.stream.getTracks().forEach(t => t.stop());
        if (this.workletNode) this.workletNode.disconnect();
        if (this.mediaStreamSource) this.mediaStreamSource.disconnect();
        if (this.audioContext && this.audioContext.state !== 'closed') this.audioContext.close();
    }

    floatTo16BitPCM(float32Array) {
        const buffer = new ArrayBuffer(float32Array.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < float32Array.length; i++) {
            let s = Math.max(-1, Math.min(1, float32Array[i]));
            s = s < 0 ? s * 0x8000 : s * 0x7FFF;
            view.setInt16(i * 2, s, true); // Little endian
        }
        return new Uint8Array(buffer); // Return bytes
    }
}

export class AudioPlayer {
    constructor(sampleRate = 24000) {
        this.audioContext = new AudioContext({ sampleRate });
        this.isPlaying = false;
        this.scheduledTime = 0;
    }

    playChunk(pcmData) {
        // pcmData is Uint8Array (bytes) representing Int16
        if (pcmData.byteLength % 2 !== 0) return; // Alignment check

        const float32 = new Float32Array(pcmData.byteLength / 2);
        const view = new DataView(pcmData.buffer);

        for (let i = 0; i < float32.length; i++) {
            const int16 = view.getInt16(i * 2, true); // Little endian
            float32[i] = int16 / 32768.0;
        }

        const buffer = this.audioContext.createBuffer(1, float32.length, 24000);
        buffer.getChannelData(0).set(float32);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);

        const currentTime = this.audioContext.currentTime;
        if (this.scheduledTime < currentTime) {
            this.scheduledTime = currentTime;
        }

        source.start(this.scheduledTime);
        this.scheduledTime += buffer.duration;
        this.currentSource = source; // Keep track of latest source if needed, though simpler just to close context or track all? 
        // For simple interruption, usually we want to stop *all* scheduled sources. 
        // Web Audio API doesn't have "stop all". 
        // Best way is to suspend/close context or use a gain node we can cut.
        // Let's use a gain node for master volume/cut.
    }

    stop() {
        if (this.audioContext.state === 'running') {
            this.audioContext.suspend(); // Pause everything
            // OR close and recreate? 
            // Better: create a GainNode, connect sources to it, and disconnect it when stopping.
            // For this prototype, closing and recreating might be cleanest way to "flush" buffer.
            this.audioContext.close();
            this.audioContext = new AudioContext({ sampleRate: 24000 });
            this.scheduledTime = 0;
        }
    }
}