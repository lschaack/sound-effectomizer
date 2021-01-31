declare module '*.css';
declare module '*.scss';

declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.gif';

declare module '*.mp3';
declare module '*.wav';

declare module '*.vert';
declare module '*.frag';

// type Func<From, To> = (...args: From[]) => To;
type Func = {
  <F0, To>(arg0: F0): To;
  <F0, F1, To>(arg0: F0, arg1: F1): To;
  <F0, F1, F2, To>(arg0: F0, arg1: F1, arg2: F2): To;
  <F0, F1, F2, F3, To>(arg0: F0, arg1: F1, arg2: F2, arg3: F3): To;
  <F0, F1, F2, F3, F4, To>(arg0: F0, arg1: F1, arg2: F2, arg3: F3, arg4: F4): To;
}

type MapFn<T, K> = (currentValue: T, index: number) => K;

type Maybe<T> = T | undefined;

type Coordinate = [ number, number ];

type UnitVector = Coordinate;

interface Function {
  partial<T, A0, A extends any[], R>(this: (this: T, arg0: A0, ...args: A) => R, arg0: A0): (...args: A) => R;
  partial<T, A0, A1, A extends any[], R>(this: (this: T, arg0: A0, arg1: A1, ...args: A) => R, arg0: A0, arg1: A1): (...args: A) => R;
  partial<T, A0, A1, A2, A extends any[], R>(this: (this: T, arg0: A0, arg1: A1, arg2: A2, ...args: A) => R, arg0: A0, arg1: A1, arg2: A2): (...args: A) => R;
  partial<T, A0, A1, A2, A3, A extends any[], R>(this: (this: T, arg0: A0, arg1: A1, arg2: A2, arg3: A3, ...args: A) => R, arg0: A0, arg1: A1, arg2: A2, arg3: A3): (...args: A) => R;
  partial<T, AX, R>(this: (this: T, ...args: AX[]) => R, ...args: AX[]): (...args: AX[]) => R;
}

type Vec2<T> = [T, T];
type Vec3<T> = [T, T, T];
type Vec4<T> = [T, T, T, T];
type Vector<T> = Vec2<T> | Vec3<T> | Vec4<T>;

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};
