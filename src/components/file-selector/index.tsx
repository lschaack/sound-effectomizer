import React, { FC, useState, ChangeEventHandler, useCallback } from 'react';
import cx from 'classnames';

import styles from './styles.scss';

const FILE_SELECTOR_ID = 'file-selector';

type TProps = {
  onSelect: (newBuffer?: AudioBuffer, name?: string) => void;
  context: AudioContext;
}

const getArrayBufferFromFile = (
  context: AudioContext,
  onComplete: (buffer: AudioBuffer) => void,
  blob: Maybe<File>
) => {
  if (blob) {
    // TODO: avoid assertions
    const reader = new FileReader();
    reader.onload = e => // should fire at the end of the execution of the next line
      context
        .decodeAudioData(e.target!.result as ArrayBuffer)
        .then(onComplete)
        .catch(err => alert(`failed to decode file with error: ${err}`));
    reader.readAsArrayBuffer(blob);
  }
};

// TODO: make focus-able
export const FileSelector: FC<TProps> = ({ onSelect, context }) => {
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    // iterate over each element of the FileList, adding each buffer as it's ready
    e => Array.from({ length: e.target.files?.length } as any).forEach((_, index) => {
      const file = e.target.files![index];

      getArrayBufferFromFile(context, buffer => onSelect(buffer, file?.name), file);
    }),
    [context, onSelect]
  );
  
  // https://stackoverflow.com/a/5813384/6011226 for custom file input
  return (
    <div>
      <label className={cx('material-icons', styles.fileSelector)} htmlFor={FILE_SELECTOR_ID}>
        add
      </label>
      <input
        className={styles.hidden}
        id={FILE_SELECTOR_ID}
        type="file"
        onChange={handleFileChange}
        multiple
      />
    </div>
  );
};
