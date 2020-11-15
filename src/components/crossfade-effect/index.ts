import { AudioIO, makeAudioIO } from "components/utils";
import { createWarbleNode } from "../warble-effect";

export type CrossfadeOptions = {
  leftInput?: AudioNode | AudioIO<any>;
  rightInput?: AudioNode | AudioIO<any>;
  // start doesn't generally need to be set, since it's out of phase by default
  frequency?: number;
  type?: OscillatorType;
}

export type CrossfadeNode = AudioIO<CrossfadeOptions> & {
  leftOscillator: AudioNode;
  rightOscillator: AudioNode;
  start: OscillatorNode['start'];
};

export type PhaseOffsetOptions = {
  leftInput?: AudioNode | AudioIO<any>;
  rightInput?: AudioNode | AudioIO<any>;
  offset: number;
}

export type PhaseOffsetNode = AudioIO<PhaseOffsetOptions>;

// export const createPhaseOffsetNode = (context: AudioContext, options: PhaseOffsetOptions): PhaseNode => {
//   const input = context.createGain();
//   const output = context.createGain();

//   const oscillator = createWarbleNode(context, options);
//   const phaseAdjuster = context.createDelay();

//   const leftOscillatorOutput = context.createGain();
//   const rightOscillatorOutput = context.createGain();

//   input.connect(output);

//   phaseAdjuster.connect(rightOscillatorOutput);
// };

export const createCrossfadeNode = (
  context: AudioContext,
  options: CrossfadeOptions
): CrossfadeNode => {
  const output = context.createGain();
  let { leftInput, rightInput } = options;

  const oscillator = createWarbleNode(context, options);
  const leftPhaseAdjuster = context.createDelay();
  const rightPhaseAdjuster = context.createDelay();

  const leftOscillatorOutput = context.createGain();
  const rightOscillatorOutput = context.createGain();

  const leftGain = context.createGain();
  const rightGain = context.createGain();

  // Set base gain to 0 to oscillate from 0 to 1
  leftGain.gain.value = 0;
  rightGain.gain.value = 0;

  leftInput?.connect(leftGain);
  rightInput?.connect(rightGain);

  oscillator.connect(leftPhaseAdjuster);
  leftPhaseAdjuster.connect(leftOscillatorOutput);
  oscillator.connect(rightPhaseAdjuster);
  rightPhaseAdjuster.connect(rightOscillatorOutput);

  leftOscillatorOutput.connect(leftGain.gain);
  rightOscillatorOutput.connect(rightGain.gain);

  /**
   * TODO: run w/ one node, adjust until muted during gap discontinuity
   */
  leftGain.connect(output);
  rightGain.connect(output);

  return makeAudioIO<CrossfadeOptions>(
    output,
    output,
    function (this: CrossfadeNode, options) {
      if (options.leftInput) {
        leftInput?.disconnect();
        leftInput = options.leftInput;
        leftInput.connect(leftGain);
      }

      if (options.rightInput) {
        rightInput?.disconnect();
        rightInput = options.rightInput;
        rightInput.connect(rightGain);
      }

      const { frequency } = options;
      // if frequency changes, need to fix phase to maintain the effect
      if (frequency) {
        const quarterPhase = Math.abs(0.25 / (frequency ?? 440));
        const halfPhase = Math.abs(0.5 / (frequency ?? 440));
        const threeQuartersPhase = Math.abs(0.75 / (frequency ?? 440));
        
        // TODO: make this work w/negative frequency shifts
        leftPhaseAdjuster.delayTime.setValueAtTime(threeQuartersPhase, 0);
        rightPhaseAdjuster.delayTime.setValueAtTime(quarterPhase, 0);
        
        oscillator.setOptions(options);
      }

      this.leftOscillator = leftOscillatorOutput;
      this.rightOscillator = rightOscillatorOutput;
      this.start = oscillator.start;

      return this;
    }
  ).setOptions(
    options
  ) as any;
};
