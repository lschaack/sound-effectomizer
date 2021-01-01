import React, {
  FC,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  KeyboardEventHandler
} from 'react';

import cx from 'classnames';

import { Soundbite } from './soundbite';
import { FileSelector } from './file-selector';
import { AudioIO, chainAudioNodes, urlToAudioBuffer } from './utils';
import { FlangerEffect } from './flanger-effect';
import { DelayEffect } from './delay-effect';
import { PitchEffect } from './pitch-effect';
import { Oscilloscope } from './oscilloscope';
import { VibratoEffect } from './vibrato-effect';
import { MicrophoneInput } from './microphone-input';
import { SoundbiteEditor } from './soundbite-editor';

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

import gatedPlace from 'assets/GATED-PLACE-E001-M2S.wav';
import megaDiffusor from 'assets/MEGA-DIFFUSOR-E001-M2S.wav';
import miniCaves from 'assets/MINI-CAVES-E001-M2S.wav';
import { Context } from 'context';
import { Soundbite as TSoundbite, useSoundbiteContext } from 'context/SoundbiteContext';
import { useSoundEffectsContext } from 'context/SoundEffectsContext';

const MP3_SRCS = {
  elegiac, bulbous, yikes, oof, aorrrrer, arooroorooroo, cronch, crybaby, mrrhrr, roo,
  // euuhuh, rruuuh, grrr, heaghh, wohh, sleepyBork,
};

const CONVOLVERS = { gatedPlace, megaDiffusor, miniCaves };

const context = new window.AudioContext();

const fetchConvolver = async (context: AudioContext, url: string) => {
  const audioBuffer = await urlToAudioBuffer(context, url);
  const convolver = context.createConvolver();
  convolver.normalize = true; // TODO: make setting?
  convolver.buffer = audioBuffer;

  return convolver;
};

const getConvolverKey = (index: number) => `convolver-${index}`;

const playOnKeydown: KeyboardEventHandler = event => {
  const numKey = event.keyCode - 48;

  if (numKey >= 0 && numKey < 10) {
    const element = document.querySelector(
      `.${styles.soundboard} > button:nth-of-type(${numKey})`
    );

    if (element instanceof HTMLElement) element.click();
  }
};

export const App: FC = () => (
  <Context>
    <SoundEffectomizer />
  </Context>
);

// TODO: make this only handle input, separate effectChain
const SoundEffectomizer: FC = () => {
  const { soundbites, addSoundbite, addSoundbitesFromUrlMap } = useSoundbiteContext();
  // const [ soundbites, setSoundbites ] = useState<SoundbiteProps[]>([]);
  const [ convolvers, setConvolvers ] = useState<ConvolverNode[]>([]);

  const outputAnalyser = useMemo(() => context.createAnalyser(), []);

  const {
    setConvolver,
    setFlanger,
    setDelay,
    setPitch,
    setVibrato,
    effectChain,
  } = useSoundEffectsContext();

  const [ currentBufferIndex, setCurrentBufferIndex ] = useState(0);

  const convolverInput = useRef<HTMLInputElement>(null);
  const convolverSelect = useRef<HTMLSelectElement>(null);
  const getCurrentConvolver = () => setConvolver(
    convolverInput.current?.checked
      ? convolvers[Number(convolverSelect.current?.value)]
      : undefined
  );

  // Load default soundbites
  useEffect(() => addSoundbitesFromUrlMap(MP3_SRCS), []);

  // Load default reverbs
  useEffect(() => Object.values(CONVOLVERS).forEach(filename =>
    fetchConvolver(context, filename).then(convolver =>
      setConvolvers(prevConvolvers =>
        prevConvolvers.concat([convolver])
      )
    )
  ), []);

  const connectMicSourceToOutput = useCallback((source: Maybe<MediaStreamAudioSourceNode>) => {
    if (source) {
      context.resume();
      chainAudioNodes(source, effectChain, context.destination);
    }
  }, [effectChain]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.configRows}>
          <div className={cx('centeredRow', styles.configRow)}>
            <input
              ref={convolverInput}
              id="reverbToggle"
              className={cx('material-icons', 'effectToggle')}
              type="checkbox"
              onChange={getCurrentConvolver}
            />
            <h2><label htmlFor="reverbToggle">reverb</label></h2>
            <select ref={convolverSelect} onChange={getCurrentConvolver}>
              {convolvers.map((_, index) => {
                const key = getConvolverKey(index);

                return <option id={key} key={key} value={index}>{key}</option>;
              })}
            </select>
          </div>
          <FlangerEffect setFlanger={setFlanger} />
          <VibratoEffect setVibrato={setVibrato} />
          <DelayEffect setDelay={setDelay} />
          <PitchEffect setPitch={setPitch} />
        </div>
        <div
          className={styles.soundboard}
          // style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(soundbites.length))}, minMax(7em, 1fr))` }}
          // style={{ gridTemplateColumns: `repeat(auto-fit, minmax(7em, 1fr))` }}
          // onKeyDown={playOnKeydown} // TODO: potentially re-enable
          tabIndex={-1}
        >
          <Oscilloscope analyser={outputAnalyser} />
          <MicrophoneInput context={context} onMicSourceChange={connectMicSourceToOutput} />
          {soundbites.map((soundbite, index) =>
            <Soundbite
              key={`soundbite-${index}`}
              onSelect={() => setCurrentBufferIndex(index)}
              soundbite={soundbite}
            />)
          }
          <FileSelector context={context} onSelect={addSoundbite} />
          {/* <SoundbiteEditor
            context={context}
            buffer={soundbites[currentBufferIndex]?.buffer}
            onChange={buffer => {
              if (soundbites[currentBufferIndex]) {
                console.log(
                  'setting buffer with duration',
                  soundbites[currentBufferIndex].buffer.duration,
                  'to buffer with duration',
                  buffer.duration
                );

                // soundbites[currentBufferIndex].buffer = buffer;
                // setSoundbites(soundbites);
                soundbites[currentBufferIndex].buffer = buffer;
                setSoundbites(soundbites.map((soundbite, index) => (
                  index === currentBufferIndex
                    ? { ...soundbite, ...getSoundbiteProps(buffer) }
                    : soundbite
                )));
              }
            }}
          /> */}
        </div>
      </div>
    </div>
  );
};
