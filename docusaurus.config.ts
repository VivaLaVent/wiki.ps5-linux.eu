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
          editUrl: 'https://github.com/VivaLaVent/wiki.ps5-linux.eu/edit/main/',
          showLastUpdateTime: true,
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
    image: 'img/logo.svg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    announcementBar: {
      id: 'firmware-limit',
      content:
        'Linux currently runs on PS5 firmware up to <b>13.60</b>. <a href="/getting-started/firmware">Check your firmware</a> before you start.',
      backgroundColor: '#1f6feb',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: 'PS5 Linux Wiki',
      logo: {
        alt: 'PS5 Linux Wiki',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/getting-started/overview', label: 'Start here', position: 'left'},
        {to: '/hardware/overview', label: 'Hardware', position: 'left'},
        {to: '/troubleshooting/known-issues', label: 'Known issues', position: 'left'},
        {href: 'https://discord.gg/ps5linux', label: 'Discord', position: 'right'},
        {
          href: 'https://github.com/VivaLaVent/wiki.ps5-linux.eu',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Wiki',
          items: [
            {label: 'What is this?', to: '/'},
            {label: 'Getting started', to: '/getting-started/overview'},
            {label: 'Known issues & FAQ', to: '/troubleshooting/known-issues'},
            {label: 'Credits', to: '/about/credits'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Discord', href: 'https://discord.gg/ps5linux'},
            {label: 'Telegram', href: 'https://t.me/ps5linux'},
          ],
        },
        {
          title: 'Projects',
          items: [
            {label: 'ps5-linux on GitHub', href: 'https://github.com/ps5-linux'},
            {label: 'ps5-linux-image', href: 'https://github.com/ps5-linux/ps5-linux-image'},
            {label: 'Wiki source', href: 'https://github.com/VivaLaVent/wiki.ps5-linux.eu'},
          ],
        },
      ],
      copyright: `Community project, not affiliated with Sony Interactive Entertainment. Based on the PS5 Linux Guide by rmuxnet and contributors. Released under the MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'ini', 'diff', 'c'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
