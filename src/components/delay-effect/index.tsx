import React, { FC } from 'react';

import { StateSetter } from 'src/context/types';
import { EffectConfig } from '../effect-config';
import { DelayOptions, createDelayNode, DelayNode } from './delayNode';

type TProps = {
  setDelay: StateSetter<Maybe<DelayNode>>;
}

const defaultOptions: DelayOptions = {
  time: 0.1,
  depth: 0.5,
};

export const DelayEffect: FC<TProps> = ({ setDelay }) => (
  <EffectConfig<DelayOptions>
    createEffectNode={createDelayNode}
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
