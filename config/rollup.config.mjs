import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { babel } from '@rollup/plugin-babel';
import banner from './banner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let destinationFile = `index`;
const plugins = [
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
  }),
];
const rollupConfig = {
  input: path.resolve(__dirname, `../src/js/index.js`),
  output: {
    banner: banner(),
    file: path.resolve(__dirname, `../dist/assets/js/${destinationFile}.js`),
    format: 'umd',
    generatedCode: 'es2015',
    name: 'index',
  },
  plugins,
}

export default rollupConfig
