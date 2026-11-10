import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The order a new user goes through: welcome → before you install → install → after installing → updating → troubleshooting.
// After installing: three groups only, all images, PS5 Bazzite Deck and the other images; a topic that differs per image
// gets a page for what they share and one child per group (First boot, Install to the M.2, Warm reboots, Build your own;
// boot options sit with their group).
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
              items: [
                'choose/image-build',
                {
                  type: 'category',
                  label: 'Other images',
                  link: {type: 'doc', id: 'choose/build-other-images'},
                  items: ['choose/kernel-sources'],
                },
              ],
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
        {
          type: 'category',
          label: 'First boot',
          link: {type: 'doc', id: 'installation/first-boot'},
          items: ['installation/first-boot-bazzite-deck', 'installation/first-boot-other-images'],
        },
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
          items: [
            'post-install/ssh',
            {
              type: 'category',
              label: 'DualSense',
              link: {type: 'doc', id: 'post-install/dualsense'},
              items: ['post-install/dualsense-bazzite-deck'],
            },
            'post-install/browser-video',
            {
              type: 'category',
              label: 'Warm reboots',
              link: {type: 'doc', id: 'post-install/warm-reboot'},
              items: ['post-install/warm-reboot-bazzite-deck', 'post-install/warm-reboot-other-images'],
            },
            'post-install/boot-options',
          ],
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
      label: 'Updating',
      link: {type: 'doc', id: 'updating/overview'},
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'PS5 Bazzite Deck',
          link: {type: 'doc', id: 'updating/bazzite-deck'},
          items: ['updating/bootc', 'updating/legacy'],
        },
        'updating/other-images',
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
