import React, { FC, useEffect, useRef, useState } from 'react';
import cx from 'classnames';

import { urlToAudioBuffer } from '../../../common/utils/audio';

import gatedPlace from 'assets/GATED-PLACE-E001-M2S.wav';
import megaDiffusor from 'assets/MEGA-DIFFUSOR-E001-M2S.wav';
import miniCaves from 'assets/MINI-CAVES-E001-M2S.wav';
import { useAudioContext } from 'context/AudioContext';
import { StateSetter } from 'context/types';

import parentParentStyles from '../../styles.scss'; // TODO: ...

const CONVOLVERS = { gatedPlace, megaDiffusor, miniCaves };

const fetchConvolver = async (context: AudioContext, url: string) => {
  const audioBuffer = await urlToAudioBuffer(context, url);
  const convolver = context.createConvolver();
  convolver.normalize = true; // TODO: make setting?
  convolver.buffer = audioBuffer;

  return convolver;
};

const getConvolverKey = (index: number) => `convolver-${index}`;

type ReverbEffectProps = {
  setConvolver: StateSetter<Maybe<ConvolverNode>>;
}

export const ReverbEffect: FC<ReverbEffectProps> = ({ setConvolver }) => {
  const { context } = useAudioContext();
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
    <div className={cx('centeredRow', parentParentStyles.configRow)}>
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
  );
};
