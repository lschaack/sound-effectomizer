import React, { FC } from 'react';

import { EffectConfig } from '../effect-config';
import { FlangerOptions, createFlangerNode, FlangerNode } from './flangerNode';

type TProps = {
  context: AudioContext;
  setFlanger: (flanger: Maybe<FlangerNode>) => void;
}

const defaultOptions: FlangerOptions = {
  time: 0.5,
  speed: 0.5,
  depth: 0.9,
  feedback: 0.9,
  wave: 'sine',
  mix: 0.5,
};

export const FlangerEffect: FC<TProps> = ({ context, setFlanger }) => (
  <EffectConfig<FlangerOptions>
    context={context}
    createEffectNode={createFlangerNode}
    effectName="flanger"
    onChange={setFlanger}
    defaultOptions={defaultOptions}
    rangeParams={[
      { name: 'time' },
      { name: 'speed' },
      { name: 'depth' },
      { name: 'feedback' },
      { name: 'mix' },
    ]}
    radioParams={[
      {
        name: 'wave',
        value: 'sine',
      },
      {
        name: 'wave',
        value: 'triangle',
      },
      {
        name: 'wave',
        value: 'square',
      },
      {
        name: 'wave',
        value: 'sawtooth',
      },
    ]}
  />
);
