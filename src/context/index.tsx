import React, { FC } from 'react';
import { AudioContextProvider } from './AudioContext';
import { SoundbiteContextProvider } from './SoundbiteContext';
import { SoundEffectsContextProvider } from './SoundEffectsContext';

type ContextProps = {};

export const Context: FC<ContextProps> = ({ children }) => (
  <AudioContextProvider>
    <SoundbiteContextProvider>
      <SoundEffectsContextProvider>
        {children}
      </SoundEffectsContextProvider>
    </SoundbiteContextProvider>
  </AudioContextProvider>
);
