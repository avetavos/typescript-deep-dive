import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as ts from 'typescript-browser';
import {
  checkTypes,
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
  hasTopLevelImport,
  stripExportKeywords,
  transpileForRun,
} from '../src/components/ts-runner';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = join(__dirname, '../node_modules/typescript-browser/lib');

/** LibLoader backed by the on-disk typescript-browser package (no network in tests). */
async function loadLibFromDisk(fileName: string): Promise<string | undefined> {
  try {
    return readFileSync(join(LIB_DIR, fileName), 'utf8');
  } catch {
    return undefined;
  }
}

describe('transpileForRun', () => {
  it('strips type annotations', () => {
    const out = transpileForRun(ts as unknown as typeof import('typescript'), 'const x: number = 1;\nconsole.log(x);');
    expect(out).not.toMatch(/:\s*number/);
    expect(out).toContain('console.log(x)');
  });
});

describe('checkTypes', () => {
  it('reports TS2322 for an incompatible assignment', async () => {
    const { diagnostics, libFilesFetched } = await checkTypes(
      ts as unknown as typeof import('typescript'),
      'const x: number = "a";',
      loadLibFromDisk,
    );
    expect(diagnostics.some((d) => d.includes('TS2322'))).toBe(true);
    expect(diagnostics[0]).toMatch(/^\d+:\d+ TS\d+: /);
    expect(libFilesFetched.length).toBeGreaterThan(0);
  });

  it('reports no diagnostics for clean code', async () => {
    const { diagnostics } = await checkTypes(
      ts as unknown as typeof import('typescript'),
      'const x: number = 1;\nconsole.log(x);',
      loadLibFromDisk,
    );
    expect(diagnostics).toEqual([]);
  });
});

describe('stripExportKeywords', () => {
  it('strips `export const`', () => {
    expect(stripExportKeywords('export const x = 1;')).toBe('const x = 1;');
  });

  it('strips `export function`', () => {
    expect(stripExportKeywords('export function f() {}')).toBe('function f() {}');
  });

  it('strips `export default` from an expression', () => {
    expect(stripExportKeywords('export default foo;')).toBe('foo;');
  });

  it('leaves non-exported lines untouched', () => {
    expect(stripExportKeywords('const x = 1;\nexport const y = 2;')).toBe('const x = 1;\nconst y = 2;');
  });
});

describe('hasTopLevelImport', () => {
  it('detects a top-level import statement', () => {
    expect(hasTopLevelImport('import { readFile } from "node:fs";\nreadFile();')).toBe(true);
  });

  it('does not flag a dynamic import() call', () => {
    expect(hasTopLevelImport('const m = await import("node:fs");')).toBe(false);
  });

  it('does not flag code with no imports', () => {
    expect(hasTopLevelImport('console.log(1 + 1);')).toBe(false);
  });
});

describe('lz-string round trip', () => {
  it('compresses and decompresses back to the original', () => {
    const source = 'const x: number = 1;\nconsole.log(x + 1);';
    const compressed = compressToEncodedURIComponent(source);
    expect(decompressFromEncodedURIComponent(compressed)).toBe(source);
  });

  it('round-trips an empty string', () => {
    const compressed = compressToEncodedURIComponent('');
    expect(decompressFromEncodedURIComponent(compressed)).toBe('');
  });
});
