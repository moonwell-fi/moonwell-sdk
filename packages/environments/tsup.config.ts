import { defineConfig } from "tsup";

export default defineConfig({
  name: "@moonwell-sdk/environments",
  entry: ["src/**/*"],
  outDir: "dist",
  format: ["esm"],
  sourcemap: true,
  dts: true,
  clean: true,
  splitting: true,
});
