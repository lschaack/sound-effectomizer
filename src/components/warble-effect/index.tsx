import { AudioIO, makeAudioIO } from "components/utils";

export type WarbleOptions = {
  frequency?: number;
  type?: OscillatorType;
}

export type WarbleNode = AudioIO<WarbleOptions> & OscillatorNode;

export const createWarbleNode = (context: AudioContext, options: WarbleOptions): WarbleNode => {
  const { frequency: initFrequency, type: initType } = options;
  const output = context.createGain();
  const joiner = context.createGain();
  // offset oscillator range to [0, 2] w/constant source offset of 1
  const baseGainSource = context.createConstantSource();
  baseGainSource.start();

  let oscillator = context.createOscillator();
  oscillator.type = initType ?? 'sine';
  oscillator.frequency.value = initFrequency ?? 440;

  oscillator.connect(joiner);

  baseGainSource.connect(joiner);
  // scale oscillator range to [0, 1] by halving output
  joiner.gain.value = 0.5;

  joiner.connect(output);

  return makeAudioIO<WarbleOptions>(
    output,
    output,
    function (this: WarbleNode, options) {
      const { frequency, type } = options;

      oscillator.disconnect();
      oscillator = context.createOscillator();
      oscillator.type = type ?? initType ?? 'sine';
      oscillator.frequency.value = frequency ?? initFrequency ?? 440;
      oscillator.connect(joiner);

      this.start = oscillator.start.bind(oscillator);
      // copy properties from underlying OscillatorNode
      Object.entries(oscillator).forEach(([key, value]) =>
        (this as any)[key] = value instanceof Function ? value.bind(oscillator) : value
      );
      (this as any).oscillator = oscillator;

      return this;
    }
  ).setOptions(
    options
  ) as any;
};
