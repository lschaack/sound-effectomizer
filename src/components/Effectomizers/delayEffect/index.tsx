import React, { FC } from 'react';

import { EffectConfig } from '../effectConfig';
import { TapeDelayOptions, TapeDelayNode } from 'common/TapeDelayNode';
import { useSoundEffectsContext } from 'context/SoundEffectsContext';

const defaultOptions: TapeDelayOptions = {
  time: 0.1,
  depth: 0.5,
};

export const DelayEffect: FC = () => {
  const { delay, setDelay } = useSoundEffectsContext();

  return (
    <EffectConfig<TapeDelayOptions, typeof TapeDelayNode, TapeDelayNode>
      AudioEffectConstructor={TapeDelayNode}
      effectName="delay"
      effectNode={delay}
      onChange={setDelay}
      defaultOptions={defaultOptions}
      rangeParams={[
        { name: 'time' },
        { name: 'depth' }
      ]}
      radioParams={[]}
    />
  );
};
