import React, { FC, useEffect, useRef } from 'react';

import styles from './styles.scss';
import { chainAudioNodes } from '../../common/utils/audio';
import { useAudioContext } from 'context/AudioContext';
import { Soundbite as TSoundbite } from 'context/SoundbiteContext';
import { useSoundEffectsContext } from 'context/SoundEffectsContext';

export type SoundbiteProps = {
  soundbite: TSoundbite;
  onSelect: () => void;
};

export const Soundbite: FC<SoundbiteProps> = ({
  soundbite: { buffer, name }, onSelect
}) => {
  const { context } = useAudioContext();
  const { effectChain } = useSoundEffectsContext();
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
