import { AudioIO } from "common/AudioIO";
import { A4_FREQUENCY } from "common/contants";
import { CustomOscillatorNode, CustomOscillatorOptions } from "common/CustomOscillatorNode";

export type CrossfadeOptions = CustomOscillatorOptions & {
  leftInput?: AudioNode | AudioIO;
  rightInput?: AudioNode | AudioIO;
}

export class CrossfadeNode extends AudioIO {
  private oscillator: CustomOscillatorNode;
  private leftGain: GainNode;
  private rightGain: GainNode;
  private currLeftInput: Maybe<AudioNode | AudioIO>;
  private currRightInput: Maybe<AudioNode | AudioIO>;

  constructor(context: AudioContext, options: CrossfadeOptions) {
    /********** Base instantiation **********/
    const IO = context.createGain(); // this node acts as both input and output
    super(IO, IO);
    
    /********** Setup **********/
    const output = context.createGain();

    this.oscillator = new CustomOscillatorNode(context, options);
    const leftPhaseAdjuster = context.createDelay();
    const rightPhaseAdjuster = context.createDelay();

    const leftOscillatorOutput = context.createGain();
    const rightOscillatorOutput = context.createGain();

    this.leftGain = context.createGain();
    this.rightGain = context.createGain();

    // Set base gain to 0 to oscillate from 0 to 1
    this.leftGain.gain.value = 0;
    this.rightGain.gain.value = 0;

    /********** Connect **********/
    // left/right inputs connect when options are set (below)
    this.oscillator.connect(leftPhaseAdjuster);
    leftPhaseAdjuster.connect(leftOscillatorOutput);
    this.oscillator.connect(rightPhaseAdjuster);
    rightPhaseAdjuster.connect(rightOscillatorOutput);

    leftOscillatorOutput.connect(this.leftGain.gain);
    rightOscillatorOutput.connect(this.rightGain.gain);

    /**
     * TODO: Figure out what the next line means again
     * TODO: run w/ one node, adjust until muted during gap discontinuity
     */
    this.leftGain.connect(output);
    this.rightGain.connect(output);

    /********** Set options **********/
    const { leftInput, rightInput, frequency, autoStart } = options;
    this.leftInput = leftInput;
    this.rightInput = rightInput;
    this.frequency = frequency ?? A4_FREQUENCY;
    if (autoStart ?? true) this.oscillator.start();
  }

  set leftInput(input: Maybe<AudioNode | AudioIO>) {
    this.currLeftInput?.disconnect();
    this.currLeftInput = input;
    this.currLeftInput?.connect(this.leftGain);
  }

  set rightInput(input: Maybe<AudioNode | AudioIO>) {
    this.currRightInput?.disconnect();
    this.currRightInput = input;
    this.currRightInput?.connect(this.rightGain);
  }

  set frequency(nextFrequency: number) {
    this.oscillator.frequency = nextFrequency;
  }

  start() {
    this.oscillator.start();
  }
}
