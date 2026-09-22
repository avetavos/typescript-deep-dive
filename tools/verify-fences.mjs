// Compile every ```ts fence in the English lessons as a standalone script.
//   // @expect-error TS2322 TS2345   fence must produce exactly these codes
//   // @run                          also execute with node --experimental-strip-types
//   // @skip-verify <reason>         pseudocode etc. — skipped, reason printed
// Usage: node tools/verify-fences.mjs [pathFilter]     TSGO=0 to skip tsgo
import { readFileSync, mkdirSync, writeFileSync, globSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const FLAGS = ['--ignoreConfig', '--noEmit', '--strict', '--target', 'es2025', '--lib', 'esnext,dom,dom.iterable',
  '--module', 'esnext', '--moduleResolution', 'bundler', '--skipLibCheck', '--types', 'node', '--pretty', 'false'];
const filter = process.argv[2] ?? '';
const useTsgo = process.env.TSGO !== '0' && existsSync('node_modules/.bin/tsgo');
const files = globSync('src/content/docs/en/**/*.mdx').filter((f) => f.includes(filter)).sort();

const codesOf = (out) => [...new Set([...out.matchAll(/error (TS\d+):/g)].map((m) => m[1]))].sort();
function compile(bin, file) {
  // typescript-browser (5.9, for the in-browser TSPlayground) also ships a `tsc` bin and can win
  // the .bin/ symlink race, so resolve the TS 7 binary by package path, not by .bin name.
  const exe = bin === 'tsc' ? 'node_modules/typescript/bin/tsc' : `node_modules/.bin/${bin}`;
  const r = spawnSync(exe, [...FLAGS, file], { encoding: 'utf8' });
  return { codes: codesOf(r.stdout + r.stderr), out: (r.stdout + r.stderr).trim() };
}

let n = 0, failed = 0, skipped = 0, disagree = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  let i = 0;
  for (const m of src.matchAll(/```ts\n([\s\S]*?)```/g)) {
    i++; n++;
    const body = m[1];
    const first = body.split('\n')[0];
    const skip = first.match(/^\/\/ @skip-verify(.*)$/);
    if (skip) { skipped++; console.log(`SKIP ${f}#${i}${skip[1] ? ' —' + skip[1] : ''}`); continue; }
    const expect = (first.match(/^\/\/ @expect-error (.+)$/)?.[1] ?? '').split(/\s+/).filter(Boolean).sort();
    const run = /^\/\/ @run\b/m.test(body.split('\n').slice(0, 2).join('\n'));
    const dir = `.verify/${f.replace(/[\/.]/g, '_')}`;
    mkdirSync(dir, { recursive: true });
    const file = `${dir}/fence${i}.ts`;
    writeFileSync(file, body);
    const tsc = compile('tsc', file);
    const ok = JSON.stringify(tsc.codes) === JSON.stringify(expect);
    let line = `${ok ? 'OK  ' : 'FAIL'} ${f}#${i}` + (expect.length ? ` expect[${expect}]` : '') + (tsc.codes.length ? ` got[${tsc.codes}]` : '');
    if (useTsgo) {
      const g = compile('tsgo', file);
      if (JSON.stringify(g.codes) !== JSON.stringify(tsc.codes)) { disagree++; line += ` TSGO-DISAGREES[${g.codes}]`; }
    }
    if (!ok) { failed++; console.log(line + '\n' + tsc.out.split('\n').slice(0, 4).join('\n')); } else console.log(line);
    if (run && ok) {
      const r = spawnSync('node', ['--experimental-strip-types', file], { encoding: 'utf8' });
      console.log(`--- run stdout ---\n${(r.stdout + r.stderr).trim()}\n------------------`);
    }
  }
}
console.log(`${n} fences, ${failed} failed, ${skipped} skipped, ${disagree} tsc/tsgo disagreements`);
process.exit(failed ? 1 : 0);
