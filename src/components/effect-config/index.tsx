import React, {
  useState,
  useRef,
  useEffect,
  ChangeEventHandler,
  useCallback,
  InputHTMLAttributes
} from 'react';
import cx from 'classnames';
import debounce from 'lodash-es/debounce';

import { AudioIO } from '../utils';

import styles from './styles.scss';
import parentStyles from '../styles.scss';
import { groupBy } from 'lodash-es';

type TProps<Options> = {
  context: AudioContext;
  createEffectNode: (context: AudioContext, options: Options) => AudioIO<Options>;
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
  onChange: (effectNode: Maybe<AudioIO<Options>>) => void;
}

export const EffectConfig = <Options extends {}>({
  context,
  createEffectNode,
  onChange,
  defaultOptions,
  effectName,
  rangeParams,
  radioParams,
}: TProps<Options>) => {
  const [ options, setOptions ] = useState(defaultOptions);
  const [ expanded, setExpanded ] = useState(false);
  const optionToggle = useRef<HTMLInputElement>(null);
  const effectNode = useRef<Maybe<AudioIO<Options>>>();

  const toggleExpanded = () => setExpanded(!expanded);

  const handleOptionsChange = useCallback(
    () => {
      if (!optionToggle.current?.checked) { // if option is unchecked, disable the node
        effectNode.current = undefined;
        onChange(undefined);
      } else if (effectNode.current === undefined) { // create the node if undefined
        effectNode.current = createEffectNode(context, options);
        onChange(effectNode.current);
      } else { // if the option is checked and the node is defined, modify in-place
        effectNode.current?.setOptions(options);
      }
    },
    [options, context, createEffectNode, onChange]
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
    <div className={cx(styles.effectContainer, parentStyles.expandableRow, expanded && parentStyles.expanded)}>
      <div className={cx(styles.configRow)}>
        <input
          id={`${effectName}-toggle`}
          ref={optionToggle}
          className={cx("material-icons", 'effectToggle')}
          type="checkbox"
          onChange={handleOptionsChange}
        />
        <h2><label htmlFor={`${effectName}-toggle`}>{effectName}</label></h2>
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
                // @ts-expect-error
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
