type Reducer<T, R> = (accumulator: R, current: T) => R;
type Transducer<T, R> = (arg0: Reducer<T, R>) => Reducer<T, R>

// https://jrsinclair.com/articles/2019/magical-mystical-js-transducers/
// const filtering = <From, To>(predicate: (arg0: From) => boolean): Transducer<From, To> => (
//   next => (
//     // TODO: figure out how to type this better or at all really
//     (acc, curr) => predicate(curr) ? next(acc, curr) : acc
//   )
// );

// // TODO: I don't think these types are right
// const mapping = <From, To>(callback: (arg0: From) => From): Transducer<From, To> => (
//   next => (acc, curr) => next(acc, callback(curr))
// );

export const filtering = (predicate: any) => (
  (next: any) => (
    (acc: any, curr: any) => predicate(curr) ? next(acc, curr) : acc
  )
);

export const mapping = (callback: any) => (
  (next: any) => (acc: any, curr: any) => next(acc, callback(curr))
);

// TODO: easy optimization here w/push
export const concatReducer = <T>(acc: T[], curr: T) => acc.concat([curr]);

export const transduce = (
  input: any[],
  initialVal: any,
  closingReducer: Reducer<any, any>,
  ...transducers: Array<Transducer<any, any>>
) => (
  input.reduce(
    transducers.reduceRight(
      (acc: any, transducer: Transducer<any, any>) => transducer(acc),
      closingReducer
    ),
    initialVal
  )
);
