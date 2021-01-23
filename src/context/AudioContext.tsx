import React, { createContext, FC, useContext } from 'react';

type TAudioContext = {
  context: AudioContext;
};

const DEFAULT_AUDIO_CONTEXT = {
  context: new window.AudioContext()
};

const AudioContext = createContext<TAudioContext>(DEFAULT_AUDIO_CONTEXT);
AudioContext.displayName = 'AudioContext';

export const AudioContextProvider: FC = ({ children }) => (
  <AudioContext.Provider value={DEFAULT_AUDIO_CONTEXT}>
    {children}
  </AudioContext.Provider>
);

export const useAudioContext = () => useContext(AudioContext);
