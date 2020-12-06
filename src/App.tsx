import React from 'react';
import ReactDom from 'react-dom';

import { App } from 'components';

// TODO: put this literally anywhere else
Object.defineProperty(
  Function.prototype,
  'partial',
  {
    value: function(...args: any[]) { return this.bind(null, ...args); }
  }
);

ReactDom.render(<App />, document.getElementById('root'));
