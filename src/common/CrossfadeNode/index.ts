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
    this.oscillator = new CustomOscillatorNode(context, options);
    // left needs nothing
    // right needs to go to a -1 gain which is joined w/a constant source 1 to
    // "reverse" the signal on the same range
    const rightSignalInverter = context.createGain();
    // invert the signal to run in reverse on a range of [-1, 0]
    rightSignalInverter.gain.value = -1;
    // when joined w/reverse signal inverter output, shift its range to [0, 1]
    const rightRangeShifter = context.createConstantSource();
    rightRangeShifter.start();

    const leftOscillatorOutput = context.createGain();
    const rightOscillatorOutput = context.createGain();
    const rightJoiner = context.createGain();

    this.leftGain = context.createGain();
    this.rightGain = context.createGain();

    // Set base gain to 0 to oscillate from 0 to 1
    this.leftGain.gain.value = 0;
    this.rightGain.gain.value = 0;

    /********** Connect **********/
    // left/right inputs connect when options are set (below)
    this.oscillator.connect(leftOscillatorOutput);
    this.oscillator.connect(rightSignalInverter);
    // if I'm right (which...probably not) then this should effectively invert
    // the oscillator signal to run "backwards" on the same range ([0, 1])
    rightSignalInverter.connect(rightJoiner);
    rightRangeShifter.connect(rightJoiner);
    rightJoiner.connect(rightOscillatorOutput);

    leftOscillatorOutput.connect(this.leftGain.gain);
    rightOscillatorOutput.connect(this.rightGain.gain);

    /**
     * TODO: Figure out what the next line means again
     * TODO: run w/ one node, adjust until muted during gap discontinuity
     */
    this.leftGain.connect(this.output);
    this.rightGain.connect(this.output);

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

  start(when = 0) {
    this.oscillator.start(when);
  }
}
