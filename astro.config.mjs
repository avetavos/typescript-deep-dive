// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site. Update `site` to your GitHub username and `base`
  // to your repo name if they differ.
  site: 'https://deep-dive.avetavos.com',
  base: '/typescript',
  output: 'static',
  integrations: [starlight({
      title: 'TypeScript Deep Dive',
      head: [
        { tag: 'script', attrs: { type: 'module', src: '/typescript/enhance.js' } },
        { tag: 'link', attrs: { rel: 'manifest', href: '/typescript/manifest.webmanifest' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/typescript/apple-touch-icon.png' } },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/typescript/icon-192.png' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#3178C6' } },
        { tag: 'meta', attrs: { name: 'mobile-web-app-capable', content: 'yes' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: "TypeScript Deep Dive" } },
        { tag: 'script', content: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/typescript/sw.js',{scope:'/typescript/'}).catch(function(){})})}" },
      ],
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        th: { label: 'ไทย', lang: 'th' },
      },
      customCss: ['./src/styles/custom.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/avetavos/typescript-deep-dive' }],
      sidebar: [
        { label: 'Foundations & Mental Model', items: [{ autogenerate: { directory: 'foundations' } }] },
        { label: 'Everyday Types, Deep', items: [{ autogenerate: { directory: 'everyday-types' } }] },
        { label: 'Generics', items: [{ autogenerate: { directory: 'generics' } }] },
        { label: 'Type-Level Programming', items: [{ autogenerate: { directory: 'type-level-programming' } }] },
        { label: 'Classes & Advanced OOP', items: [{ autogenerate: { directory: 'classes-and-oop' } }] },
        { label: 'The Compiler & Tooling', items: [{ autogenerate: { directory: 'compiler-and-tooling' } }] },
        { label: 'Practical Mastery', items: [{ autogenerate: { directory: 'practical-mastery' } }] },
      ],
      }), preact()],
});
