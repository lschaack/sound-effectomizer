import uniqueId from "lodash/uniqueId";
import { AudioIO, makeAudioIO } from "components/utils";
import { createCrossfadeNode } from "../crossfade-effect";
import { createWarbleNode } from "../warble-effect";
import { WINDOW_SIZE } from '../constants';
import { getFrequencyFromTransposition } from '../utils';

export type PitchOptions = {
  transposition: number;
}

export type PitchNode = AudioIO<PitchOptions>;

export const createSimplePitchNode = (context: AudioContext, options: PitchOptions): PitchNode => {
  const input = context.createGain();
  const output = context.createGain();

  // this probably accomodates negative shifts w/samples played faster than their base rate
  // "for four-point interpolation [delayTime] must be at least one sample"
  const delayTime = 0; // 4 / context.sampleRate; // 4 samples
  const delay = context.createDelay();
  const baseDelay = context.createDelay();
  baseDelay.delayTime.value = delayTime;

  const oscillator = createWarbleNode(context, { type: 'sawtooth' });
  oscillator.start();

  const oscillatorGain = context.createGain();

  oscillatorGain.gain.value = WINDOW_SIZE;

  input.connect(delay);
  delay.connect(baseDelay);
  baseDelay.connect(output);

  oscillator.connect(oscillatorGain);
  oscillatorGain.connect(delay.delayTime);

  const id = uniqueId();

  return makeAudioIO<PitchOptions>(
    input,
    output,
    function (this: PitchNode, options) {
      const frequency = getFrequencyFromTransposition(options.transposition);

      console.log(`setting frequency in simplePitchNode ${id}:`, frequency);
      oscillator.setOptions({ frequency });
      oscillator.start();

      return this;
    }
  ).setOptions(
    options
  );
};

// TODO: handle delays on both simplePitchNodes?
const createComplexPitchNode = (context: AudioContext, options: PitchOptions): PitchNode => {
  const { transposition } = options;
  const input = context.createGain();
  const output = context.createGain();
  const leftDelay = context.createDelay();
  const rightDelay = context.createDelay();

  let oscillator = createWarbleNode(
    context,
    {
      type: 'sawtooth',
      frequency: getFrequencyFromTransposition(transposition)
    }
  );

  const phaseAdjust = context.createDelay();
  
  const leftOscillatorGain = context.createGain();
  leftOscillatorGain.gain.value = WINDOW_SIZE;
  const rightOscillatorGain = context.createGain();
  rightOscillatorGain.gain.value = WINDOW_SIZE;

  const leftOscillatorOutput = context.createGain();
  const rightOscillatorOutput = context.createGain();

  oscillator.connect(leftOscillatorOutput);
  oscillator.connect(phaseAdjust);
  phaseAdjust.connect(rightOscillatorOutput);

  leftOscillatorOutput.connect(leftOscillatorGain);
  rightOscillatorOutput.connect(rightOscillatorGain);

  leftOscillatorGain.connect(leftDelay.delayTime);
  rightOscillatorGain.connect(rightDelay.delayTime);

  input.connect(leftDelay);
  input.connect(rightDelay);

  const crossfade = createCrossfadeNode(context, {
    // type: 'triangle',
    leftInput: leftDelay,
    rightInput: rightDelay,
  });

  crossfade.connect(output);

  return makeAudioIO<PitchOptions>(
    input,
    output,
    function (this: PitchNode, options) {
      const frequency = getFrequencyFromTransposition(options.transposition);

      // const halfPhase = WINDOW_SIZE / 2;
      // const halfPhase = frequency / 2;
      const halfPhase = 0.5 / frequency;
      phaseAdjust.delayTime.value = halfPhase;

      oscillator.disconnect();
      oscillator = createWarbleNode(context, { type: 'sawtooth', frequency });
      oscillator.connect(leftOscillatorOutput);
      oscillator.connect(phaseAdjust);

      crossfade.setOptions({ ...options, frequency });

      oscillator.start();
      crossfade.start();

      // TODO: un-fuck these types
      (this as any).crossfade = crossfade;
      (this as any).leftOscillatorOutput = leftOscillatorOutput;
      (this as any).rightOscillatorOutput = rightOscillatorOutput;

      return this;
    }
  ).setOptions(
    options
  ) as any;
};

export const createPitchNode = createComplexPitchNode;
// export const createPitchNode = createSimplePitchNode;
