import React, {
  useState,
  useRef,
  useEffect,
  ChangeEventHandler,
  useCallback,
  InputHTMLAttributes
} from 'react';
import cx from 'classnames';
import debounce from 'lodash/debounce';

import styles from './styles.scss';
import groupBy from 'lodash/groupBy';
import { useAudioContext } from 'context/AudioContext';
import { FlangerNode } from 'common/FlangerNode';
import { PitchNode } from 'common/PitchNode';
import { TapeDelayNode } from 'common/TapeDelayNode';
import { VibratoNode } from 'common/VibratoNode';
import { AudioIO } from 'common/AudioIO';

// TODO: better place for this
type AudioEffectConstructor = typeof FlangerNode
  | typeof PitchNode
  | typeof TapeDelayNode
  | typeof VibratoNode;

type TProps<Options, TConstructor extends AudioEffectConstructor, TNode extends AudioIO> = {
  AudioEffectConstructor: TConstructor;
  effectName: string;
  defaultOptions: Options;
  rangeParams: Array<{
    name: keyof Options;
  }>;
  radioParams: Array<{
    /**
     * name both labels the radio group and determines which group each value belongs to,
     * so it's possible to create two radio groups like:
     * [
     *   { name: 'groupA', value: 'valueA1' }, { name: 'groupA', value: 'valueA2' },
     *   { name: 'groupB', value: 'valueB1' }, { name: 'groupB', value: 'valueB2' }, 
     * ]
     */
    name: keyof Options;
    value: string;
  }>;
  onChange: (effectNode: Maybe<TNode>) => void;
  effectNode: Maybe<TNode>;
}

export const EffectConfig = <Options extends {}, TConstructor extends AudioEffectConstructor, TResult extends AudioIO>({
  AudioEffectConstructor,
  effectNode,
  onChange,
  defaultOptions,
  effectName,
  rangeParams,
  radioParams,
}: TProps<Options, TConstructor, TResult>) => {
  const { context } = useAudioContext();

  const [ options, setOptions ] = useState(defaultOptions);
  const [ expanded, setExpanded ] = useState(false);
  const optionToggle = useRef<HTMLInputElement>(null);

  const toggleExpanded = () => setExpanded(!expanded);

  const handleOptionsChange = useCallback(
    () => {
      if (!optionToggle.current?.checked) { // if option is unchecked, disable the effectNode
        // FIXME: the bit of code intended to do this in sound effects context doesn't work—this is a bandaid
        effectNode?.disconnect();
        onChange(undefined);
      } else if (effectNode === undefined) { // create the effectNode if undefined
        onChange(new AudioEffectConstructor(context, options as any) as any); // TODO: as any
      } else { // if the option is checked and the effectNode is defined, modify in-place
        effectNode?.setOptions(options as any); // TODO: as any
      }
    },
    [ effectNode, onChange, AudioEffectConstructor, context, options ]
  );

  useEffect(handleOptionsChange, [options]);

  // TODO: reenable if performance hit is noticeable
  const debouncedSetOptions = useCallback(
    debounce(setOptions, 10),
    [setOptions]
  );

  const createInputHandler: (prop: keyof Options) => ChangeEventHandler<HTMLInputElement> = useCallback(
    prop => event => {
      event.persist();
      setOptions(prevOptions => ({ ...prevOptions, [prop]: event.target.value }));
      // debouncedSetOptions(prevOptions => ({ ...prevOptions, [prop]: event.target.value }));
    },
    []
  );

  const getInputOptions = useCallback(
    (
      options: Partial<InputHTMLAttributes<HTMLInputElement>>,
      type: 'range' | 'radio' | 'number',
      optionName: keyof Options,
    ) => ({
      id: optionName.toString(),
      onChange: createInputHandler(optionName),
      type,
      ...options,
    }),
    [createInputHandler]
  );

  const getRangeInputOptions = useCallback(
    getInputOptions.partial({ min: 0, max: 1, step: 0.01 }, 'range'),
    [getInputOptions]
  );

  const getRadioInputOptions = useCallback(
    getInputOptions.partial({ name: `${effectName}-type` }, 'radio'),
    [getInputOptions]
  );

  return (
    <div>
      <div className={cx(styles.configRow)}>
        <input
          id={`${effectName}-toggle`}
          ref={optionToggle}
          className={cx("material-icons", 'effectToggle')}
          type="checkbox"
          onChange={handleOptionsChange}
        />
        <label htmlFor={`${effectName}-toggle`}><h2>{effectName}</h2></label>
        {/* TODO: bubble event up from button rather than just adding to both */}
        {/* <div className={styles.expandToggle} onClick={toggleExpanded}>
          <button className="material-icons" onClick={toggleExpanded}>
            {expanded ? 'expand_less' : 'expand_more'}
          </button>
        </div> */}
      </div>
      <div className={cx(styles.inputWrapper)}>
        <div className={styles.rangeInputs}>
          {!rangeParams.length ? null : rangeParams.map(({ name }, index) => (
            <div className={styles.rangeGroup} key={`${name}-${index}`}>
              <input
                onChange={e => {
                  e.persist();
                  setOptions(prevOptions => ({ ...prevOptions, [name]: e.target.value }));
                }}
                type="number"
                // Note: all effect config ranges are scaled from range [0,1] in their
                //  corresponding createSomethingNode functions
                // non-standard "orient" attribute enables vertical sliders in Firefox
                // "appearance: slider-vertical" in styles.scss should enable this in Chrome
                //// @ts-expect-error
                // orient="vertical"
                min={0}
                max={1}
                step={0.01}
                value={options[name] as unknown as string}
              />
              <input
                {...getRangeInputOptions(name)}
                value={options[name] as unknown as string}
              />
              <label htmlFor={name.toString()}>{name}</label>
            </div>
          ))}
        </div>
        <div className={styles.radioInputs}>
          {!radioParams.length ? null : (
            Object.entries(groupBy(radioParams, ({ name }) => name)).map(([ name, values ], index) => (
              <div className={styles.radioGroup} key={`${name}-${index}`}>
                {values.map(({ value }, index) => (
                  <div key={`${value}-${index}`}>
                    <label htmlFor={`${effectName}-${value}`}>
                      <input
                        {...getRadioInputOptions(name as keyof Options)}
                        id={`${effectName}-${value}`}
                        value={value}
                        defaultChecked={value === (defaultOptions?.[name as keyof Options] ?? '')}
                      />
                      {value}
                    </label>
                  </div>
                ))}
                <label>{name}</label>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};
