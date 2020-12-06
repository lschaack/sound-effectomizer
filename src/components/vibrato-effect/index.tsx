import React, { FC } from 'react';
import { StateSetter } from 'src/context/types';

import { EffectConfig } from '../effect-config';
import { createVibratoNode, VibratoNode, VibratoOptions } from './vibratoNode';

type TProps = {
  setVibrato: StateSetter<Maybe<VibratoNode>>;
}

const defaultOptions: VibratoOptions = {
  transposition: 0.5,
  rate: 0.5,
};

export const VibratoEffect: FC<TProps> = ({ setVibrato }) => (
  <EffectConfig<VibratoOptions>
    effectName="vibrato"
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
