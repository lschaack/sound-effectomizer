import React, { FC } from 'react';

import { EffectConfig } from '../effectConfig';
import { FlangerNode, FlangerOptions } from 'common/FlangerNode';
import { useSoundEffectsContext } from 'context/SoundEffectsContext';

const defaultOptions: FlangerOptions = {
  time: 0.5,
  speed: 0.5,
  depth: 0.9,
  feedback: 0.9,
  wave: 'sine',
  mix: 0.5,
};

export const FlangerEffect: FC = () => {
  const { flanger, setFlanger } = useSoundEffectsContext(); 

  return (
    <EffectConfig<FlangerOptions, typeof FlangerNode, FlangerNode>
      AudioEffectConstructor={FlangerNode}
      effectName="flanger"
      effectNode={flanger}
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
};
