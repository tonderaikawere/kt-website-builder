import type { Block, BlockType } from './types';

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
      logoText: 'KAWERIFY TECH',
      items: [
        { id: '1', title: 'Home', link: '#' },
        { id: '2', title: 'Features', link: '#features' },
        { id: '3', title: 'Pricing', link: '#pricing' },
        { id: '4', title: 'Contact', link: '#contact' }
      ]
    },
    defaultStyles: {
      bgColor: '#ffffff',
      textColor: '#07162f',
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
      bgColor: '#0b4a86',
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
      bgColor: '#f6f9fd',
      textColor: '#07162f',
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
      bgColor: '#061a3b',
      textColor: '#ffffff',
      paddingTop: 'py-16',
      paddingBottom: 'py-16',
      textAlign: 'center'
    }
  },
  {
    type: 'testimonials',
    name: 'Testimonials Grid',
    description: 'Grid of customer reviews, profiles, quotes, and names.',
    defaultContent: {
      title: 'What Our Clients Say',
      subtitle: 'Hear from our clients who have built and launched their sites using our tools.',
      items: [
        { id: '1', name: 'Sarah Connor', role: 'CTO, TechCorp', quote: 'KT Builder saved us weeks of dev time. The exported HTML is super clean and performance is outstanding!', imageSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '2', name: 'John Doe', role: 'Founder, StartupX', quote: 'Offline editing in Tauri is a game-changer. I can edit and preview designs locally with full privacy.', imageSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
      ]
    },
    defaultStyles: {
      bgColor: '#ffffff',
      textColor: '#07162f',
      paddingTop: 'py-16',
      paddingBottom: 'py-16',
      textAlign: 'center'
    }
  },
  {
    type: 'pricing',
    name: 'Pricing Tables',
    description: 'Comparison pricing cards detailing subscription plans.',
    defaultContent: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that fits your business needs. Cancel anytime.',
      items: [
        { id: '1', title: 'Starter', price: '$9', period: '/mo', description: 'Perfect for testing and personal landing pages.', features: ['1 Project', 'Basic Templates', 'Standard Support'], buttonText: 'Choose Starter' },
        { id: '2', title: 'Professional', price: '$29', period: '/mo', description: 'Best choice for small businesses and creators.', features: ['Unlimited Projects', 'Premium Templates', 'Priority Email Support'], buttonText: 'Choose Pro' }
      ]
    },
    defaultStyles: {
      bgColor: '#f6f9fd',
      textColor: '#07162f',
      paddingTop: 'py-16',
      paddingBottom: 'py-16',
      textAlign: 'center'
    }
  },
  {
    type: 'contact',
    name: 'Contact Form',
    description: 'A customizable contact form section with title and description.',
    defaultContent: {
      title: 'Get In Touch',
      subtitle: 'Have questions? We would love to hear from you. Send us a message.',
      formEmailPlaceholder: 'your.email@example.com',
      formMessagePlaceholder: 'How can we help you?',
      formButtonText: 'Send Message'
    },
    defaultStyles: {
      bgColor: '#ffffff',
      textColor: '#07162f',
      paddingTop: 'py-16',
      paddingBottom: 'py-16',
      textAlign: 'center'
    }
  },
  {
    type: 'social',
    name: 'Social Links',
    description: 'A list of social media follow links with customizable icon lists.',
    defaultContent: {
      title: 'Follow Us Online',
      subtitle: 'Connect with our team across these social channels.',
      items: [
        { id: '1', title: 'Twitter', icon: 'Share2', link: '#' },
        { id: '2', title: 'GitHub', icon: 'FileCode', link: '#' },
        { id: '3', title: 'Facebook', icon: 'Layout', link: '#' }
      ]
    },
    defaultStyles: {
      bgColor: '#ffffff',
      textColor: '#07162f',
      paddingTop: 'py-12',
      paddingBottom: 'py-12',
      textAlign: 'center'
    }
  },
  {
    type: 'linkButton',
    name: 'Link Button',
    description: 'A simple section with a title, description, and custom external button link.',
    defaultContent: {
      title: 'Ready to Get Started?',
      subtitle: 'Build your online presence today with our powerful site builder.',
      buttonText: 'Learn More',
      buttonLink: 'https://example.com'
    },
    defaultStyles: {
      bgColor: '#f6f9fd',
      textColor: '#07162f',
      paddingTop: 'py-12',
      paddingBottom: 'py-12',
      textAlign: 'center'
    }
  },
  {
    type: 'video',
    name: 'Video Player',
    description: 'Embed a YouTube video player inside a section with text headers.',
    defaultContent: {
      title: 'Watch Our Presentation',
      subtitle: 'See how KT Website Builder helps you deploy projects faster.',
      youtubeId: 'dQw4w9WgXcQ'
    },
    defaultStyles: {
      bgColor: '#ffffff',
      textColor: '#07162f',
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
      copyrightText: '© 2026 Kawerify Tech. All rights reserved.',
      items: [
        { id: '1', title: 'Privacy Policy', link: '#' },
        { id: '2', title: 'Terms of Service', link: '#' }
      ]
    },
    defaultStyles: {
      bgColor: '#061a3b',
      textColor: '#94a3b8',
      paddingTop: 'py-8',
      paddingBottom: 'py-8',
      textAlign: 'center'
    }
  }
];
