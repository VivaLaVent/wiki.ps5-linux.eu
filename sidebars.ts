import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The sidebar follows the order a new user goes through:
// before you install → install → after installing (using Linux) → hardware reference → advanced → fix problems.
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
        'getting-started/firmware',
        'getting-started/which-image',
      ],
    },
    {
      type: 'category',
      label: 'Install',
      collapsed: false,
      items: [
        'installation/bazzite-deck',
        'installation/linux-image',
        'installation/booting',
        'installation/first-boot',
        'installation/m2-install',
      ],
    },
    {
      type: 'category',
      label: 'After installing',
      items: [
        'installation/post-install',
        'using-linux/display',
        'using-linux/audio',
        {
          type: 'category',
          label: 'Networking',
          items: ['using-linux/networking/ethernet', 'using-linux/networking/wifi'],
        },
        'using-linux/dualsense',
        'using-linux/bluetooth',
        'using-linux/gaming-performance',
        'using-linux/memory-and-swap',
        'using-linux/boot-to-desktop',
        'using-linux/browser-video',
      ],
    },
    {
      type: 'category',
      label: 'Hardware reference',
      items: [
        'hardware/overview',
        'hardware/ps5-pro',
        'hardware/gpu',
        'hardware/hdmi',
        'hardware/vcn',
        'hardware/usb-storage',
        'hardware/m2-compatibility',
        'hardware/led',
        'hardware/fan',
        'hardware/buzzer',
        'hardware/capture-cards',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/kernel',
        'advanced/kernel-sources',
        'advanced/package-repository',
        'advanced/warm-reboot',
        'advanced/image-build',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting & help',
      items: [
        'troubleshooting/known-issues',
        'troubleshooting/display-recovery',
        'troubleshooting/display-link-lock',
        'troubleshooting/modules-not-loading',
        'troubleshooting/getting-help',
        'troubleshooting/recovery',
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
