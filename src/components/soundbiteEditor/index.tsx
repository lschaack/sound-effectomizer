import React, { DragEventHandler, FC, MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import cx from 'classnames';

import clamp from 'lodash/clamp';
import debounce from 'lodash/debounce';
import range from 'lodash/range';

import styles from './styles.scss';
import { useSoundbiteContext } from 'context/SoundbiteContext';

const { floor } = Math;

const REM_PX = 16;
const TRIM_BOUNDARY_WIDTH = 0.3 * REM_PX; // TODO: source from styles.scss or css var

const trimBuffer = (context: AudioContext, source: Maybe<AudioBuffer>, start: number, stop: number) => {
  if (!source) {
    console.warn('trimBuffer called with undefined source');

    return null;
  }

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

const getDragLeft = (
  elementStartingX: number,
  cursorStartingX: number,
  lowBoundary: number,
  highBoundary: number,
  cursorCurrentX: number,
) => (
  clamp(
    elementStartingX + cursorCurrentX - cursorStartingX,
    lowBoundary,
    highBoundary
  )
);

export const SoundbiteEditor: FC<SoundbiteEditorProps> = ({ context, onChange }) => {
  const { currentSoundbite } = useSoundbiteContext();

  const trimStartHandle = useRef<HTMLDivElement>(null);
  const trimStopHandle = useRef<HTMLDivElement>(null);
  const trimBar = useRef<HTMLDivElement>(null);

  const [ isDraggingStart, setIsDraggingStart ] = useState(false);
  const [ isDraggingStop, setIsDraggingStop ] = useState(false);

  const [ dragStartClientX, setDragStartClientX ] = useState(0);
  const [ dragStartElementX, setDragStartElementX ] = useState(0);

  // TODO: unwind this for boundaries to be provided each call so I can stop boundaries
  // from passing each other
  const getCurrentDragPosition = useCallback(
    getDragLeft.partial(
      dragStartElementX,
      dragStartClientX,
      -TRIM_BOUNDARY_WIDTH,
      trimBar.current
        ? trimBar.current.clientLeft + trimBar.current.clientWidth
        : Infinity,
    ),
    [ dragStartElementX, dragStartClientX ]
  );
  
  const startDraggingStart: MouseEventHandler = useCallback(e => {
    setDragStartClientX(e.clientX);
    setDragStartElementX(
      trimStartHandle.current
        ? parseInt(getComputedStyle(trimStartHandle.current).left)
        : 0
    );

    setIsDraggingStart(true);
  }, [setIsDraggingStart]);

  const startDraggingStop: MouseEventHandler = useCallback(e => {
    setDragStartClientX(e.clientX);
    setDragStartElementX(
      trimStopHandle.current
        ? parseInt(getComputedStyle(trimStopHandle.current).left)
        : 0
    );

    setIsDraggingStop(true);
  }, [setIsDraggingStop]);

  const stopDraggingStart = useCallback(() => setIsDraggingStart(false), [setIsDraggingStart]);
  const stopDraggingStop = useCallback(() => setIsDraggingStop(false), [setIsDraggingStop]);

  const stopDragging = useCallback(() => {
    console.log('setting isDragging to false');
    stopDraggingStart();
    stopDraggingStop();
  }, [stopDraggingStart, stopDraggingStop]);

  const trimSpecificBuffer = useMemo(
    () => trimBuffer.partial(context, currentSoundbite?.buffer),
    [context, currentSoundbite]
  );

  const handleTrimChange: DragEventHandler<HTMLDivElement> = e => {
    if (isDraggingStart && trimStartHandle.current) {
      trimStartHandle.current.style.left = `${getCurrentDragPosition(e.clientX)}px`;
    }

    if (isDraggingStop && trimStopHandle.current) {
      trimStopHandle.current.style.left = `${getCurrentDragPosition(e.clientX)}px`;
    }
  };

  // const handleTrimStartChange: DragEventHandler<HTMLDivElement> = e => undefined;
  // const handleTrimStopChange: DragEventHandler<HTMLDivElement> = e => undefined;

  return (
    <div className={styles.container} onMouseUp={stopDragging} onMouseMove={handleTrimChange}>
      <div ref={trimBar} className={styles.trimBar}>
        <div
          ref={trimStartHandle}
          className={styles.trimBoundary}
          onMouseDown={startDraggingStart}
          onMouseUp={stopDraggingStart}
        />
        <div className={styles.playbackLocation} />
        <div
          ref={trimStopHandle}
          className={styles.trimBoundary}
          onMouseDown={startDraggingStop}
          onMouseUp={stopDraggingStop}
        />
      </div>
      <p>Duration: {getPrettyTime(currentSoundbite?.buffer.duration ?? 0)}</p>
      <button className="labelledIcon">
        <i className="material-icons">content_cut</i>
        &nbsp;Trim
      </button>
    </div>
  );
};
