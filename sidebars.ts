import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The order a new user goes through: welcome → before you install → install → after installing → troubleshooting.
// After installing: three groups only, all images, PS5 Bazzite Deck and the other images; a topic that differs per image
// gets a page for what they share and one child per group (Install to the M.2, Boot options).
// Troubleshooting: the start page (SSH and logs), error messages, then one page per component.

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
        'getting-started/hardware',
        'getting-started/drives',
        'getting-started/loader',
        {
          type: 'category',
          label: 'Choose your image',
          link: {type: 'doc', id: 'getting-started/which-image'},
          collapsed: false,
          items: [
            'choose/bazzite-deck',
            'choose/official-images',
            {
              type: 'category',
              label: 'Build your own',
              link: {type: 'doc', id: 'choose/build-your-own'},
              items: ['choose/kernel-sources', 'choose/image-build'],
            },
          ],
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
        {
          type: 'category',
          label: 'Install to the M.2',
          link: {type: 'doc', id: 'installation/m2-install'},
          items: ['installation/m2-bazzite-deck', 'installation/m2-other-images'],
        },
      ],
    },
    {
      type: 'category',
      label: 'After installing',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'All images',
          link: {type: 'doc', id: 'post-install/all-distros'},
          items: ['post-install/dualsense', 'post-install/browser-video', 'post-install/warm-reboot', 'post-install/boot-options'],
        },
        {
          type: 'category',
          label: 'PS5 Bazzite Deck',
          link: {type: 'doc', id: 'post-install/bazzite'},
          items: ['post-install/decky', 'post-install/bazzite-boot-options'],
        },
        {
          type: 'category',
          label: 'Other images',
          link: {type: 'doc', id: 'post-install/not-bazzite-deck'},
          items: ['post-install/package-repository', 'post-install/kernel', 'post-install/boot-to-desktop', 'post-install/other-boot-options'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      link: {type: 'doc', id: 'troubleshooting/getting-help'},
      items: [
        'troubleshooting/error-messages',
        'troubleshooting/display',
        'troubleshooting/gpu',
        'troubleshooting/ps5-pro',
        'troubleshooting/wifi',
        'troubleshooting/ethernet',
        'troubleshooting/bluetooth',
        'troubleshooting/fan',
        'troubleshooting/storage',
        'troubleshooting/audio',
        'troubleshooting/peripherals',
      ],
    },
    'credits',
  ],
};

export default sidebars;
