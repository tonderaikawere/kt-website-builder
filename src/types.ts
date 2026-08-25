export interface BlockStyles {
  bgColor?: string;
  bgImage?: string;
  bgGradient?: string;
  textColor?: string;
  paddingTop?: string; // e.g. "py-12"
  paddingBottom?: string;
  marginTop?: string;
  marginBottom?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: string; // e.g. "rounded-none", "rounded-lg"
  borderWidth?: string;
  borderColor?: string;
  flexJustify?: string;
  flexAlign?: string;
  customCss?: string;
  width?: string;
  height?: string;
  x?: string;
  y?: string;
  rotation?: string;
  opacity?: string;
  shadow?: string;
  lineHeight?: string;
}

export type BlockType = 
  | 'header' 
  | 'hero' 
  | 'features' 
  | 'cta' 
  | 'testimonials' 
  | 'pricing' 
  | 'contact' 
  | 'social' 
  | 'button' 
  | 'linkButton'
  | 'video' 
  | 'sandbox'
  | 'portfolio'
  | 'gallery'
  | 'faq'
  | 'ecommerce'
  | 'footer';

export interface Page {
  id: string;
  name: string;
  slug: string;
  blocks: Block[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  name: string;
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    imageSrc?: string;
    videoUrl?: string;
    youtubeId?: string;
    items?: Array<{
      id: string;
      title?: string;
      description?: string;
      icon?: string;
      name?: string;
      role?: string;
      quote?: string;
      price?: string;
      period?: string;
      features?: string[];
      link?: string;
      imageSrc?: string;
      image?: string;
      category?: string;
      buttonText?: string;
    }>;
    logoText?: string;
    copyrightText?: string;
    formEmailPlaceholder?: string;
    formMessagePlaceholder?: string;
    formButtonText?: string;
    drawingData?: string;
    logoTextFontSize?: string;
    logoTextColor?: string;
    titleFontSize?: string;
    titleColor?: string;
    subtitleFontSize?: string;
    subtitleColor?: string;
    descriptionFontSize?: string;
    descriptionColor?: string;
  };
  styles: BlockStyles;
}

export interface ProjectSettings {
  title: string;
  description: string;
  customGlobalCss: string;
  fontFamily: string;
  faviconUrl: string;
}

export interface Project {
  id: string;
  name: string;
  pages: Page[];
  settings: ProjectSettings;
  updatedAt: string;
}
