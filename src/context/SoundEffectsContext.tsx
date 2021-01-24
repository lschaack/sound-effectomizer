import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { chainAudioNodes } from 'common/utils/audio';
import { useAudioContext } from './AudioContext';
import { StateSetter } from './types';
import { FlangerNode } from 'common/FlangerNode';
import { TapeDelayNode } from 'common/TapeDelayNode';
import { PitchNode } from 'common/PitchNode';
import { VibratoNode } from 'common/VibratoNode';
import { AudioIO } from 'common/AudioIO';

type TSoundEffectsContext = {
  effectChain: Maybe<AudioIO>;
  setConvolver: StateSetter<Maybe<ConvolverNode>>;
  setFlanger: StateSetter<Maybe<FlangerNode>>;
  setDelay: StateSetter<Maybe<TapeDelayNode>>;
  setPitch: StateSetter<Maybe<PitchNode>>;
  setVibrato: StateSetter<Maybe<VibratoNode>>;
  outputAnalyser: Maybe<AnalyserNode>;
};

const DEFAULT_SOUND_EFFECT_CONTEXT = {
  setConvolver: () => undefined,
  setFlanger: () => undefined,
  setDelay: () => undefined,
  setPitch: () => undefined,
  setVibrato: () => undefined,
  effectChain: undefined,
  outputAnalyser: undefined,
};

const SoundEffectsContext = createContext<TSoundEffectsContext>(DEFAULT_SOUND_EFFECT_CONTEXT);
SoundEffectsContext.displayName = 'SoundEffectsContext';

export const SoundEffectsContextProvider: FC = ({ children }) => {
  const { context } = useAudioContext();

  const outputAnalyser = useMemo(() => context.createAnalyser(), [context]);
  const [ convolver, setConvolver ] = useState<ConvolverNode>();
  const [ flanger, setFlanger ] = useState<FlangerNode>();
  const [ delay, setDelay ] = useState<TapeDelayNode>();
  const [ pitch, setPitch ] = useState<PitchNode>();
  const [ vibrato, setVibrato ] = useState<VibratoNode>();
  // TODO: effectChain doesn't seem to update on initial render, making this necessary
  const [ effectChain, setEffectChain ] = useState<Maybe<AudioIO>>(
    chainAudioNodes(convolver, pitch, vibrato, delay, flanger, outputAnalyser)
  );

  useEffect(
    () => setEffectChain(
      chainAudioNodes(convolver, pitch, vibrato, delay, flanger, outputAnalyser)
    ),
    [convolver, flanger, delay, pitch, vibrato, outputAnalyser]
  );

  return (
    <SoundEffectsContext.Provider
      value={{
        setConvolver,
        setFlanger,
        setDelay,
        setPitch,
        setVibrato,
        effectChain,
        outputAnalyser,
      }}
    >
      {children}
    </SoundEffectsContext.Provider>
  );
};

export const useSoundEffectsContext = () => useContext(SoundEffectsContext);
