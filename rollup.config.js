import node from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
// import commonjs from 'rollup-plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

function createConfig(config, plugins) {
  const nodePlugin = node({
    customResolveOptions: {
      moduleDirectory: 'node_modules'
    }
  });
  const tsPlugin = typescript({
    tsconfig: false,
    exclude: '**/*.d.ts'
  });
  const cssPlugin = postcss();

  return Object.assign({
    input: 'src/index.ts',
    plugins: [nodePlugin, tsPlugin, cssPlugin].concat(plugins)
  }, config);
}

function getConfig(env) {
  
  const babelPlugin = babel({
    exclude: 'node_modules/**' // 只编译我们的源代码
  })
  const umdCfg = createConfig({
    output: {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'named'
    },
    watch: {
      include: 'src/**'
    }
  }, [babelPlugin]);
  const esCfg = createConfig({
    output: {
      file: 'lib/index.es.js',
      format: 'es'
    }
  });
  const umdMinCfg = createConfig({
    output: {
      file: 'lib/index.mins.js',
      name: 'EsUtil',
      format: 'umd',
      exports: 'named'
    }
  }, [babelPlugin, terser()]);
  return env === 'development' ? umdCfg : [umdCfg, esCfg, umdMinCfg];
}

export default getConfig(process.env.NODE_ENV)
