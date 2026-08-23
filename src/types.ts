export interface BlockStyles {
  bgColor?: string;
  bgImage?: string;
  textColor?: string;
  paddingTop?: string; // e.g. "py-12"
  paddingBottom?: string;
  marginTop?: string;
  marginBottom?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: string; // e.g. "rounded-none", "rounded-lg"
  flexJustify?: string;
  flexAlign?: string;
  customCss?: string;
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
  | 'footer';

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
  blocks: Block[];
  settings: ProjectSettings;
}
