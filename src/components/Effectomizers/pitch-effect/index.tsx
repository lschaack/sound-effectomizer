import React, { FC } from 'react';
import { StateSetter } from 'context/types';

import { EffectConfig } from '../effect-config';
import { PitchNode, PitchOptions } from 'common/PitchNode';

type TProps = {
  setPitch: StateSetter<Maybe<PitchNode>>;
}

const defaultOptions: PitchOptions = {
  transposition: 0.85, // TODO:
};

export const PitchEffect: FC<TProps> = ({ setPitch }) => (
  <EffectConfig<PitchOptions, typeof PitchNode, PitchNode>
    effectName="pitch"
    AudioEffectConstructor={PitchNode}
    onChange={setPitch}
    defaultOptions={defaultOptions}
    rangeParams={[
      { name: 'transposition' },
    ]}
    radioParams={[]}
  />
);
