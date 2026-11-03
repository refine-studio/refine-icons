// Turns refine-ui's generated src/icons/refine-icons.ts back into one drawing per icon, and keeps refine-ui's own path
// props as the fixture the round-trip test compares against. It undoes refine-ui's scripts/generate-refine-icons.mjs.
// Usage: node scripts/import-refine-ui-icons.mjs <path to refine-ui's src/icons/refine-icons.ts>
import { readFileSync, writeFileSync } from 'node:fs';

import { serializeIcon } from './svg.mjs';

// refine-ui drew at 1.75 and multiplied a path's own stroke width by this, rounded to three decimals.
const STROKE_SCALE = 0.875;
const ICONS_DIR = new URL('../icons/', import.meta.url);
const FIXTURE_PATH = new URL('../test/refine-ui-icons.json', import.meta.url);

const sourcePath = process.argv[2];

if (!sourcePath) {
  console.error("Pass the path to refine-ui's src/icons/refine-icons.ts.");
  process.exit(1);
}

/**
 * Finds the shortest stroke width that refine-ui's rounding turns into the scaled value, so 1.313 reads back as 1.5.
 */
const unscale = (scaled) => {
  for (let digits = 0; digits <= 3; digits++) {
    const candidate = Number((scaled / STROKE_SCALE).toFixed(digits));
    if (Number((candidate * STROKE_SCALE).toFixed(3)) === scaled) return candidate;
  }
  throw new Error(`No stroke width scales to ${scaled}.`);
};

const source = readFileSync(sourcePath, 'utf8');
const fixture = {};
let count = 0;

for (const [, name, viewBox, rawPaths] of source.matchAll(/createRefineIcon\('([^']+)', '([^']+)', (\[.*\])\);$/gm)) {
  const paths = JSON.parse(rawPaths);

  fixture[name] = { viewBox, paths };

  const drawing = paths.map((path) => {
    return 'strokeWidth' in path ? { ...path, strokeWidth: unscale(path.strokeWidth) } : path;
  });

  writeFileSync(new URL(`${name}.svg`, ICONS_DIR), serializeIcon(viewBox, drawing));
  count++;
}

writeFileSync(FIXTURE_PATH, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`Wrote ${count} drawings.`);
