import React, { FC } from 'react';

import { PitchEffect } from './pitchEffect';
import { DelayEffect } from './delayEffect';
import { VibratoEffect } from './vibratoEffect';
import { FlangerEffect } from './flangerEffect';
import { ReverbEffect } from './reverbEffect';

export const Effectomizers: FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <ReverbEffect />
      <FlangerEffect />
      <VibratoEffect />
      <DelayEffect />
      <PitchEffect />
    </div>
  );
};
