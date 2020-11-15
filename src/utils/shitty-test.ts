import { orthogonal } from './index';

const test = ([ xInput, yInput ]: Coordinate, [ xExpected, yExpected ]: Coordinate) => {
  const [ xObserved, yObserved ] = orthogonal([ xInput, yInput ]);

  const pass = xObserved === xExpected && yObserved === yObserved;

  console.log(
`
orthogonal([ ${xInput}, ${yInput} ]):
${pass
  ? ' PASS '.padStart(26, ':)').padEnd(46, ':)')
  : ' FAIL '.padStart(26, 'D:').padEnd(46, 'D:')}
expected: [ ${xExpected}, ${yExpected} ]
observed: [ ${xObserved}, ${yObserved} ]
`
  );
};

test([ 0, 1 ], [ 1, 0 ]);
test([ 1, 0 ], [ 0, 1 ]);
test([ 0.5, 0.5 ], [ -0.5, 0.5 ]);
