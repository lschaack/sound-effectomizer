import React, { DragEventHandler, FC, useCallback, useMemo, useRef, useState } from 'react';
import cx from 'classnames';

import clamp from 'lodash/clamp';
import debounce from 'lodash/debounce';
import range from 'lodash/range';

import styles from './styles.scss';

const { floor } = Math;

const trimBuffer = (context: AudioContext, source: AudioBuffer, start: number, stop: number) => {
  if (start - stop > 0) throw new Error(
    `Cannot trim to negative duration with start ${start}, stop ${stop}, duration ${stop - start}`
  );

  // TODO: this is for start/stop as samples
  const trimmedBuffer = context.createBuffer(
    source.numberOfChannels,
    stop - start,
    context.sampleRate
  );

  range(source.numberOfChannels).forEach(channel => {
    trimmedBuffer.copyToChannel(source.getChannelData(channel).slice(start, stop), channel);
  });

  return trimmedBuffer;
};

// convert seconds to minutes:seconds.milliseconds
const getPrettyTime = (seconds: number) => `${
  floor(seconds / 60).toString().padStart(2, '0')
}:${
  (seconds % 60).toFixed(3).padStart(6, '0')
}`;

type SoundbiteEditorProps = {
  buffer?: AudioBuffer;
  context: AudioContext;
  onChange: (buffer: AudioBuffer) => void;
};

// const trimStart = useRef(0);
// const trimStop = useRef(buffer?.length);
// const handleChange = () => buffer && (
//   onChange(
//     trimSpecificBuffer(
//       parseInt(startInput.current?.value ?? ''),
//       parseInt(stopInput.current?.value ?? '')
//     )
//   )
// );

/* <input ref={startInput} type="number" defaultValue="0" />
   <input ref={stopInput} type="number" defaultValue="20000" />
   <button onMouseUp={handleChange}>trim</button> */

export const SoundbiteEditor: FC<SoundbiteEditorProps> = ({ context, buffer, onChange }) => {
  const startInput = useRef<HTMLInputElement>(null);
  const stopInput = useRef<HTMLInputElement>(null);
  const trimStartHandle = useRef<HTMLDivElement>(null);
  const trimStopHandle = useRef<HTMLDivElement>(null);
  const trimBar = useRef<HTMLDivElement>(null);
  const [ isDragging, setIsDragging ] = useState(false);

  const startDragging = useCallback(() => setIsDragging(true), []);
  const stopDragging = useCallback(() => setIsDragging(false), []);

  const trimSpecificBuffer = useMemo(() => trimBuffer.partial(context, buffer!), [context, buffer]);

  const handleTrimChange: DragEventHandler<HTMLDivElement> = debounce(
    e => {
      if (isDragging) {
        console.log(
          'setting translateX to',
          clamp(e.clientX - (trimBar.current?.clientLeft ?? Infinity), 0, Infinity)
        );
        
        e.currentTarget.style.transform = `translateX(${
          clamp(e.clientX - (trimBar.current?.clientLeft ?? Infinity), 0, Infinity)
        })`;
      }
    },
    50
  );

  // const handleTrimStartChange: DragEventHandler<HTMLDivElement> = e => undefined;
  // const handleTrimStopChange: DragEventHandler<HTMLDivElement> = e => undefined;

  return (
    <div className={styles.container}>
      <div ref={trimBar} className={styles.trimBar}>
        {/* <div
          ref={trimStartHandle}
          className={styles.trimBoundary}
          onMouseDown={startDragging}
          onMouseUp={stopDragging}
          onMouseMove={handleTrimChange}
        />
        <div
          ref={trimStopHandle}
          className={styles.trimBoundary}
          onMouseDown={startDragging}
          onMouseUp={stopDragging}
          onMouseMove={handleTrimChange}
        /> */}
        <div className={styles.playbackLocation} />
      </div>
      <p>Duration: {getPrettyTime(buffer?.duration ?? 0)}</p>
      <button className="labelledIcon">
        <i className="material-icons">content_cut</i>
        &nbsp;Trim
      </button>
    </div>
  );
};
