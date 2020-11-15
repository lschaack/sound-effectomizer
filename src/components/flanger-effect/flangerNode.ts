import { makeAudioIO, mixToDryWet, AudioIO } from "components/utils";
import { normalizeToRange } from "components/utils";

export type FlangerOptions = {
  wave: OscillatorNode['type']; 
  time: number;
  speed: number;
  depth: number;
  feedback: number;
  mix: number;
};

export type FlangerNode = AudioIO<FlangerOptions>;

// https://github.com/alemangui/pizzicato/blob/master/src/Effects/Flanger.js
export const createFlangerNode = (context: AudioContext, options: FlangerOptions): FlangerNode => {
  const input = context.createGain();
  const output = context.createGain();
  const feedbackOutput = context.createGain();
  const delay = context.createDelay();
  const feedback = context.createGain();
  const oscillator = context.createOscillator();
  const oscillatorGain = context.createGain();
  const wetGain = context.createGain();
  const dryGain = context.createGain();
  
  // Hook up internal graph
  input.connect(feedbackOutput);
  input.connect(dryGain);

  feedbackOutput.connect(delay);
  feedbackOutput.connect(wetGain);

  delay.connect(wetGain);
  delay.connect(feedback);

  feedback.connect(feedbackOutput);

  oscillator.connect(oscillatorGain);
  oscillatorGain.connect(delay.delayTime);

  dryGain.connect(output);
  wetGain.connect(output);
  
  return makeAudioIO<FlangerOptions>(
    input,
    output,
    function (this: FlangerNode, options) {
      const { time, speed, depth, feedback: feedbackGain, wave, mix } = options;

      oscillator.type = wave;
      delay.delayTime.value = normalizeToRange(0.001, 0.02, time);
      oscillator.frequency.value = normalizeToRange(0.5, 5, speed);
      oscillatorGain.gain.value = normalizeToRange(0.0005, 0.005, depth);
      feedback.gain.value = normalizeToRange(0, 0.8, feedbackGain);

      const [ dryGainValue, wetGainValue ] = mixToDryWet(mix);
      dryGain.gain.value = dryGainValue;
      wetGain.gain.value = wetGainValue;

      return this;
    }
  ).setOptions(
    options
  );
};
