import React, { FC, useRef, useState, useEffect, useCallback, useMemo } from 'react';

import styles from './styles.scss';
import styleConsts from '../consts.scss';

type OscilloscopeProps = {
  analyser: AnalyserNode;
}

// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
export const Oscilloscope: FC<OscilloscopeProps> = ({ analyser }) => {
  const [ canvas, setCanvas ] = useState<HTMLCanvasElement>();
  const [ context, setContext ] = useState<CanvasRenderingContext2D | null | undefined>();
  const prevCurveData = useRef<Uint8Array>(new Uint8Array());
  const bufferLength = useMemo(() => analyser.frequencyBinCount, [analyser]);
  const dataArray = useMemo(() => new Uint8Array(bufferLength), [bufferLength]);

  // Callback ref so that setCanvas triggers a rerender
  const createCanvas = useCallback<(arg0: HTMLCanvasElement) => void>(
    canvas => (
      setCanvas(canvas),
      setContext(canvas.getContext('2d'))
    ),
    []
  );

  // draw an oscilloscope of the current audio source
  const draw = useCallback(() => {
    if (canvas && context) {
      requestAnimationFrame(draw);
  
      analyser.getByteTimeDomainData(dataArray);
  
      context.fillStyle = "rgb(30, 30, 30)";
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      context.lineWidth = 2;
      context.strokeStyle = styleConsts.hazyCyan;
  
      context.beginPath();
  
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
  
      dataArray.forEach((dataPoint, i) => {
        const v = dataPoint / 128.0;
        const y = v * canvas.height / 2;
  
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
  
        x += sliceWidth;
      });
  
      context.lineTo(canvas.width, canvas.height / 2);
      context.stroke();
    }
  }, [analyser, bufferLength, canvas, context, dataArray]);

  useEffect(draw, [draw]);

  return <canvas ref={createCanvas} className={styles.oscilloscope} />;
};