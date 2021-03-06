import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

const libraryName = pkg.name;

export default [{
  input: 'src/index.ts',
  output: [
    { file: pkg.main, name: libraryName, format: 'es' },
  ],
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
    commonjs(),
    resolve(),
  ],
}];
