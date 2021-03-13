import { getFrequencyFromTransposition } from '../utils/audio';
import { AudioIO } from "common/AudioIO";
import { CustomOscillatorNode } from "common/CustomOscillatorNode";
import { CrossfadeNode } from "common/CrossfadeNode";
import { WINDOW_SIZE } from "common/contants";

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
    const leftDelay = context.createDelay();
    
    const { transposition, autoStart } = options;
    this.oscillator = new CustomOscillatorNode(context, {
      type: 'sawtooth',
      frequency: getFrequencyFromTransposition(transposition),
      autoStart: false
    });

    const leftOscillatorGain = context.createGain();
    leftOscillatorGain.gain.value = WINDOW_SIZE;

    this.oscillatorOutput = context.createGain();

    /********** Connect **********/
    this.oscillator.connect(this.oscillatorOutput);
    this.oscillatorOutput.connect(leftOscillatorGain);
    leftOscillatorGain.connect(leftDelay.delayTime);

    this.input.connect(leftDelay);
    leftDelay.connect(this.output);

    /********** Set options **********/
    if (autoStart ?? true) this.start();
  }

  set transposition(nextTransposition: number) {
    const frequency = getFrequencyFromTransposition(nextTransposition);

    this.oscillator.disconnect();
    this.oscillator = new CustomOscillatorNode(this.context, {
      type: 'sawtooth',
      frequency,
    });
    this.oscillator.connect(this.oscillatorOutput);
  }

  start() {
    this.oscillator.start();
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
    // this.leftSimplePitchNode.output.connect(this.output);
    // this.rightSimplePitchNode.output.connect(this.output);

    /********** Set options **********/
    /**
     * FIXME: when transposition is set here, it is also set on the left and
     * right simple pitch nodes, which starts their corresponding oscillators
     * this.start() is called below, it also calls start on the oscillators,
     * throwing the error
     */
    this.transposition = transposition; // TODO: ...

    if (autoStart ?? true) this.start();
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

  start() {
    // starting pitch nodes here will throw an error since they're started with
    // each set transposition() call
    this.crossfade.start();
  }

  setOptions(options: PitchOptions) {
    super.setOptions(options);
  }
}
