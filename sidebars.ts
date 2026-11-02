import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The sidebar follows the order a new user goes through:
// get ready → install → use Linux → hardware reference → fix problems.
const sidebars: SidebarsConfig = {
  wikiSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: [
        'getting-started/overview',
        'getting-started/firmware',
        'getting-started/prerequisites',
      ],
    },
    {
      type: 'category',
      label: 'Installation',
      collapsed: false,
      items: [
        'installation/linux-image',
        'installation/booting',
        'installation/first-boot',
        'installation/m2-install',
      ],
    },
    {
      type: 'category',
      label: 'Using Linux',
      items: [
        'using-linux/display',
        'using-linux/audio',
        {
          type: 'category',
          label: 'Networking',
          items: ['using-linux/networking/ethernet', 'using-linux/networking/wifi'],
        },
        'using-linux/dualsense',
        'using-linux/gaming-performance',
      ],
    },
    {
      type: 'category',
      label: 'Hardware reference',
      items: [
        'hardware/overview',
        'hardware/gpu',
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
      items: ['advanced/kernel'],
    },
    {
      type: 'category',
      label: 'Troubleshooting & help',
      items: [
        'troubleshooting/known-issues',
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
