import React, { FC } from 'react';

import { EffectConfig } from '../effect-config';
import { DelayOptions, createDelayNode, DelayNode } from './delayNode';

type TProps = {
  context: AudioContext;
  setDelay: (delay: Maybe<DelayNode>) => void;
}

const defaultOptions: DelayOptions = {
  time: 0.1,
  depth: 0.5,
};

export const DelayEffect: FC<TProps> = ({ context, setDelay }) => (
  <EffectConfig<DelayOptions>
    context={context}
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
