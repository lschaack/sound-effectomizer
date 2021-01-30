import React, { FC, useEffect, useRef, useState } from 'react';
import cx from 'classnames';

import { useSoundEffectsContext } from 'context/SoundEffectsContext';
import { urlToAudioBuffer } from '../../common/utils/audio';
import { PitchEffect } from './pitch-effect';
import { DelayEffect } from './delay-effect';
import { VibratoEffect } from './vibrato-effect';
import { FlangerEffect } from './flanger-effect';

import parentStyles from '../styles.scss';

import gatedPlace from 'assets/GATED-PLACE-E001-M2S.wav';
import megaDiffusor from 'assets/MEGA-DIFFUSOR-E001-M2S.wav';
import miniCaves from 'assets/MINI-CAVES-E001-M2S.wav';
import { useAudioContext } from 'context/AudioContext';

const CONVOLVERS = { gatedPlace, megaDiffusor, miniCaves };

const fetchConvolver = async (context: AudioContext, url: string) => {
  const audioBuffer = await urlToAudioBuffer(context, url);
  const convolver = context.createConvolver();
  convolver.normalize = true; // TODO: make setting?
  convolver.buffer = audioBuffer;

  return convolver;
};

const getConvolverKey = (index: number) => `convolver-${index}`;

export const Effectomizers: FC = () => {
  const { context } = useAudioContext();
  const {
    setConvolver,
    setFlanger,
    setDelay,
    setPitch,
    setVibrato,
  } = useSoundEffectsContext();
  const [ convolvers, setConvolvers ] = useState<ConvolverNode[]>([]);

  const convolverInput = useRef<HTMLInputElement>(null);
  const convolverSelect = useRef<HTMLSelectElement>(null);
  const getCurrentConvolver = () => setConvolver(
    convolverInput.current?.checked
      ? convolvers[Number(convolverSelect.current?.value)]
      : undefined
  );

  // Load default reverbs
  useEffect(() => Object.values(CONVOLVERS).forEach(filename =>
    fetchConvolver(context, filename).then(convolver =>
      setConvolvers(prevConvolvers =>
        prevConvolvers.concat([convolver])
      )
    )
  ), [context]);

  return (
    <div className={parentStyles.configRows}>
      <div className={cx('centeredRow', parentStyles.configRow)}>
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
  );
};
