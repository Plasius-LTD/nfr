import { defineConfig } from "tsup";

const sharedConfig = {
  entry: ["src/index.ts"],
  sourcemap: true,
  target: "es2022",
};

export default defineConfig([
  {
    ...sharedConfig,
    format: ["esm"],
    dts: true,
    clean: true,
    esbuildOptions(options) {
      options.define = {
        ...(options.define ?? {}),
        __IMPORT_META_ENV__: "import.meta.env",
      };
    },
  },
  {
    ...sharedConfig,
    format: ["cjs"],
    dts: false,
    clean: false,
    esbuildOptions(options) {
      options.define = {
        ...(options.define ?? {}),
        __IMPORT_META_ENV__: "undefined",
      };
    },
  },
]);
