import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

let tsChecked = true

function createConfig(config, plugins, tsOptions) {
  const nodePlugin = [resolve(), commonjs()]
  const tsOpt = tsOptions || {
    tsconfigOverride: {
      compilerOptions: {
        declaration: tsChecked,
        declarationMap: tsChecked,
      },
    },
    useTsconfigDeclarationDir: tsChecked,
  }
  const tsPlugin = typescript(tsOpt)
  tsChecked && (tsChecked = false)

  const cssPlugin = postcss()

  const output = Object.assign(
    {
      globals: {
        vue: 'Vue',
        react: 'React',
      },
    },
    'output' in config ? config.output : {}
  )
  return Object.assign(
    {
      input: 'src/index.ts',
      external: ['vue', 'react'],
      plugins: [nodePlugin, tsPlugin, cssPlugin].concat(plugins),
    },
    config,
    {
      output,
      watch: { include: 'src/*' },
    }
  )
}

function getConfig(env) {
  const babelPlugin = babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**', // 只编译我们的源代码
  })
  const cjsCfg = createConfig(
    {
      output: {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
      },
    },
    [babelPlugin]
  )
  const esCfg = createConfig({
    output: {
      file: pkg.module,
      format: 'es',
    },
  })

  const reactCjsCfgs = createConfig(
    {
      input: ['src/core/index.ts', 'src/react-roi.ts'],
      output: {
        dir: 'dist',
        entryFileNames: '[name].js',
      },
      external: ['vue', 'react', './core'],
    },
    [babelPlugin]
  )

  if (env === 'development') return [esCfg, cjsCfg, reactCjsCfgs]

  const umdMinCfg = createConfig(
    {
      input: 'src/index.esm.ts',
      output: {
        file: pkg.unpkg,
        name: 'CanvasRoi',
        format: 'umd',
        exports: 'named',
      },
    },
    [babelPlugin, terser()]
  )
  return [cjsCfg, esCfg, reactCjsCfgs, umdMinCfg]
}

export default getConfig(process.env.NODE_ENV)
