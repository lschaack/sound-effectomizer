import { getFrequencyFromTransposition } from "../utils";
import { WINDOW_SIZE } from "../constants";
import { createWarbleNode } from "../warble-effect";
import { AudioIO, makeAudioIO } from "../utils";
import { uniqueId } from "lodash-es";
import { normalizeToRange } from "utils/index";

export type VibratoOptions = {
  transposition: number;
  rate?: number;
}

export type VibratoNode = AudioIO<VibratoOptions>;

export const createVibratoNode = (context: AudioContext, options: VibratoOptions): VibratoNode => {
  const input = context.createGain();
  const output = context.createGain();

  // this probably accomodates negative shifts w/samples played faster than their base rate
  // "for four-point interpolation [delayTime] must be at least one sample"
  const delay = context.createDelay();

  const oscillator = createWarbleNode(context, { type: 'sine' });
  oscillator.start();

  const oscillatorGain = context.createGain();

  oscillatorGain.gain.value = WINDOW_SIZE;

  input.connect(delay);
  delay.connect(output);

  oscillator.connect(oscillatorGain);
  oscillatorGain.connect(delay.delayTime);

  return makeAudioIO<VibratoOptions>(
    input,
    output,
    function (this: VibratoNode, options) {
      const { transposition, rate } = options;
      if (transposition) oscillatorGain.gain.value = normalizeToRange(0, 0.02, transposition);
      if (rate) (oscillator as any).oscillator.frequency.value = normalizeToRange(0, 10, rate);

      return this;
    }
  ).setOptions(
    options
  );
};
