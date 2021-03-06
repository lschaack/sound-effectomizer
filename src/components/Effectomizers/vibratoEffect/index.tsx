import React, { FC } from 'react';
import { StateSetter } from 'context/types';

import { EffectConfig } from '../effectConfig';
import { VibratoNode, VibratoOptions } from 'common/VibratoNode';
import { useSoundEffectsContext } from 'context/SoundEffectsContext';

const defaultOptions: VibratoOptions = {
  transposition: 0.5,
  rate: 0.5,
};

export const VibratoEffect: FC = () => {
  const { vibrato, setVibrato } = useSoundEffectsContext();

  return (
    <EffectConfig<VibratoOptions, typeof VibratoNode, VibratoNode>
      effectName="vibrato"
      AudioEffectConstructor={VibratoNode}
      effectNode={vibrato}
      onChange={setVibrato}
      defaultOptions={defaultOptions}
      rangeParams={[
        { name: 'transposition' },
        { name: 'rate' },
      ]}
      radioParams={[]}
    />
  );
};
