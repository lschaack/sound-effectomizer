import React, { FC } from 'react';

import { StateSetter } from 'context/types';
import { EffectConfig } from '../effectConfig';
import { TapeDelayOptions, TapeDelayNode } from 'common/TapeDelayNode';

type TProps = {
  setDelay: StateSetter<Maybe<TapeDelayNode>>;
}

const defaultOptions: TapeDelayOptions = {
  time: 0.1,
  depth: 0.5,
};

export const DelayEffect: FC<TProps> = ({ setDelay }) => (
  <EffectConfig<TapeDelayOptions, typeof TapeDelayNode, TapeDelayNode>
    AudioEffectConstructor={TapeDelayNode}
    effectName="delay"
    onChange={setDelay}
    defaultOptions={defaultOptions}
    rangeParams={[
      { name: 'time' },
      { name: 'depth' }
    ]}
    radioParams={[]}
  />
);
