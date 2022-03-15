import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

let tsChecked = true

function createConfig(config, plugins, tsOptions) {
  const nodePlugin = [resolve(), commonjs()]
  const tsOpt = tsOptions || {
    tsconfigOverride: {
      compilerOptions: {
        declaration: tsChecked,
        declarationMap: tsChecked
      }
    }
  }

  const tsPlugin = typescript(tsOpt)
  tsChecked && (tsChecked = false)

  const output = {
    globals: {
      vue: 'Vue',
      react: 'React'
    },
    ...('output' in config ? config.output : {})
  }

  return {
    input: 'src/index.ts',
    external: ['vue', 'react'],
    ...config,
    plugins: [tsPlugin, nodePlugin].concat(plugins),
    output,
    watch: { include: 'src/**/*' }
  }
}

function getConfig(env) {
  const babelPlugin = babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**' // 只编译我们的源代码
  })
  // core核心的es格式
  const esmCfg = createConfig({
    output: {
      file: pkg.module,
      format: 'es'
    }
  })
  // core核心的cjs格式
  const cjsCfg = createConfig(
    {
      output: {
        file: pkg.main,
        format: 'cjs',
        exports: 'named'
      }
    },
    [babelPlugin]
  )

  const createCompCfgs = (format = 'es') => {
    return createConfig(
      {
        input: ['src/vue-roi.ts', 'src/react-roi.ts'],
        external: ['vue', 'react', './index'],
        output: {
          dir: 'dist',
          entryFileNames: `[name].${format === 'cjs' ? 'cjs.' : ''}js`,
          format,
          exports: 'named'
        }
      },
      format === 'es' ? [] : [babelPlugin]
    )
  }

  // 为es格式的组件文件生产声明文件
  const componentsCjs = createCompCfgs()
  // cjs和es模式的vue和react组件
  const componentsEsm = createCompCfgs('cjs')

  const configs = [esmCfg, cjsCfg, componentsEsm, componentsCjs]

  if (env === 'development') return configs

  const umdMinCfg = createConfig(
    {
      input: 'src/index.ts',
      output: {
        file: pkg.unpkg,
        name: 'CanvasRoi',
        format: 'umd',
        exports: 'named'
      }
    },
    [babelPlugin, terser()]
  )
  return configs.concat([umdMinCfg])
}

export default getConfig(process.env.NODE_ENV)
