import React, { FC, useEffect, useRef, useState } from 'react';
import cx from 'classnames';

import { urlToAudioBuffer } from '../../../common/utils/audio';

import chateauDeLogneOutside from 'assets/IMreverbs/Chateau de Logne, Outside.wav';
import higlyDampedLargeRoom from 'assets/IMreverbs/Highly Damped Large Room.wav';
import stNicolaesChurch from 'assets/IMreverbs/St Nicolaes Church.wav';
import scalaMilanOperaHall from 'assets/IMreverbs/Scala Milan Opera Hall.wav';
import smallDrumRoom from 'assets/IMreverbs/Small Drum Room.wav';
import rubyRoom from 'assets/IMreverbs/Ruby Room.wav';
import { useAudioContext } from 'context/AudioContext';
import { StateSetter } from 'context/types';
import { useSoundEffectsContext } from 'context/SoundEffectsContext';

const CONVOLVERS = {
  chateauDeLogneOutside,
  higlyDampedLargeRoom,
  stNicolaesChurch,
  scalaMilanOperaHall,
  smallDrumRoom,
  rubyRoom,
};

const fetchConvolver = async (context: AudioContext, url: string) => {
  const audioBuffer = await urlToAudioBuffer(context, url);
  const convolver = context.createConvolver();
  convolver.normalize = true; // TODO: make setting?
  convolver.buffer = audioBuffer;

  return convolver;
};

const getConvolverKey = (index: number) => `convolver-${index}`;

type ConvolverNodeMap = Record<string, ConvolverNode>;

export const ReverbEffect: FC = () => {
  const { context } = useAudioContext();
  const { setConvolver } = useSoundEffectsContext();
  const [ convolvers, setConvolvers ] = useState<ConvolverNodeMap>({});

  const convolverInput = useRef<HTMLInputElement>(null);
  const convolverSelect = useRef<HTMLSelectElement>(null);
  const setCurrentConvolver = () => {
    convolvers[convolverSelect.current?.value ?? ''].disconnect();

    setConvolver(
      convolverInput.current?.checked
        ? convolvers[convolverSelect.current?.value ?? '']
        : undefined
    );
  };

  // Load default reverbs
  useEffect(() => Object.entries(CONVOLVERS).forEach(([name, filename]) =>
    fetchConvolver(context, filename).then(convolver =>
      setConvolvers(prevConvolvers => ({
        ...prevConvolvers,
        [name]: convolver
      }))
    )
  ), [context]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', columnGap: '1em' }}>
      <input
        ref={convolverInput}
        id="reverbToggle"
        className={cx('material-icons', 'effectToggle')}
        type="checkbox"
        onChange={setCurrentConvolver}
      />
      <label htmlFor="reverbToggle" style={{ cursor: "pointer" }}>
        <h2>reverb</h2>
      </label>
      <select ref={convolverSelect} onChange={setCurrentConvolver}>
        {Object.entries(convolvers).map(([ filename, convolver ], index) => {
          const key = getConvolverKey(index);

          return <option id={key} key={key} value={filename}>{filename}</option>;
        })}
      </select>
    </div>
  );
};
