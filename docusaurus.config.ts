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
  tagline: 'Guides, hardware notes and troubleshooting for running Linux on the PS5',
  favicon: 'img/logo.svg',
  // PNG/ICO fallbacks: some browsers ignore or long-cache an SVG favicon
  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32.png'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png'}},
    // site name and search box for search engines
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({"@context": "https://schema.org", "@type": "WebSite", "name": "PS5 Linux Wiki", "alternateName": ["PlayStation 5 Linux Wiki", "wiki.ps5-linux.eu"], "url": "https://wiki.ps5-linux.eu/", "inLanguage": "en", "potentialAction": {"@type": "SearchAction", "target": "https://wiki.ps5-linux.eu/search?q={search_term_string}", "query-input": "required name=search_term_string"}}),
    },
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
        sitemap: {
          ignorePatterns: ['/search', '/search/**'],
        },
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
        // pages merged or moved in the November 2026 restructures; old links keep working
        redirects: [
          {from: '/installation/bazzite-deck', to: '/choose/bazzite-deck'},
          {from: '/installation/linux-image', to: '/choose/official-images'},
          {from: '/installation/post-install', to: '/post-install/all-distros'},
          {from: '/getting-started/firmware', to: '/getting-started/prerequisites'},
          {from: '/hardware/overview', to: '/getting-started/hardware'},
          {from: '/hardware/matrix', to: '/getting-started/hardware'},
          {from: '/hardware/usb-storage', to: '/getting-started/drives'},
          {from: '/hardware/m2-compatibility', to: '/getting-started/drives'},
          {from: '/hardware/storage', to: '/getting-started/drives'},
          {from: '/using-linux/display', to: '/troubleshooting/display'},
          {from: '/troubleshooting/display-recovery', to: '/troubleshooting/display'},
          {from: '/troubleshooting/display-link-lock', to: '/troubleshooting/display'},
          {from: '/hardware/hdmi', to: '/troubleshooting/display'},
          {from: '/hardware/vcn', to: '/troubleshooting/gpu'},
          {from: '/hardware/gpu', to: '/troubleshooting/gpu'},
          {from: '/hardware/ps5-pro', to: '/troubleshooting/ps5-pro'},
          {from: '/hardware/fan', to: '/troubleshooting/fan'},
          {from: '/hardware/led', to: '/troubleshooting/peripherals'},
          {from: '/hardware/buzzer', to: '/troubleshooting/peripherals'},
          {from: '/hardware/capture-cards', to: '/troubleshooting/peripherals'},
          {from: '/hardware/peripherals', to: '/troubleshooting/peripherals'},
          {from: '/using-linux/networking/wifi', to: '/troubleshooting/wifi'},
          {from: '/using-linux/networking/ethernet', to: '/troubleshooting/ethernet'},
          {from: '/using-linux/bluetooth', to: '/troubleshooting/bluetooth'},
          {from: '/hardware/wifi-bluetooth', to: '/troubleshooting/wifi'},
          {from: '/using-linux/audio', to: '/troubleshooting/audio'},
          {from: '/using-linux/dualsense', to: '/post-install/dualsense'},
          {from: '/using-linux/browser-video', to: '/post-install/browser-video'},
          {from: '/using-linux/boot-to-desktop', to: '/post-install/boot-to-desktop'},
          {from: '/using-linux/decky', to: '/post-install/decky'},
          {from: '/using-linux/gaming-performance', to: '/post-install/all-distros'},
          {from: '/using-linux/memory-and-swap', to: '/post-install/all-distros'},
          {from: '/post-install/bazzite-warm-reboot', to: '/post-install/warm-reboot'},
          {from: '/advanced/warm-reboot', to: '/post-install/warm-reboot'},
          {from: '/advanced/package-repository', to: '/post-install/package-repository'},
          {from: '/advanced/kernel', to: '/post-install/kernel'},
          {from: '/advanced/kernel-sources', to: '/choose/kernel-sources'},
          {from: '/advanced/image-build', to: '/choose/image-build'},
          {from: '/post-install/distro-notes', to: '/post-install/not-bazzite-deck'},
          {from: '/troubleshooting/known-issues', to: '/troubleshooting/error-messages'},
          {from: '/troubleshooting/common-problems', to: '/troubleshooting/getting-help'},
          {from: '/troubleshooting/modules-not-loading', to: '/troubleshooting/error-messages'},
          {from: '/troubleshooting/recovery', to: '/troubleshooting/error-messages'},
          {from: '/about/credits', to: '/credits'},
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
    image: 'img/social-card.png',
    metadata: [
      {name: 'keywords', content: 'PS5 Linux, PlayStation 5 Linux, PS5 Bazzite, PS5 Bazzite Deck, PS5 Pro Linux, PS5 Slim Linux, PS5 Steam, PS5 jailbreak Linux'},
      {property: 'og:site_name', content: 'PS5 Linux Wiki'},
    ],
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
        {
          title: 'Origins',
          items: [
            {label: 'The PS5 Linux Guide by rmuxnet and its writers', to: '/credits#about-this-wiki'},
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
