import React, { FC } from 'react';

import { useSoundEffectsContext } from 'context/SoundEffectsContext';
import { PitchEffect } from './pitchEffect';
import { DelayEffect } from './delayEffect';
import { VibratoEffect } from './vibratoEffect';
import { FlangerEffect } from './flangerEffect';
import { ReverbEffect } from './reverbEffect';

import parentStyles from '../styles.scss';

export const Effectomizers: FC = () => {
  const {
    setConvolver,
    setFlanger,
    setDelay,
    setPitch,
    setVibrato,
  } = useSoundEffectsContext();

  return (
    <div className={parentStyles.configRows}>
      <ReverbEffect setConvolver={setConvolver}/>
      <FlangerEffect setFlanger={setFlanger} />
      <VibratoEffect setVibrato={setVibrato} />
      <DelayEffect setDelay={setDelay} />
      <PitchEffect setPitch={setPitch} />
    </div>
  );
};
