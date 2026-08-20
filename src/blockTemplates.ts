import { Block, BlockType } from './types';

export interface BlockTemplate {
  type: BlockType;
  name: string;
  description: string;
  defaultContent: Block['content'];
  defaultStyles: Block['styles'];
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    type: 'header',
    name: 'Navigation Header',
    description: 'Header navigation bar with logo and list of page links.',
    defaultContent: {
      logoText: 'KT BUILDER',
      items: [
        { id: '1', title: 'Home', link: '#' },
        { id: '2', title: 'Features', link: '#features' },
        { id: '3', title: 'Pricing', link: '#pricing' },
        { id: '4', title: 'Contact', link: '#contact' }
      ]
    },
    defaultStyles: {
      bgColor: '#ffffff',
      textColor: '#1e293b',
      paddingTop: 'py-4',
      paddingBottom: 'py-4',
      textAlign: 'left'
    }
  },
  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Attention grabbing banner with title, background and action button.',
    defaultContent: {
      title: 'Build Stunning Websites Instantly',
      subtitle: 'The ultimate visual builder designed for rapid web creation and elegant local design.',
      buttonText: 'Get Started Free',
      buttonLink: '#',
      imageSrc: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80'
    },
    defaultStyles: {
      bgColor: '#4f46e5',
      textColor: '#ffffff',
      paddingTop: 'py-20',
      paddingBottom: 'py-20',
      textAlign: 'center'
    }
  },
  {
    type: 'features',
    name: 'Feature Grid',
    description: 'Grid layout of icons, headings and descriptions detailing features.',
    defaultContent: {
      title: 'Our Amazing Features',
      subtitle: 'Everything you need to create professional sites that load fast and look great.',
      items: [
        { id: '1', title: 'Drag & Drop', description: 'Easily rearrange blocks to build pages intuitively.', icon: 'Layout' },
        { id: '2', title: 'Custom Styling', description: 'Take complete control over colors, spacing, and borders.', icon: 'Palette' },
        { id: '3', title: 'Clean Export', description: 'Export standard-compliant HTML, CSS, and JSON templates.', icon: 'FileCode' }
      ]
    },
    defaultStyles: {
      bgColor: '#f8fafc',
      textColor: '#1e293b',
      paddingTop: 'py-16',
      paddingBottom: 'py-16',
      textAlign: 'center'
    }
  },
  {
    type: 'cta',
    name: 'Call To Action',
    description: 'Conversion-focused banner with action button to drive signups.',
    defaultContent: {
      title: 'Ready to launch your online presence?',
      subtitle: 'Create a website builder project now and export clean site source code today.',
      buttonText: 'Launch Builder',
      buttonLink: '#'
    },
    defaultStyles: {
      bgColor: '#1e1b4b',
      textColor: '#ffffff',
      paddingTop: 'py-16',
      paddingBottom: 'py-16',
      textAlign: 'center'
    }
  },
  {
    type: 'footer',
    name: 'Simple Footer',
    description: 'Clean website footer with copyright notice and simple link structure.',
    defaultContent: {
      copyrightText: '© 2026 KT Website Builder. All rights reserved.',
      items: [
        { id: '1', title: 'Privacy Policy', link: '#' },
        { id: '2', title: 'Terms of Service', link: '#' }
      ]
    },
    defaultStyles: {
      bgColor: '#0f172a',
      textColor: '#94a3b8',
      paddingTop: 'py-8',
      paddingBottom: 'py-8',
      textAlign: 'center'
    }
  }
];
