export interface BlockStyles {
  bgColor?: string;
  textColor?: string;
  paddingTop?: string; // e.g. "py-12"
  paddingBottom?: string;
  marginTop?: string;
  marginBottom?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: string; // e.g. "rounded-none", "rounded-lg"
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
  | 'video' 
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
    }>;
    logoText?: string;
    copyrightText?: string;
    formEmailPlaceholder?: string;
    formMessagePlaceholder?: string;
    formButtonText?: string;
  };
  styles: BlockStyles;
}

export interface ProjectSettings {
  title: string;
  description: string;
  customGlobalCss: string;
  fontFamily: string;
}

export interface Project {
  blocks: Block[];
  settings: ProjectSettings;
}
