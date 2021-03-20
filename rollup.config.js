import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

function createConfig(config, plugins) {
  const nodePlugin = [resolve(), commonjs()];
  const tsPlugin = typescript({
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
        emitDeclarationOnly: false,
      },
    },
  });
  const cssPlugin = postcss();

  const output = Object.assign(
    {
      globals: {
        vue: "Vue",
      },
    },
    "output" in config ? config.output : {}
  );
  return Object.assign(
    {
      input: "src/index.ts",
    },
    config,
    {
      output,
      external: ["vue"],
      plugins: [nodePlugin, tsPlugin, cssPlugin].concat(plugins),
    }
  );
}

function getConfig(env) {
  const babelPlugin = babel({
    exclude: "node_modules/**", // 只编译我们的源代码
  });
  const cjsCfg = createConfig(
    {
      output: {
        file: pkg.main,
        format: "cjs",
        exports: "named",
      },
      watch: {
        include: "src/**",
      },
    },
    [babelPlugin]
  );
  const esCfg = createConfig({
    output: {
      file: pkg.module,
      format: "es",
    },
  });
  const umdMinCfg = createConfig(
    {
      output: {
        file: pkg.unpkg,
        name: "CanvasRoi",
        format: "umd",
        exports: "named",
      },
    },
    [babelPlugin, terser()]
  );
  return env === "development" ? esCfg : [cjsCfg, esCfg, umdMinCfg];
}

export default getConfig(process.env.NODE_ENV);
