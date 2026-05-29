// One-off: rasterize the heavy logo.svg into small PNGs for fast loading.
// Run with: node scripts/convert-logo.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const svg = readFileSync("public/logo.svg");

const render = (width) => {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  return resvg.render().asPng();
};

writeFileSync("public/logo.png", render(240)); // sidebar/login (80px @3x)
writeFileSync("public/favicon.png", render(64)); // browser tab

for (const f of ["public/logo.svg", "public/logo.png", "public/favicon.png"]) {
  console.log(`${f}: ${(statSync(f).size / 1024).toFixed(1)} KB`);
}
