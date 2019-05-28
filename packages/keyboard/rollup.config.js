import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';

const pkg = require('./package.json');

const libraryName = pkg.name;

export default [{
  input: 'src/index.ts',
  output: [
    { file: pkg.main, name: libraryName, format: 'umd' }
  ],
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true,
      allowNonTsExtensions: true
    }),
    commonjs(),
    resolve(),
  ],
}];
