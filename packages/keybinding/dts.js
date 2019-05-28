var dts = require('dts-bundle');
const path = require('path');

dts.bundle({
  name: 'test',
  main: path.join(process.cwd(), 'lib/index.d.ts'),
  out: path.join(process.cwd(), 'lib/index.d.ts'),
  removeSource: true,
  outputAsModuleFolder: true // to use npm in-package typings
});
