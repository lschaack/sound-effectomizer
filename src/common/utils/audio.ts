import { AudioIO } from "common/AudioIO";
import { WINDOW_SIZE } from "common/contants";
import clamp from "lodash/clamp";
import first from "lodash/first";
import last from "lodash/last";

export const normalizeToRange = (min: number, max: number, input: number) =>
  clamp(input, 0, 1) * (max - min) + min;

export const normalizeFromRange = (min: number, max: number, input: number) =>
  (clamp(input, min, max) - min) / (max - min);

export const getFrequencyFromTransposition = (transposition: number) => {
  const t = normalizeToRange(-0.5, 0.5, transposition);
  // original definition from:
  // http://msp.ucsd.edu/techniques/v0.11/book-html/node115.html#fig07.22
  // f = (t - 1) * R / s
  // const windowSizeSamples = WINDOW_SIZE * context.sampleRate;
  // const frequency = t * context.sampleRate / windowSizeSamples;
  // context.sampleRate disappears when using window size in seconds
  return t / WINDOW_SIZE;
};

export const isIO = <TNode extends AudioIO>(node: AudioNode | TNode): node is TNode => (
  node instanceof AudioIO
);

export const mixToDryWet = (mix: number): [number, number] => [1 - mix, mix];

export const transpositionToFrequency = (context: AudioContext, transposition: number) => {
  const windowSizeSamples = context.sampleRate / 30;
  const t = normalizeToRange(-0.5, 0.5, transposition);
  const frequency = t * context.sampleRate / windowSizeSamples;

  return frequency;
};

export const connect = (from: AudioNode | AudioIO, to: AudioNode | AudioIO) => (
  from.connect(isIO(to) ? to.input : to)
);

export const chainAudioNodes = (
  ...nodes: Array<AudioNode | AudioIO | null | undefined>
): Maybe<AudioIO> => {
  const definedNodes = nodes.filter(Boolean) as Array<AudioNode | AudioIO>;

  const input = first(definedNodes);
  const output = last(definedNodes);

  if (!input || !output) {
    console.warn('Returning undefined from chainAudioNodes because no nodes are defined');

    return;
  }

  definedNodes.forEach(
    // only connect to next node if it exists
    (curr, index, nodes) => index + 1 < nodes.length && connect(curr, nodes[index + 1])
  );

  return new AudioIO(
    isIO(input) ? input.input : input,
    isIO(output) ? output.output : output,
  );
};

export const urlToAudioBuffer = async (context: AudioContext, url: string) => {
  const res = await fetch(url);
  const encoded = await res.arrayBuffer();
  const audioData = await context.decodeAudioData(encoded);

  return audioData;
};
