const { min, max, random, floor, sin, cos, abs, sqrt, hypot } = Math;

export const memoize = <ArgType extends Array<T>, ReturnType, T = any>(fn: (...args: ArgType) => ReturnType) => {
  const memoized = new Map();

  return (...args: ArgType) => memoized.get(args) || memoized.set(args, fn(...args)).get(args);
};

export const getRange = function* (start: number, step: number) {
  let iter = 0;
  while (true) yield start + step * iter++;
};

// a is start if b is defined, otherwise stop, so it doesn't really have a logical name
export const pythonRange = function* (n: number, stop: number | null = null, step = 1) {
  const from = stop === null ? 0 : n;
  const to = stop ?? n;
  
  // assertion b/c of conditional
  const shouldContinue = step > 0
    ? (curr: number) => curr < (to as number)
    : (curr: number) => curr > (to as number);
  
  const range = getRange(from, step);
  let curr = range.next().value;

  while (shouldContinue(curr)) {
    yield curr;
    curr = range.next().value;
  }
};

// https://stackoverflow.com/a/4550514
export const randomElement = <T>(array: T[]): T => array[floor(random() * array.length)];

export const randomFromRange = (min: number, max: number) => min + random() * (max - min);

export const prop = <T extends any, K extends keyof T>(propName: K) => (from: T): T[K] => from[propName];

export const partial = <Input, Output>(func: (...args: Input[]) => Output, ...partialArgs: Input[]) => func.bind(null, ...partialArgs);

// Currently only composes two functions
type Compose = {
  <A0, B, C>(second: (arg0: B) => C, first: (arg0: A0) => B): (arg0: A0) => C;
  <A0, A1, B, C>(second: (arg0: B) => C, first: (arg0: A0, arg1: A1) => B): (arg0: A0, arg1: A1) => C;
  <A0, A1, A2, B, C>(second: (arg0: B) => C, first: (arg0: A0, arg1: A1, arg2: A2) => B): (arg0: A0, arg1: A1, arg2: A2) => C;
  <A0, A1, A2, A3, B, C>(second: (arg0: B) => C, first: (arg0: A0, arg1: A1, arg2: A2, arg3: A3) => B): (arg0: A0, arg1: A1, arg2: A2, arg3: A3) => C;
  <A0, A1, A2, A3, A4, B, C>(second: (arg0: B) => C, first: (arg0: A0, arg1: A1, arg2: A2, arg3: A3, arg4: A4) => B): (arg0: A0, arg1: A1, arg2: A2, arg3: A3, arg4: A4) => C;
  <A0, A1, A2, A3, A4, A5, B, C>(second: (arg0: B) => C, first: (arg0: A0, arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => B): (arg0: A0, arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => C;
}
export const compose: Compose = (
  (f: any, g: any) => (...args: any[]) => f(g(...args))
);

// https://css-tricks.com/snippets/javascript/random-hex-color/
export const randomColor = () => floor(random() * 16777215);

export const clamp = (clampMin: number, clampMax: number, raw: number) => max(clampMin, min(clampMax, raw));

export const scale = (coeff: number, [ x, y ]: Coordinate): Coordinate => [ coeff * x, coeff * y ];

export const head = <T>(from: T[]) => from[0];

export const tail = <T>(from: T[]) => from.slice(1);

export const first = head;

export const last = <T>(from: T[]) => from[from.length - 1];

// stops zipping at the length of the shorter of the two lists to avoid Array<[Maybe<A>, Maybe<B>]>
export const zip = <A, B>(a: A[], b: B[]): Array<[A, B]> => (
  Array
    .from({ length: min(a.length, b.length) })
    .map((_, i) => [a[i], b[i]])
);

export const join = <A, B, C>(joiner: (arg0: [A, B]) => C, input: Array<[A, B]>): C[] => input.map(joiner);

export const zipWith = <A, B, C>(joiner: (arg0: [A, B]) => C, a: A[], b: B[]): C[] => join(joiner, zip(a, b));

export const add = (a: number, b: number) => a + b;

// type AddVector<V> = {
//   (a: Vec2<V>, b: Vec2<V>): Vec2<V>;
//   (a: Vec3<V>, b: Vec3<V>): Vec3<V>;
//   (a: Vec4<V>, b: Vec4<V>): Vec4<V>;
// }
type AddVector<V> = (
  V extends Vec2<infer T> ?  (a: Vec2<T>, b: Vec2<T>) => Vec2<T>
  : V extends Vec3<infer T> ? (a: Vec3<T>, b: Vec3<T>) => Vec3<T>
  : V extends Vec4<infer T> ? (a: Vec4<T>, b: Vec4<T>) => Vec4<T>
  : never
)
export const addVector: AddVector<Vector<number>> = <V extends Vector<number>>(a: V, b: V): V => (
  zipWith(([x, y]) => x + y, a, b) as V
);

export const magnitude: (arg0: Coordinate) => number = (v: Coordinate): number => hypot(...v);

export const multiply = (a: number, b: number) => a * b;

// TODO: consider \
export const orthogonal = ([ x, y ]: Coordinate): Coordinate => [
  -y, // y,
  x // -x
];

export const normalize = ([ x, y ]: Coordinate): Coordinate => [
  x / hypot(x, y),
  y / hypot(x, y)
];

export const translate = ([ xTranslate, yTranslate ]: Coordinate, [ x, y ]: Coordinate): Coordinate => [
  x + xTranslate,
  y + yTranslate
];

export const rotateAbout = ([ xCenter, yCenter ]: Coordinate, angle: number, [ x, y ]: Coordinate) => {
  // const radius = sqrt((x - xCenter) ** 2 + (y - yCenter) ** 2);
  // const initTheta = acos((x - xCenter) / radius);

  // return [
  //   xCenter + radius * sin(initTheta + angle),
  //   yCenter + radius * cos(initTheta + angle)
  // ];

  const s = sin(angle);
  const c = cos(angle);

  const xCentered = x - xCenter;
  const yCentered = y - yCenter;
  const xCenteredRotated = xCentered * c - yCentered * s;
  const yCenteredRotated = xCentered * s + yCentered * c;
  const xRotated = xCenteredRotated + xCenter;
  const yRotated = yCenteredRotated + yCenter;

  return [ xRotated, yRotated ];
};

export const linear = (m: number, b: number, x: number) => m * x + b;

export const sinCoord = (x: number): Coordinate => [ x, sin(x) ];

// use input w/getAxis to create two arrays, scale axis by magnitude, then join w/add
export const translateAlongAxis = (
  f: (arg0: number) => Coordinate,
  getTranslationMagnitude: (arg0: number) => number,
  getAxis: (arg0: number) => Vec2<number>,
  input: number
) => {
  const [ translateX, translateY ] = scale(getTranslationMagnitude(input), getAxis(input));
  const [ x, y ] = f(input);

  return [ x + translateX, y + translateY ];
};

export const centerAround: (arg0: Coordinate, arg1: Coordinate) => Coordinate = (
  [ centerX, centerY ],
  [ toCenterX, toCenterY ]
) => [
  centerX + toCenterX,
  centerY + toCenterY
];

export const polarToCartesian = ([ r, theta ]: Coordinate): Coordinate => [
  r * cos(theta),
  r * sin(theta)
];

export const logPass = <T>(pass: T): T => (console.log(pass), pass);

export const normalizeToRange = (min: number, max: number, input: number) =>
  clamp(0, 1, input) * (max - min) + min;

export const normalizeFromRange = (min: number, max: number, input: number) =>
  (clamp(min, max, input) - min) / (max - min);
