import React, { FC } from 'react';
import { StateSetter } from 'context/types';

import { EffectConfig } from '../effectConfig';
import { FlangerNode, FlangerOptions } from 'common/FlangerNode';

type TProps = {
  setFlanger: StateSetter<Maybe<FlangerNode>>;
}

const defaultOptions: FlangerOptions = {
  time: 0.5,
  speed: 0.5,
  depth: 0.9,
  feedback: 0.9,
  wave: 'sine',
  mix: 0.5,
};

export const FlangerEffect: FC<TProps> = ({ setFlanger }) => (
  <EffectConfig<FlangerOptions, typeof FlangerNode, FlangerNode>
    AudioEffectConstructor={FlangerNode}
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
