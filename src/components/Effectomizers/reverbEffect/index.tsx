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

import parentParentStyles from '../../styles.scss'; // TODO: ...

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

type ReverbEffectProps = {
  setConvolver: StateSetter<Maybe<ConvolverNode>>;
}

export const ReverbEffect: FC<ReverbEffectProps> = ({ setConvolver }) => {
  const { context } = useAudioContext();
  const [ convolvers, setConvolvers ] = useState<ConvolverNodeMap>({});

  const convolverInput = useRef<HTMLInputElement>(null);
  const convolverSelect = useRef<HTMLSelectElement>(null);
  const setCurrentConvolver = () => setConvolver(
    convolverInput.current?.checked
      ? convolvers[convolverSelect.current?.value ?? '']
      : undefined
  );

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
    <div className={cx('centeredRow', parentParentStyles.configRow)}>
      <input
        ref={convolverInput}
        id="reverbToggle"
        className={cx('material-icons', 'effectToggle')}
        type="checkbox"
        onChange={setCurrentConvolver}
      />
      <h2><label htmlFor="reverbToggle">reverb</label></h2>
      <select ref={convolverSelect} onChange={setCurrentConvolver}>
        {Object.entries(convolvers).map(([ filename, convolver ], index) => {
          const key = getConvolverKey(index);

          return <option id={key} key={key} value={filename}>{filename}</option>;
        })}
      </select>
    </div>
  );
};
