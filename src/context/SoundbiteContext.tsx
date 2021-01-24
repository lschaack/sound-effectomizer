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
  addSoundbite: (buffer?: AudioBuffer, name?: string) => void;
  addSoundbitesFromUrlMap: (nameToUrl: Record<string, string>) => void;
};

const DEFAULT_SOUNDBITE_CONTEXT = {
  soundbites: [],
  updateSoundbites: () => undefined,
  addSoundbite: () => undefined,
  addSoundbitesFromUrlMap: () => undefined,
};

const SoundbiteContext = createContext<TSoundbiteContext>(DEFAULT_SOUNDBITE_CONTEXT);
SoundbiteContext.displayName = 'SoundbiteContext';

export const SoundbiteContextProvider: FC = ({ children }) => {
  const { context } = useAudioContext();
  const [ soundbites, updateSoundbites ] = useState<Soundbite[]>([]);

  const addSoundbite: TSoundbiteContext['addSoundbite'] = (buffer, name) => {
    if (buffer) updateSoundbites(
      soundbites.concat({ name: name ?? Math.random().toString(), buffer })
    );
  };

  const addSoundbitesFromUrlMap: TSoundbiteContext['addSoundbitesFromUrlMap'] = async nameToUrl =>
    // Map { [name]: url } to [{ name, buffer }]
    void updateSoundbites(soundbites.concat(
      await Promise.all(Object.entries(nameToUrl).map<Promise<Soundbite>>(
        async ([ name, filename ]) => ({
          name,
          buffer: await urlToAudioBuffer(context, filename)
        })
      )))
    );

  return (
    <SoundbiteContext.Provider
      value={{ soundbites, updateSoundbites, addSoundbite, addSoundbitesFromUrlMap }}
    >
      {children}
    </SoundbiteContext.Provider>
  );
};

export const useSoundbiteContext = () => useContext(SoundbiteContext);
