import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import cx from 'classnames';

import { normalizeFromRange, normalizeToRange } from '../utils';
import max from 'lodash/max';
import { easeInCubic } from 'utils/easingFunctions';

import styles from './styles.scss';
import styleConsts from '../consts.scss';

const DECAY_RATE = 0.005; // in normalized volume units per millisecond
const DECAY_TIME = 1 / DECAY_RATE; // in ms
const volumeToDiameter = (volume: number) => `${normalizeToRange(
  parseInt(styleConsts.micIconDiameter, 10),
  parseInt(styleConsts.soundbiteSize, 10),
  volume
)}rem`;

type MicrophoneProps = {
  context: AudioContext;
  onMicSourceChange: (arg0: Maybe<MediaStreamAudioSourceNode>) => void;
}

// TODO: make focus-able
export const MicrophoneInput: FC<MicrophoneProps> = ({
  context,
  onMicSourceChange: handleMicSourceChange
}) => {
  const [ enabled, setEnabled ] = useState(false);
  // TODO: micStream tests could probably be switched out for enabled
  const [ micStream, setMicStream ] = useState<MediaStream>();
  const [ analyserNode ] = useState(context.createAnalyser());
  const lastPeak = useRef({
    timestamp: 0,
    volume: 0,
  });
  const middle = useRef<HTMLDivElement>(null);

  const toggleMicrophone = () => setEnabled(!enabled); 

  useEffect(
    () => {
      if (enabled) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(mediaStream => {
            // "temp" refers to assignment, since this is usually accessed through micSource
            const tempMicSource = context.createMediaStreamSource(mediaStream);
            tempMicSource.connect(analyserNode);

            handleMicSourceChange(tempMicSource);
            setMicStream(mediaStream);
          });
      } else {
        micStream?.getAudioTracks()[0].stop();
        /*
         * Setting to undefined allows the node to be reconnected if re-enabled, since otherwise
         * the setter would receive the same object reference, and the effect which connects the
         * node to context.destination wouldn't run
         */
        handleMicSourceChange(undefined);
      }
    },
    [enabled, context, handleMicSourceChange] // eslint-disable-line
  );

  // Define animation
  const step = useCallback((timestamp) => {
    if (micStream && middle.current) {
      // TODO: try smaller array sizes since this doesn't need to be precise
      const timeDomain = new Uint8Array(1000);
      analyserNode.getByteTimeDomainData(timeDomain);

      const volume = normalizeFromRange(128, 255, max(timeDomain) ?? 0);
      const msSinceLastPeak = timestamp - lastPeak.current.timestamp;
      const decay = DECAY_RATE * msSinceLastPeak;
      // TODO: ease the time rather than the output
      const decayedVolume = lastPeak.current.volume - easeInCubic(normalizeFromRange(0, DECAY_TIME, msSinceLastPeak)) * decay;

      let diameter: string;

      if (volume >= decayedVolume) {
        lastPeak.current.volume = volume;
        lastPeak.current.timestamp = timestamp;

        diameter = volumeToDiameter(volume);
      } else {
        diameter = volumeToDiameter(decayedVolume);
      }

      middle.current.style.width = diameter;
      middle.current.style.height = diameter;

      requestAnimationFrame(step);
    }
  }, [micStream]); // eslint-disable-line

  // Enable animation
  useEffect(() => {
    let requestId: number;
    if (micStream && middle.current) requestId = window.requestAnimationFrame(step);

    return () => { if (requestId) window.cancelAnimationFrame(requestId); };
  }, [micStream]); // eslint-disable-line

  return (
    <div className={styles.outer}>
      <div className={styles.middle} ref={middle}>
        <div className={cx(styles.inner, 'material-icons')} onClick={toggleMicrophone}>
          {enabled ? 'mic' : 'mic_none'}
        </div>
      </div>
    </div>
    // <div className={cx('centeredRow', styles.configRow)}>
    //   <input
    //     id="microphoneToggle"
    //     className={cx('material-icons', 'effectToggle')}
    //     type="checkbox"
    //     onChange={toggleMicrophone}
    //     checked={enabled}
    //   />
    //   <h2><label htmlFor="microphoneToggle">microphone</label></h2>
    // </div>
  );
};
