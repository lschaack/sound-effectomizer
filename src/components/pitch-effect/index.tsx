import React, { FC } from 'react';

import { EffectConfig } from '../effect-config';
import { PitchOptions, createPitchNode, PitchNode } from './pitchNode';

type TProps = {
  context: AudioContext;
  setPitch: (pitch: Maybe<PitchNode>) => void;
}

const defaultOptions: PitchOptions = {
  transposition: 0.85, // TODO:
};

export const PitchEffect: FC<TProps> = ({ context, setPitch }) => (
  <EffectConfig<PitchOptions>
    effectName="pitch"
    context={context}
    createEffectNode={createPitchNode}
    onChange={setPitch}
    defaultOptions={defaultOptions}
    rangeParams={[
      { name: 'transposition' },
    ]}
    radioParams={[]}
  />
);
