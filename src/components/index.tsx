import React, {
  FC,
  useState,
  useEffect,
  useCallback,
  KeyboardEventHandler
} from 'react';

import { Soundbite } from './soundbite';
import { FileSelector } from './fileSelector';
import { chainAudioNodes } from '../common/utils/audio';
import { Oscilloscope } from './oscilloscope';
import { MicrophoneInput } from './microphoneInput';
import { SoundbiteEditor } from './soundbiteEditor';

import styles from './styles.scss';

import elegiac from 'assets/elegiac_en_us_1.mp3';
import bulbous from 'assets/bulbous_en_us_1.mp3';
import yikes from 'assets/yikes_en_us_1.mp3';
import oof from 'assets/oof_en_us_1.mp3';

import aorrrrer from 'assets/aorrrrer.mp3';
import arooroorooroo from 'assets/arooroorooroo.mp3';
import cronch from 'assets/cronch.mp3';
import crybaby from 'assets/crybaby.mp3';
import mrrhrr from 'assets/mrrhrr.mp3';
import roo from 'assets/roo.mp3';
// import euuhuh from 'assets/euuhuh.mp3';
// import grrr from 'assets/grrr.mp3';
// import heaghh from 'assets/heaghh.mp3';
// import rruuuh from 'assets/rruuuh.mp3';
// import sleepyBork from 'assets/sleepy_bork.mp3';
// import wohh from 'assets/wohh.mp3';

import { Context } from 'context';
import { useSoundbiteContext } from 'context/SoundbiteContext';
import { useSoundEffectsContext } from 'context/SoundEffectsContext';
import { Effectomizers } from './Effectomizers';
import { useAudioContext } from 'context/AudioContext';
import { ThemePicker } from './ThemePicker';

const MP3_SRCS = {
  elegiac, bulbous, yikes, oof, aorrrrer, arooroorooroo, cronch, crybaby, mrrhrr, roo,
  // euuhuh, rruuuh, grrr, heaghh, wohh, sleepyBork,
};

export const App: FC = () => (
  <Context>
    <SoundEffectomizer />
  </Context>
);

// TODO: make this only handle input, separate effectChain
const SoundEffectomizer: FC = () => {
  const { context } = useAudioContext();
  const {
    soundbites,
    addSoundbite,
    addSoundbitesFromUrlMap,
    currentSoundbite,
    setCurrentSoundbite
  } = useSoundbiteContext();

  const { effectChain, outputAnalyser } = useSoundEffectsContext();

  const [ currentBufferIndex, setCurrentBufferIndex ] = useState(0);

  // Load default soundbites
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => addSoundbitesFromUrlMap(MP3_SRCS), []);

  const connectMicSourceToOutput = useCallback((source: Maybe<MediaStreamAudioSourceNode>) => {
    if (source) {
      context.resume();
      chainAudioNodes(source, effectChain, context.destination);
    }
  }, [context, effectChain]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* <ThemePicker /> */}
        <Effectomizers />
        <div
          className={styles.soundboard}
          tabIndex={-1}
        >
          <Oscilloscope analyser={outputAnalyser} />
          <MicrophoneInput context={context} onMicSourceChange={connectMicSourceToOutput} />
          {soundbites.map((soundbite, index) =>
            <Soundbite
              key={`soundbite-${index}`}
              onSelect={setCurrentSoundbite}
              soundbite={soundbite}
            />)
          }
          <FileSelector context={context} onSelect={addSoundbite} />
          {/* <SoundbiteEditor
            context={context}
            buffer={soundbites[currentBufferIndex]?.buffer}
            onChange={() => undefined}
          /> */}
        </div>
      </div>
    </div>
  );
};
