import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The sidebar follows the order a new user goes through:
// before you install → install → after installing → hardware reference → advanced → fix problems.
// "After installing" has three layers: all distros, the other images, distro notes; plus PS5 Bazzite Deck.

const sidebars: SidebarsConfig = {
  wikiSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Before you install',
      collapsed: false,
      items: [
        'getting-started/overview',
        'getting-started/prerequisites',
        {
          type: 'category',
          label: 'Choose your image',
          link: {type: 'doc', id: 'getting-started/which-image'},
          collapsed: false,
          items: ['choose/bazzite-deck', 'choose/official-images', 'choose/build-your-own'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Install',
      collapsed: false,
      items: [
        'installation/flash',
        'installation/booting',
        'installation/first-boot',
        'installation/m2-install',
      ],
    },
    {
      type: 'category',
      label: 'After installing',
      collapsed: false,
      items: [
        'post-install/all-distros',
        'post-install/boot-options',
        'post-install/not-bazzite-deck',
        'post-install/distro-notes',
        'post-install/bazzite',
        'using-linux/dualsense',
        'using-linux/audio',
        'using-linux/browser-video',
        'using-linux/boot-to-desktop',
      ],
    },
    {
      type: 'category',
      label: 'Hardware reference',
      items: [
        'hardware/matrix',
        'hardware/hdmi',
        'hardware/gpu',
        'hardware/ps5-pro',
        'hardware/wifi-bluetooth',
        'hardware/fan',
        'hardware/storage',
        'hardware/peripherals',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/kernel',
        'advanced/kernel-sources',
        'advanced/package-repository',
        'advanced/image-build',
        'advanced/warm-reboot',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting & help',
      items: [
        'troubleshooting/getting-help',
        'troubleshooting/known-issues',
        'troubleshooting/recovery',
        'troubleshooting/modules-not-loading',
      ],
    },
    {
      type: 'category',
      label: 'About',
      items: ['about/credits'],
    },
  ],
};

export default sidebars;
