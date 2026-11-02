import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'PS5 Linux Wiki',
  tagline: 'Guides, hardware notes and troubleshooting for running Linux on the PlayStation 5',
  favicon: 'img/logo.svg',

  future: {
    v4: true,
  },

  url: 'https://wiki.ps5-linux.eu',
  baseUrl: '/',

  organizationName: 'VivaLaVent',
  projectName: 'wiki.ps5-linux.eu',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  markdown: {
    // .md files are plain CommonMark (safe for "<username>" style text),
    // .mdx files can use React components such as <Tabs>.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          // Docs-only mode: the wiki lives at the site root.
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'PS5 Linux Wiki',
      items: [{href: 'https://discord.gg/ps5linux', label: 'Discord', position: 'right'}],
    },
    footer: {
      style: 'dark',
      copyright:
        'Based on the <a href="https://guide.rmux.eu/">PS5 Linux Guide</a> by rmuxnet and contributors · MIT License · Not affiliated with Sony Interactive Entertainment',
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'ini', 'diff', 'c'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
