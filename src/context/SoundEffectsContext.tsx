import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { FlangerNode } from 'components/flanger-effect/flangerNode';
import { PitchNode } from 'components/pitch-effect/pitchNode';
import { VibratoNode } from 'components/vibrato-effect/vibratoNode';
import { DelayNode } from 'components/delay-effect/delayNode';
import { AudioIO, chainAudioNodes } from 'components/utils';
import { useAudioContext } from './AudioContext';
import { StateSetter } from './types';

type TSoundEffectsContext = {
  effectChain: Maybe<AudioIO<any>>;
  setConvolver: StateSetter<Maybe<ConvolverNode>>,
  setFlanger: StateSetter<Maybe<FlangerNode>>,
  setDelay: StateSetter<Maybe<DelayNode>>,
  setPitch: StateSetter<Maybe<PitchNode>>,
  setVibrato: StateSetter<Maybe<VibratoNode>>,
  outputAnalyser: Maybe<AnalyserNode>,
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

  const outputAnalyser = useMemo(() => context.createAnalyser(), []);
  const [ convolver, setConvolver ] = useState<ConvolverNode>();
  const [ flanger, setFlanger ] = useState<FlangerNode>();
  const [ delay, setDelay ] = useState<DelayNode>();
  const [ pitch, setPitch ] = useState<PitchNode>();
  const [ vibrato, setVibrato ] = useState<VibratoNode>();
  // TODO: effectChain doesn't seem to update on initial render, making this necessary
  const [ effectChain, setEffectChain ] = useState<Maybe<AudioIO<any>>>(
    chainAudioNodes(convolver, pitch, vibrato, delay, flanger, outputAnalyser)
  );

  useEffect(
    () => setEffectChain(
      chainAudioNodes(pitch, convolver, flanger, vibrato, delay, outputAnalyser)
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
  )
};

export const useSoundEffectsContext = () => useContext(SoundEffectsContext);
