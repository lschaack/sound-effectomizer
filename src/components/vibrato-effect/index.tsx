import React, { FC } from 'react';

import { EffectConfig } from '../effect-config';
import { createVibratoNode, VibratoNode, VibratoOptions } from './vibratoNode';

type TProps = {
  context: AudioContext;
  setVibrato: (vibrato: Maybe<VibratoNode>) => void;
}

const defaultOptions: VibratoOptions = {
  transposition: 0.5,
  rate: 0.5,
};

export const VibratoEffect: FC<TProps> = ({ setVibrato, context }) => (
  <EffectConfig<VibratoOptions>
    effectName="vibrato"
    context={context}
    createEffectNode={createVibratoNode}
    onChange={setVibrato}
    defaultOptions={defaultOptions}
    rangeParams={[
      { name: 'transposition' },
      { name: 'rate' },
    ]}
    radioParams={[]}
  />
);
