import React, {
  createContext,
  FC,
  useCallback,
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
  setConvolver: (node: Maybe<ConvolverNode>) => void;
  convolver: Maybe<ConvolverNode>;
  setFlanger: (node: Maybe<FlangerNode>) => void;
  flanger: Maybe<FlangerNode>;
  setDelay: (node: Maybe<TapeDelayNode>) => void;
  delay: Maybe<TapeDelayNode>;
  setPitch: (node: Maybe<PitchNode>) => void;
  pitch: Maybe<PitchNode>;
  setVibrato: (node: Maybe<VibratoNode>) => void;
  vibrato: Maybe<VibratoNode>;
  outputAnalyser: Maybe<AnalyserNode>;
};

type EffectsState = {
  convolver: Maybe<ConvolverNode>;
  flanger: Maybe<FlangerNode>;
  delay: Maybe<TapeDelayNode>;
  pitch: Maybe<PitchNode>;
  vibrato: Maybe<VibratoNode>;
};

const DEFAULT_SOUND_EFFECT_CONTEXT = {
  setConvolver: () => undefined,
  convolver: undefined,
  setFlanger: () => undefined,
  flanger: undefined,
  setDelay: () => undefined,
  delay: undefined,
  setPitch: () => undefined,
  pitch: undefined,
  setVibrato: () => undefined,
  vibrato: undefined,
  effectChain: undefined,
  outputAnalyser: undefined,
};

const SoundEffectsContext = createContext<TSoundEffectsContext>(DEFAULT_SOUND_EFFECT_CONTEXT);
SoundEffectsContext.displayName = 'SoundEffectsContext';

export const SoundEffectsContextProvider: FC = ({ children }) => {
  const { context } = useAudioContext();

  const outputAnalyser = useMemo(() => context.createAnalyser(), [context]);
  const [ effects, setEffects ] = useState<EffectsState>({
    convolver: undefined,
    flanger: undefined,
    delay: undefined,
    pitch: undefined,
    vibrato: undefined,
  });

  const { convolver, flanger, delay, pitch, vibrato } = effects;

  const getEffectStateSetter = useCallback(
    <TKey extends keyof EffectsState>(nodeKey: TKey) => (
      (nodeValue: EffectsState[TKey]) => {
        // FIXME: this doesn't actually solve the issue of persistent effects on toggle...
        effects[nodeKey]?.disconnect();

        setEffects(oldEffects => ({
          ...oldEffects,
          [nodeKey]: nodeValue
        }));
      }
    ),
    [setEffects] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const setConvolver = getEffectStateSetter('convolver');
  const setFlanger = getEffectStateSetter('flanger');
  const setDelay = getEffectStateSetter('delay');
  const setPitch = getEffectStateSetter('pitch');
  const setVibrato = getEffectStateSetter('vibrato');

  /**
   * FIXME: Steps to reproduce issue:
   * 1. enable reverb, check enabled w/soundbite
   * 2. enable flanger, check both enabled w/soundbite
   * 3. disable reverb, check flanger enabled w/soundbite
   * 4. re-enable reverb -> flanger still enabled, reverb apparently not
   * 5. disable flanger -> reverb now enabled
   */
  const getEffectChain = () => chainAudioNodes(
    pitch,
    vibrato,
    delay,
    flanger,
    convolver,
    outputAnalyser
  );

  // TODO: effectChain doesn't seem to update on initial render, making this necessary
  const [ effectChain, setEffectChain ] = useState<Maybe<AudioIO>>(getEffectChain());

  useEffect(
    () => {
      setEffectChain(getEffectChain());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [convolver, flanger, delay, pitch, vibrato, outputAnalyser]
  );

  return (
    <SoundEffectsContext.Provider
      value={{
        setConvolver,
        convolver,
        setFlanger,
        flanger,
        setDelay,
        delay,
        setPitch,
        pitch,
        setVibrato,
        vibrato,
        effectChain,
        outputAnalyser,
      }}
    >
      {children}
    </SoundEffectsContext.Provider>
  );
};

export const useSoundEffectsContext = () => useContext(SoundEffectsContext);
