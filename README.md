# typescript-deep-dive

## Modules

`src/content/docs/{en,th}/`: `foundations`, `everyday-types`, `generics`,
`type-level-programming`, `classes-and-oop`, `compiler-and-tooling`,
`practical-mastery`, `checker-internals` ("How the Checker Thinks" —
assignability, inference, control-flow analysis, erasure & emit, performance
model), `reading-typescript` ("Reading & Reviewing TypeScript" — AI bug
catalog, review checklist, verification tools, worked reviews), `glossary`.

## `<TSPlayground>`

Renders a `code` prop with Expressive Code, followed by a toolbar: **Check
types**, **Run**, **Open in TS Playground**, and a version badge. Labels are
localized from `document.documentElement.lang` (`en`/`th`).

```mdx
import TSPlayground from '../../../components/TSPlayground.astro';

export const demoCode = `const x: number = 1;
console.log(x + 1);`;

<TSPlayground code={demoCode} id="my-demo" title="Optional title" />
```

Props: `code: string` (required), `id?: string`, `title?: string`.

- **Check types** lazy-loads TypeScript 5.9.3 (UMD) from jsdelivr on first
  click, builds an in-memory `CompilerHost` (`strict`, `target: ES2024`,
  `module: ESNext`, `moduleResolution: Bundler`, `noEmit`, `skipLibCheck`),
  fetches every `lib.*.d.ts` file the program actually requests (following
  `/// <reference lib=".../>` chains, ~75 files / ~2.4MB for a typical
  snippet that resolves the default DOM+ESNext lib), and shows
  `program.getPreEmitDiagnostics` as `line:col TSxxxx: message`. Lib files
  are cached in memory across clicks on the same page (never refetched for
  the same session). The badge notes the checker is pinned to 5.9.3 even
  though the course text targets TypeScript 7.0.
- **Run** strips a leading `export`/`export default`, transpiles with
  `ts.transpileModule` (`target: ES2022`, `module: ESNext`), and executes
  the result in a sandboxed, hidden `<iframe sandbox="allow-scripts">` that
  overrides `console.log/warn/error` and reports back via `postMessage`
  (5s timeout). A snippet with a top-level `import` shows a friendly
  "not runnable here" message instead of executing.
- **Open in TS Playground** links to
  `https://www.typescriptlang.org/play/#code/<compressed>` using an inlined
  lz-string `compressToEncodedURIComponent` port (no CDN dependency).

Logic lives in `src/components/ts-runner.ts` (pure, unit-tested — see
`tests/ts-runner.test.ts`, run via `npm test`); DOM wiring lives inline in
`src/components/TSPlayground.astro`.
