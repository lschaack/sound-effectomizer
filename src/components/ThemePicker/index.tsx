import React, { FC, useCallback, useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import curry from 'lodash/curry';

type CssVar = {
  key: string;
  val: string;
}

const DEFAULT_THEME = {
  'Primary': {
    key: '--primary',
    val: '#f2ee9e',
  },
  'Secondary': {
    key: '--secondary',
    val: '#f29ea2',
  },
  'Tertiary': {
    key: '--tertiary',
    val: '#9ea2f2',
  },
  'Dark': {
    key: '--dark',
    val: '#353739',
  },
  'Medium': {
    key: '--medium',
    val: '#eee',
  },
  'Light': {
    key: '--light',
    val: 'white',
  },
  'Background': {
    key: '--background',
    val: 'white',
  },
  'Text': {
    key: '--text',
    val: 'black',
  },
  'App max width': {
    key: '--app-max-width',
    val: '1400px',
  },
  'Soundbite diameter': {
    key: '--soundbite-diameter',
    val: '7rem',
  },
  'Soundbite radius': {
    key: '--soundbite-radius',
    val: '5rem',
  },
  'Soundbite margin': {
    key: '--soundbite-margin',
    val: '0.5em',
  },
  'Mic icon diameter': {
    key: '--mic-icon-diameter',
    val: '3rem',
  },
} as const;

type NamedColorPickerProps = {
  initColor: string;
  varName: string;
  displayName: string;
}

// TODO: make initColor behavior more obvious by the name (not init if defined on root)
const NamedColorPicker: FC<NamedColorPickerProps> = ({ initColor, varName, displayName }) => {
  const root = document.documentElement;
  const [ color, setColor ] = useState(root.style.getPropertyValue(varName) ?? initColor);
  useEffect(() => root.style.setProperty(varName, color), [root, varName, color]);

  return (
    <div>
      <span>{displayName}</span>
      <HexColorPicker color={color} onChange={setColor} />
    </div>
  );
};

// TODO: preserve theme between renders
export const ThemePicker: FC = () => {
  return (
    <div>
      <div>
        <div>
          <div>
            <HexColorPicker />
          </div>
        </div>
      </div>
      {/* {Object.entries(DEFAULT_THEME).map(([ displayName, { key, val } ], index) => (
        <NamedColorPicker
          key={`${key}-${index}`}
          varName={key}
          initColor={val}
          displayName={displayName}
        />
      ))} */}
    </div>
  );
};
