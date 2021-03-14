import { getFrequencyFromTransposition } from '../utils/audio';
import { AudioIO } from "common/AudioIO";
import { CustomOscillatorNode } from "common/CustomOscillatorNode";
import { CrossfadeNode } from "common/CrossfadeNode";
import { WINDOW_SIZE } from "common/contants";

const START_DELAY_SECONDS = 0.25;

export type PitchOptions = {
  transposition: number;
  autoStart?: boolean;
}

export class SimplePitchNode extends AudioIO {
  type = 'SimplePitchNode' as const;
  private context: AudioContext;
  private oscillator: CustomOscillatorNode;
  private oscillatorOutput: GainNode;

  constructor(context: AudioContext, options: PitchOptions) {
    /********** Base instantiation **********/
    super(context.createGain(), context.createGain());

    this.context = context;

    /********** Setup **********/
    const delay = context.createDelay();
    
    const { transposition, autoStart } = options;
    this.oscillator = new CustomOscillatorNode(context, {
      type: 'sawtooth',
      frequency: getFrequencyFromTransposition(transposition),
      autoStart: false
    });

    const oscillatorGain = context.createGain();
    oscillatorGain.gain.value = WINDOW_SIZE;

    this.oscillatorOutput = context.createGain();

    /********** Connect **********/
    this.oscillator.connect(this.oscillatorOutput);
    this.oscillatorOutput.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);

    this.input.connect(delay);
    delay.connect(this.output);

    /********** Set options **********/
    if (autoStart ?? true) this.start(context.currentTime + START_DELAY_SECONDS);
  }

  set transposition(nextTransposition: number) {
    const frequency = getFrequencyFromTransposition(nextTransposition);

    this.oscillator.frequency = frequency;
    this.oscillator.connect(this.oscillatorOutput);
  }

  start(when = 0) {
    this.oscillator.start(when);
  }

  setOptions(options: PitchOptions) {
    super.setOptions(options);
  }
}

export class PitchNode extends AudioIO {
  type = 'PitchNode' as const;
  private context: AudioContext;
  private leftSimplePitchNode: SimplePitchNode;
  private rightSimplePitchNode: SimplePitchNode;
  private crossfade: CrossfadeNode;
  private phaseAdjust: DelayNode;

  constructor(context: AudioContext, options: PitchOptions) {
    /********** Base instantiation **********/
    super(context.createGain(), context.createGain());

    this.context = context;

    /********** Setup **********/
    this.leftSimplePitchNode = new SimplePitchNode(context, { ...options, autoStart: false });
    this.rightSimplePitchNode = new SimplePitchNode(context, { ...options, autoStart: false });

    const { transposition, autoStart } = options;

    this.phaseAdjust = context.createDelay();

    this.crossfade = new CrossfadeNode(context, {
      leftInput: this.leftSimplePitchNode.output,
      rightInput: this.rightSimplePitchNode.output,
      autoStart: false,
    });

    /********** Connect **********/
    this.input.connect(this.leftSimplePitchNode.input);
    this.input.connect(this.phaseAdjust);
    this.phaseAdjust.connect(this.rightSimplePitchNode.input);

    this.crossfade.output.connect(this.output);

    /********** Set options **********/
    this.transposition = transposition;

    if (autoStart ?? true) this.start(context.currentTime + START_DELAY_SECONDS);
  }

  set transposition(nextTransposition: number) {
    const frequency = getFrequencyFromTransposition(nextTransposition);

    // phase adjust delay should always be half a phase
    // crossfade frequency should always match pitch shift frequency
    const halfPhase = 0.5 / frequency;
    // const halfPhase = WINDOW_SIZE / 2;
    // const halfPhase = frequency / 2;
    this.phaseAdjust.delayTime.value = halfPhase;

    this.crossfade.frequency = frequency;
    this.leftSimplePitchNode.transposition = nextTransposition;
    this.rightSimplePitchNode.transposition = nextTransposition;
  }

  start(when = 0) {
    this.leftSimplePitchNode.start(when);
    this.rightSimplePitchNode.start(when);
    this.crossfade.start(when);
  }

  setOptions(options: PitchOptions) {
    super.setOptions(options);
  }
}
