import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - don't use client-side code here (browser APIs, JSX...)

// Dracula syntax colours on a deep navy "terminal" background.
const codeTheme = {
  ...prismThemes.dracula,
  plain: {...prismThemes.dracula.plain, backgroundColor: '#14152b'},
};

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
          // Adds the "Edit this page" link at the bottom of every doc.
          editUrl: 'https://github.com/VivaLaVent/wiki.ps5-linux.eu/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  clientModules: ['./src/clientModules/fonts.js'],

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
    announcementBar: {
      id: 'other-guide',
      content:
        '<a href="/img/other-guide.jpg" target="_blank" rel="noopener noreferrer">Why you shouldn\'t use the other guide</a>',
      backgroundColor: '#8d5cff',
      textColor: '#ffffff',
      isCloseable: false,
    },
    navbar: {
      title: 'PS5 Linux Wiki',
      items: [
        {href: 'https://discord.gg/ps5linux', label: 'Discord', position: 'right'},
        {href: 'https://ko-fi.com/vivalavent', label: 'Donate', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {label: 'Discord', href: 'https://discord.gg/ps5linux'},
            {label: 'PS5 Bazzite Deck on GitHub', href: 'https://github.com/VivaLaVent/ps5-bazzite-deck'},
            {label: 'Support the project on Ko-fi', href: 'https://ko-fi.com/vivalavent'},
          ],
        },
      ],
      copyright:
        'Maintained by Gilles (VivaLaVent) with the PS5 Linux community · MIT License · Not affiliated with Sony Interactive Entertainment or the Bazzite project',
    },
    prism: {
      theme: codeTheme,
      darkTheme: codeTheme,
      additionalLanguages: ['bash', 'ini', 'diff', 'c'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
