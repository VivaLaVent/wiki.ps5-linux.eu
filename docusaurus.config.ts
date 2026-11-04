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
  // PNG/ICO fallbacks: some browsers ignore or long-cache an SVG favicon
  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32.png'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png'}},
  ],

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

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        // pages merged in the November 2026 restructure; old links keep working
        redirects: [
          {from: '/installation/bazzite-deck', to: '/choose/bazzite-deck'},
          {from: '/post-install/bazzite-warm-reboot', to: '/advanced/warm-reboot'},
          {from: '/installation/linux-image', to: '/choose/official-images'},
          {from: '/using-linux/display', to: '/hardware/hdmi'},
          {from: '/troubleshooting/display-recovery', to: '/hardware/hdmi'},
          {from: '/troubleshooting/display-link-lock', to: '/hardware/hdmi'},
          {from: '/hardware/vcn', to: '/hardware/gpu'},
          {from: '/using-linux/networking/wifi', to: '/hardware/wifi-bluetooth'},
          {from: '/using-linux/networking/ethernet', to: '/hardware/wifi-bluetooth'},
          {from: '/using-linux/bluetooth', to: '/hardware/wifi-bluetooth'},
          {from: '/hardware/usb-storage', to: '/hardware/storage'},
          {from: '/hardware/m2-compatibility', to: '/hardware/storage'},
          {from: '/hardware/led', to: '/hardware/peripherals'},
          {from: '/hardware/buzzer', to: '/hardware/peripherals'},
          {from: '/hardware/capture-cards', to: '/hardware/peripherals'},
          {from: '/using-linux/gaming-performance', to: '/post-install/all-distros'},
          {from: '/using-linux/memory-and-swap', to: '/post-install/all-distros'},
          {from: '/installation/post-install', to: '/post-install/all-distros'},
          {from: '/getting-started/firmware', to: '/getting-started/prerequisites'},
          {from: '/hardware/overview', to: '/hardware/matrix'},
        ],
      },
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
        searchBarShortcutHint: false,
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
