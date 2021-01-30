import { getFrequencyFromTransposition } from '../utils/audio';
import { AudioIO } from "common/AudioIO";
import { CustomOscillatorNode } from "common/CustomOscillatorNode";
import { CrossfadeNode } from "common/CrossfadeNode";
import { WINDOW_SIZE } from "common/contants";

export type PitchOptions = {
  transposition: number;
  autoStart?: boolean;
}

export class PitchNode extends AudioIO {
  type = 'PitchNode' as const;
  private context: AudioContext;
  private oscillator: CustomOscillatorNode;
  private crossfade: CrossfadeNode;
  private phaseAdjust: DelayNode;
  private leftOscillatorOutput: GainNode;
  private rightOscillatorOutput: GainNode;

  constructor(context: AudioContext, options: PitchOptions) {
    /********** Base instantiation **********/
    super(context.createGain(), context.createGain());

    this.context = context;

    /********** Setup **********/
    const leftDelay = context.createDelay();
    const rightDelay = context.createDelay();
    
    const { transposition, autoStart } = options;
    this.oscillator = new CustomOscillatorNode(context, {
      type: 'sawtooth',
      frequency: getFrequencyFromTransposition(transposition),
      autoStart: false
    });

    this.phaseAdjust = context.createDelay();

    const leftOscillatorGain = context.createGain();
    leftOscillatorGain.gain.value = WINDOW_SIZE;
    const rightOscillatorGain = context.createGain();
    rightOscillatorGain.gain.value = WINDOW_SIZE;

    this.leftOscillatorOutput = context.createGain();
    this.rightOscillatorOutput = context.createGain();

    this.crossfade = new CrossfadeNode(context, {
      leftInput: leftDelay,
      rightInput: rightDelay,
      autoStart: false,
    });

    /********** Connect **********/
    this.oscillator.connect(this.leftOscillatorOutput);
    this.oscillator.connect(this.phaseAdjust);
    this.phaseAdjust.connect(this.rightOscillatorOutput);

    this.leftOscillatorOutput.connect(leftOscillatorGain);
    this.rightOscillatorOutput.connect(rightOscillatorGain);

    leftOscillatorGain.connect(leftDelay.delayTime);
    rightOscillatorGain.connect(rightDelay.delayTime);

    this.input.connect(leftDelay);
    this.input.connect(rightDelay);

    this.crossfade.connect(this.output);

    /********** Set options **********/
    if (autoStart ?? true) this.start();
  }

  set transposition(nextTransposition: number) {
    const frequency = getFrequencyFromTransposition(nextTransposition);

    // const halfPhase = WINDOW_SIZE / 2;
    // const halfPhase = frequency / 2;
    const halfPhase = 0.5 / frequency;
    this.phaseAdjust.delayTime.value = halfPhase;

    this.oscillator.disconnect();
    this.oscillator = new CustomOscillatorNode(this.context, {
      type: 'sawtooth',
      frequency
    });
    this.oscillator.connect(this.leftOscillatorOutput);
    this.oscillator.connect(this.phaseAdjust);
  }

  start() {
    this.oscillator.start();
    this.crossfade.start();
  }

  setOptions(options: PitchOptions) {
    super.setOptions(options);
  }
}
