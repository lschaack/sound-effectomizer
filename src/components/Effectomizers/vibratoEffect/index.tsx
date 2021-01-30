import React, { FC } from 'react';
import { StateSetter } from 'context/types';

import { EffectConfig } from '../effectConfig';
import { VibratoNode, VibratoOptions } from 'common/VibratoNode';

type TProps = {
  setVibrato: StateSetter<Maybe<VibratoNode>>;
}

const defaultOptions: VibratoOptions = {
  transposition: 0.5,
  rate: 0.5,
};

export const VibratoEffect: FC<TProps> = ({ setVibrato }) => (
  <EffectConfig<VibratoOptions, typeof VibratoNode, VibratoNode>
    effectName="vibrato"
    AudioEffectConstructor={VibratoNode}
    onChange={setVibrato}
    defaultOptions={defaultOptions}
    rangeParams={[
      { name: 'transposition' },
      { name: 'rate' },
    ]}
    radioParams={[]}
  />
);
