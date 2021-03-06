import React, { FC } from 'react';

import { EffectConfig } from '../effectConfig';
import { PitchNode, PitchOptions } from 'common/PitchNode';
import { useSoundEffectsContext } from 'context/SoundEffectsContext';

const defaultOptions: PitchOptions = {
  transposition: 0.85, // TODO:
};

export const PitchEffect: FC = () => {
  const { pitch, setPitch } = useSoundEffectsContext();

  return (
    <EffectConfig<PitchOptions, typeof PitchNode, PitchNode>
      effectName="pitch"
      AudioEffectConstructor={PitchNode}
      effectNode={pitch}
      onChange={setPitch}
      defaultOptions={defaultOptions}
      rangeParams={[
        { name: 'transposition' },
      ]}
      radioParams={[]}
    />
  );
};
