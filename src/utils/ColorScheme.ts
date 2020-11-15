import { compose, logPass } from ".";
import { transduce, mapping, concatReducer } from "./transducer";

const { abs, random, floor } = Math;

type Color = [ number, number, number ];
type Complimentary = [ Color, Color ];
type Triadic = [ Color, Color, Color ]

export class ColorScheme {
  // https://www.rapidtables.com/convert/color/hsv-to-rgb.html
  static hslToRgb = ([ h, s, l ]: Color): Color => {
    const c = l * s;
    const x = c * (1 - abs(h / 60) % 2 - 1);
    const m = l - c;

    const [ rNorm, gNorm, bNorm ] = (
      h < 60
        ? [ c, x, 0 ]
      : h < 120
        ? [ x, c, 0 ]
      : h < 180
        ? [ 0, c, x ]
      : h < 240
        ? [ 0, x, c ]
      : h < 300
        ? [ x, 0, c ]
        : [ c, 0, x ]
    );

    return [
      abs(floor((rNorm + m) * 255)),
      abs(floor((gNorm + m) * 255)),
      abs(floor((bNorm + m) * 255)),
    ];
  };

  // https://www.rapidtables.com/convert/color/how-rgb-to-hex.html
  static rgbToHex = ([ r, g, b ]: Color): number => parseInt(`${r.toString(16)}${g.toString(16)}${b.toString(16)}`, 16);

  static complimentary = ([ h, s, l ]: Color): Complimentary => [
    [ h, s, l ],
    [ (h + 180) % 360, s, l ]
  ];

  static triadic = ([ h, s, l ]: Color): Triadic => [
    [ h, s, l ],
    [ (h + 120) % 360, s, l ],
    [ (h + 240) % 360, s, l ]
  ];

  static randomHsl = (): Color => [
    random() * 360,
    random(),
    random(),
  ]

  static randomTriadic = () => transduce(
    compose<void, Color, Triadic>(ColorScheme.triadic, ColorScheme.randomHsl)(),
    [],
    concatReducer,
    mapping(ColorScheme.hslToRgb),
    mapping(ColorScheme.rgbToHex),
  );

  static randomComplimentary = () => transduce(
    compose<void, Color, Complimentary>(ColorScheme.complimentary, ColorScheme.randomHsl)(),
    [],
    concatReducer,
    mapping(ColorScheme.hslToRgb),
    mapping(ColorScheme.rgbToHex),
  );
}
