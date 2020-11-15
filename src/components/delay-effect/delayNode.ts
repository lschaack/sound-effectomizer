import { AudioIO, makeAudioIO } from "components/utils";
import { normalizeToRange } from "components/utils";

export type DelayOptions = {
  depth: number;
  time: number;
};

export type DelayNode = AudioIO<DelayOptions>;

export const createDelayNode = (
  context: AudioContext,
  options: DelayOptions
): DelayNode => {
  const input = context.createGain();
  const output = context.createGain();
  const delay = context.createDelay();
  const delayGain = context.createGain();

  // Hook up internal graph
  input.connect(output);
  input.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(delay); // this loop is what produces the effect
  delayGain.connect(output);

  // Create the node to be returned
  return makeAudioIO<DelayOptions>(
    input,
    output,
    function (this: DelayNode, options) {
      const { depth, time } = options;

      delayGain.gain.value = normalizeToRange(0, 0.9, depth);
      delay.delayTime.value = normalizeToRange(0.1, 1, time);

      return this;
    }
  ).setOptions(
    options
  );
};
