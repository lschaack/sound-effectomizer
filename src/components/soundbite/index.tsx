import React, { FC, useEffect, useRef } from 'react';
import cx from 'classnames';

import { chainAudioNodes } from '../../common/utils/audio';
import { useAudioContext } from 'context/AudioContext';
import { Soundbite as TSoundbite } from 'context/SoundbiteContext';
import { useSoundEffectsContext } from 'context/SoundEffectsContext';

import styles from './styles.scss';

export type SoundbiteProps = {
  soundbite: TSoundbite;
  onSelect: (selected: TSoundbite) => void;
};

export const Soundbite: FC<SoundbiteProps> = ({
  soundbite, onSelect
}) => {
  const { context } = useAudioContext();
  const { effectChain } = useSoundEffectsContext();
  const source = useRef<AudioBufferSourceNode>();

  const { buffer, name } = soundbite;

  const handleClick = () => {
    onSelect(soundbite);

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
    <button
      className={cx('gridButton', styles.soundbite)}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    >
      <span>{name}</span>
    </button>
  );
};
