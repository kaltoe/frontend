/* global sampleRate, registerProcessor, AudioWorkletProcessor */

// AudioWorklet: 마이크 소리를 WS-02 형식(16kHz, mono, LINEAR16)으로 바꿔 일정 길이마다 보냄
// - 브라우저 마이크는 보통 44.1kHz·48kHz라 16kHz로 줄임 (구간 평균으로 줄여서 잡음이 덜 생김)
// - chunkMs(기본 200ms)만큼 모이면 Int16 PCM ArrayBuffer를 메인 스레드로 보냄
// 이 파일은 오디오 스레드에서 따로 실행됨 (import, React 사용 불가)
class PcmRecorderProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const { targetSampleRate = 16000, chunkMs = 200 } =
      options.processorOptions ?? {};
    // 입력 몇 개를 출력 1개로 줄일지 (48kHz → 16kHz면 3)
    this.ratio = sampleRate / targetSampleRate;
    this.chunkSize = Math.round((targetSampleRate * chunkMs) / 1000);
    this.chunk = new Int16Array(this.chunkSize);
    this.length = 0;
    // 다음 출력 샘플이 시작하는 입력 위치 (소수점 포함)
    this.position = 0;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;

    while (this.position < channel.length) {
      const start = Math.floor(this.position);
      const end = Math.min(
        channel.length,
        Math.max(start + 1, Math.floor(this.position + this.ratio)),
      );
      let sum = 0;
      for (let i = start; i < end; i += 1) sum += channel[i];
      const value = Math.max(-1, Math.min(1, sum / (end - start)));
      this.chunk[this.length] = value < 0 ? value * 0x8000 : value * 0x7fff;
      this.length += 1;

      if (this.length === this.chunkSize) {
        this.port.postMessage(this.chunk.buffer, [this.chunk.buffer]);
        this.chunk = new Int16Array(this.chunkSize);
        this.length = 0;
      }
      this.position += this.ratio;
    }
    this.position -= channel.length;
    return true;
  }
}

registerProcessor('pcm-recorder', PcmRecorderProcessor);
