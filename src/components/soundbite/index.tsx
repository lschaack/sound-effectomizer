import React, { FC, useEffect, useRef } from 'react';

import styles from './styles.scss';
import { AudioIO, isIO, chainAudioNodes } from '../utils';

export type SoundbiteProps = {
  context: AudioContext;
  buffer: AudioBuffer;
  effectChain?: AudioIO<any>;
  name?: string;
  onSelect: () => void;
};

export const Soundbite: FC<SoundbiteProps> = ({
  buffer, name, context, effectChain, onSelect
}) => {
  const source = useRef<AudioBufferSourceNode>();

  const handleClick = () => {
    onSelect();

    if (context.state === 'suspended') context.resume();

    if (buffer) {
      source.current?.stop();

      source.current = context.createBufferSource();
      source.current.buffer = buffer;

      chainAudioNodes(source.current, effectChain, context.destination);

      source.current.start();
    }
  };

  const handleRightClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault();
    source.current?.stop();
  };

  useEffect(() => {
    source.current?.disconnect();
    chainAudioNodes(source.current, effectChain, context.destination);
  }, [effectChain]); // eslint-disable-line

  return (
    <button className={styles.soundbite} onClick={handleClick} onContextMenu={handleRightClick}>
      <span>{name}</span>
    </button>
  );
};
