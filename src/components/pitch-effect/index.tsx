import React, { FC } from 'react';
import { StateSetter } from 'src/context/types';

import { EffectConfig } from '../effect-config';
import { PitchOptions, createPitchNode, PitchNode } from './pitchNode';

type TProps = {
  setPitch: StateSetter<Maybe<PitchNode>>;
}

const defaultOptions: PitchOptions = {
  transposition: 0.85, // TODO:
};

export const PitchEffect: FC<TProps> = ({ setPitch }) => (
  <EffectConfig<PitchOptions>
    effectName="pitch"
    createEffectNode={createPitchNode}
    onChange={setPitch}
    defaultOptions={defaultOptions}
    rangeParams={[
      { name: 'transposition' },
    ]}
    radioParams={[]}
  />
);
