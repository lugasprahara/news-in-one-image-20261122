// Entrypoint for the news-image-20261122 entry (Node 22, standard library only).
//
// The entry is the entry.png that sits beside this file. Before copying it to
// the output directory, this program sanity-checks the file: it must exist and
// it must really be a PNG (8-byte signature), and its pixel dimensions are read
// from the IHDR chunk and logged to stderr so a bad asset fails loudly here
// instead of silently at the grading gate. The copy itself is byte-for-byte:
// the judge sees exactly the bytes of entry.png.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function fail(message) {
  console.error(`main.ts: error: ${message}`);
  process.exit(1);
}

const sourcePath = new URL('./entry.png', import.meta.url);

let imageBytes;
try {
  imageBytes = readFileSync(sourcePath);
} catch {
  fail(`entry.png is missing next to main.ts (expected at ${sourcePath.pathname})`);
}

if (imageBytes.length < PNG_SIGNATURE.length ||
    !PNG_SIGNATURE.every((byte, i) => imageBytes[i] === byte)) {
  fail('entry.png is not a PNG file (bad signature bytes)');
}

// IHDR is always the first chunk: 8-byte signature, 4-byte length, "IHDR",
// then width and height as big-endian uint32 at offsets 16 and 20.
if (imageBytes.length < 24 || imageBytes.toString('ascii', 12, 16) !== 'IHDR') {
  fail('entry.png is truncated or malformed (no IHDR chunk)');
}
const width = imageBytes.readUInt32BE(16);
const height = imageBytes.readUInt32BE(20);
console.error(`main.ts: entry.png is a valid PNG, ${width}x${height}px, ${imageBytes.length} bytes`);

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
copyFileSync(sourcePath, join(outputDir, 'entry.png'));
