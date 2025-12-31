import path from "node:path";

export default () => {
  const preload = path.resolve(__dirname, "./vm-constants-preload.cjs");
  const opts = process.env.NODE_OPTIONS || "";
  const requireFlag = `--require ${preload}`;
  if (!opts.includes(requireFlag)) {
    process.env.NODE_OPTIONS = `${opts} ${requireFlag}`.trim();
  }
};
