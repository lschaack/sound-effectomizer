import { urlToAudioBuffer } from 'common/utils/audio';
import React, { createContext, FC, useContext, useState } from 'react';
import { useAudioContext } from './AudioContext';

import { StateSetter } from './types';

export type Soundbite = {
  buffer: AudioBuffer;
  name?: string;
};

type TSoundbiteContext = {
  soundbites: Soundbite[];
  updateSoundbites: StateSetter<Soundbite[]>;
  currentSoundbite: Maybe<Soundbite>;
  setCurrentSoundbite: StateSetter<Maybe<Soundbite>>;
  addSoundbite: (buffer?: AudioBuffer, name?: string) => void;
  addSoundbitesFromUrlMap: (nameToUrl: Record<string, string>) => void;
};

const DEFAULT_SOUNDBITE_CONTEXT = {
  soundbites: [],
  updateSoundbites: () => undefined,
  currentSoundbite: undefined,
  setCurrentSoundbite: () => undefined,
  addSoundbite: () => undefined,
  addSoundbitesFromUrlMap: () => undefined,
};

const SoundbiteContext = createContext<TSoundbiteContext>(DEFAULT_SOUNDBITE_CONTEXT);
SoundbiteContext.displayName = 'SoundbiteContext';

export const SoundbiteContextProvider: FC = ({ children }) => {
  const { context } = useAudioContext();
  const [ soundbites, updateSoundbites ] = useState<Soundbite[]>([]);
  const [ currentSoundbite, setCurrentSoundbite ] = useState<Maybe<Soundbite>>();

  const addSoundbite: TSoundbiteContext['addSoundbite'] = (buffer, name) => {
    if (buffer) updateSoundbites(
      soundbites.concat({ name: name ?? Math.random().toString(), buffer })
    );
  };

  const addSoundbitesFromUrlMap: TSoundbiteContext['addSoundbitesFromUrlMap'] = nameToUrl =>
    // Map { [name]: url } to [{ name, buffer }]
    void Promise.all(Object.entries(nameToUrl).map<Promise<Soundbite>>(([ name, filename ]) =>
      urlToAudioBuffer(context, filename).then(buffer =>
        ({
          name,
          buffer
        })
      ))).then(
        newSoundbites => updateSoundbites(soundbites.concat(newSoundbites))
      );

  return (
    <SoundbiteContext.Provider
      value={{
        soundbites,
        updateSoundbites,
        currentSoundbite,
        setCurrentSoundbite,
        addSoundbite,
        addSoundbitesFromUrlMap
      }}
    >
      {children}
    </SoundbiteContext.Provider>
  );
};

export const useSoundbiteContext = () => useContext(SoundbiteContext);
