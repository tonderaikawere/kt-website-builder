import React from 'react';
import type { Block } from '../types';

interface BlockComponentProps {
  block: Block;
  isEditing: boolean;
  onContentChange?: (id: string, content: Partial<Block['content']>) => void;
}

export const HeaderBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { logoText = 'LOGO', items = [] } = block.content;
  const styles = block.styles;

  const handleLogoChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (onContentChange) {
      onContentChange(block.id, { logoText: e.target.innerText });
    }
  };

  const handleLinkTextChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, title: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#ffffff',
    color: styles.textColor || '#1e293b',
    textAlign: styles.textAlign || 'left',
  };

  return (
    <header 
      style={inlineStyles} 
      className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${styles.paddingTop || 'py-4'} ${styles.paddingBottom || 'py-4'}`}
    >
      <div className="font-bold text-xl tracking-tight">
        <span
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleLogoChange}
          className={isEditing ? 'outline-dashed outline-1 outline-indigo-400 px-1 rounded hover:bg-slate-50' : ''}
        >
          {logoText}
        </span>
      </div>
      <nav className="flex items-center gap-6">
        {items.map((item) => (
          <span key={item.id} className="text-sm font-medium hover:opacity-80 transition-opacity">
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleLinkTextChange(item.id, e.target.innerText)}
              className={isEditing ? 'outline-dashed outline-1 outline-indigo-400 px-1 rounded hover:bg-slate-50 cursor-text' : ''}
            >
              {item.title}
            </span>
          </span>
        ))}
      </nav>
    </header>
  );
};

export const HeroBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Title', subtitle = 'Subtitle', buttonText = 'Button', imageSrc = '' } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const handleButtonChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (onContentChange) onContentChange(block.id, { buttonText: e.target.innerText });
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#4f46e5',
    color: styles.textColor || '#ffffff',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-20'} ${styles.paddingBottom || 'py-20'} flex flex-col md:flex-row items-center gap-8`}
    >
      <div className={`flex-1 flex flex-col ${styles.textAlign === 'center' ? 'items-center text-center' : styles.textAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-white/10' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          className={`text-lg md:text-xl opacity-90 max-w-2xl mb-8 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-white/10' : ''}`}
        >
          {subtitle}
        </p>
        <div>
          <span 
            className={`inline-block px-6 py-3 font-semibold text-indigo-600 bg-white shadow hover:bg-indigo-50 transition-colors ${styles.borderRadius || 'rounded-md'}`}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleButtonChange}
              className={isEditing ? 'outline-dashed outline-1 outline-indigo-400 px-1 rounded hover:bg-slate-50 cursor-text text-slate-800' : ''}
            >
              {buttonText}
            </span>
          </span>
        </div>
      </div>
      {imageSrc && (
        <div className="flex-1 w-full max-w-md md:max-w-none relative group/img">
          <img 
            src={imageSrc} 
            alt="Hero Banner" 
            className={`w-full h-auto object-cover shadow-lg ${styles.borderRadius || 'rounded-lg'}`} 
          />
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <button
                onClick={() => {
                  const newUrl = window.prompt('Enter image URL:', imageSrc);
                  if (newUrl !== null && onContentChange) {
                    onContentChange(block.id, { imageSrc: newUrl });
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
              >
                Change Image
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

// Import icons for dynamic rendering
import * as Icons from 'lucide-react';

const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  // Map standard icons we use in templates
  switch (name) {
    case 'Layout':
      return <Icons.Layout className={className} />;
    case 'Palette':
      return <Icons.Palette className={className} />;
    case 'FileCode':
      return <Icons.FileCode className={className} />;
    case 'Zap':
      return <Icons.Zap className={className} />;
    case 'Shield':
      return <Icons.Shield className={className} />;
    case 'Share2':
      return <Icons.Share2 className={className} />;
    case 'DollarSign':
      return <Icons.DollarSign className={className} />;
    case 'Phone':
      return <Icons.Phone className={className} />;
    default:
      return <Icons.HelpCircle className={className} />;
  }
};

export const FeaturesBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Features', subtitle = 'Subtitle', items = [] } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const handleItemTitleChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, title: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const handleItemDescChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, description: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#f8fafc',
    color: styles.textColor || '#1e293b',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-16'} ${styles.paddingBottom || 'py-16'}`}
    >
      <div className="max-w-4xl mx-auto mb-12">
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          className={`text-3xl font-extrabold mb-3 tracking-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          className={`text-slate-600 opacity-90 max-w-2xl mx-auto ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col ${styles.textAlign === 'left' ? 'items-start text-left' : styles.textAlign === 'right' ? 'items-end text-right' : 'items-center text-center'}`}
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg mb-4">
              <IconRenderer name={item.icon || 'Layout'} className="w-6 h-6" />
            </div>
            <h3 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleItemTitleChange(item.id, e.target.innerText)}
              className={`text-lg font-bold mb-2 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-slate-50' : ''}`}
            >
              {item.title}
            </h3>
            <p 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleItemDescChange(item.id, e.target.innerText)}
              className={`text-sm text-slate-500 leading-relaxed ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-slate-50' : ''}`}
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export const CtaBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Call to Action', subtitle = 'Subtitle', buttonText = 'Button' } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const handleButtonChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (onContentChange) onContentChange(block.id, { buttonText: e.target.innerText });
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#1e1b4b',
    color: styles.textColor || '#ffffff',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-16'} ${styles.paddingBottom || 'py-16'}`}
    >
      <div className={`max-w-4xl mx-auto flex flex-col ${styles.textAlign === 'center' ? 'items-center text-center' : styles.textAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          className={`text-3xl md:text-4xl font-extrabold mb-4 tracking-tight leading-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-white/10' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          className={`text-lg opacity-80 max-w-2xl mb-8 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-white/10' : ''}`}
        >
          {subtitle}
        </p>
        <div>
          <span 
            className={`inline-block px-6 py-3 font-semibold text-indigo-600 bg-white shadow hover:bg-indigo-50 transition-colors ${styles.borderRadius || 'rounded-md'}`}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleButtonChange}
              className={isEditing ? 'outline-dashed outline-1 outline-indigo-400 px-1 rounded hover:bg-slate-50 cursor-text text-slate-800' : ''}
            >
              {buttonText}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
};

export const FooterBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { copyrightText = '© Copyright text', items = [] } = block.content;
  const styles = block.styles;

  const handleCopyrightChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { copyrightText: e.target.innerText });
  };

  const handleLinkTextChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, title: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#0f172a',
    color: styles.textColor || '#94a3b8',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <footer 
      style={inlineStyles} 
      className={`px-8 py-12 ${styles.paddingTop || 'py-8'} ${styles.paddingBottom || 'py-8'} border-t border-slate-800`}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleCopyrightChange}
          className={`text-sm ${isEditing ? 'outline-dashed outline-1 outline-indigo-400 px-1 rounded hover:bg-white/5' : ''}`}
        >
          {copyrightText}
        </p>
        <div className="flex gap-6">
          {items.map((item) => (
            <span key={item.id} className="text-sm font-medium hover:text-white transition-colors">
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleLinkTextChange(item.id, e.target.innerText)}
                className={isEditing ? 'outline-dashed outline-1 outline-indigo-400 px-1 rounded hover:bg-white/5 cursor-text' : ''}
              >
                {item.title}
              </span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const TestimonialsBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Testimonials', subtitle = 'Subtitle', items = [] } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const handleItemNameChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, name: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const handleItemRoleChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, role: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const handleItemQuoteChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, quote: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#ffffff',
    color: styles.textColor || '#1e293b',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-16'} ${styles.paddingBottom || 'py-16'}`}
    >
      <div className="max-w-4xl mx-auto mb-12">
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          className={`text-3xl font-extrabold mb-3 tracking-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          className={`text-slate-600 opacity-90 max-w-2xl mx-auto ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center shadow-sm"
          >
            {item.imageSrc && (
              <div className="relative group/avatar mb-4 shrink-0">
                <img 
                  src={item.imageSrc} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      const newUrl = window.prompt('Enter avatar image URL:', item.imageSrc);
                      if (newUrl !== null && onContentChange && items) {
                        const updatedItems = items.map(it => 
                          it.id === item.id ? { ...it, imageSrc: newUrl } : it
                        );
                        onContentChange(block.id, { items: updatedItems });
                      }
                    }}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-full text-[8px] font-bold text-white cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
            <p 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleItemQuoteChange(item.id, e.target.innerText)}
              className={`text-sm italic text-slate-600 leading-relaxed mb-6 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-slate-50' : ''}`}
            >
              "{item.quote}"
            </p>
            <div className="mt-auto">
              <h4 
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleItemNameChange(item.id, e.target.innerText)}
                className={`font-bold text-sm text-slate-800 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-slate-50' : ''}`}
              >
                {item.name}
              </h4>
              <p 
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleItemRoleChange(item.id, e.target.innerText)}
                className={`text-xs text-indigo-600 font-medium ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-slate-50' : ''}`}
              >
                {item.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const PricingBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Pricing Plans', subtitle = 'Subtitle', items = [] } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const handleItemTitleChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, title: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const handleItemPriceChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, price: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const handleItemDescChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, description: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const handleItemButtonChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, buttonText: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#f8fafc',
    color: styles.textColor || '#1e293b',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-16'} ${styles.paddingBottom || 'py-16'}`}
    >
      <div className="max-w-4xl mx-auto mb-12">
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          className={`text-3xl font-extrabold mb-3 tracking-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          className={`text-slate-600 opacity-90 max-w-2xl mx-auto ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="p-8 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-md relative hover:shadow-lg transition-shadow"
          >
            <h3 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleItemTitleChange(item.id, e.target.innerText)}
              className={`text-xl font-bold mb-2 text-slate-800 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-slate-50' : ''}`}
            >
              {item.title}
            </h3>
            <p 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleItemDescChange(item.id, e.target.innerText)}
              className={`text-xs text-slate-400 mb-6 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-slate-50' : ''}`}
            >
              {item.description}
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-6 text-slate-900">
              <span 
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleItemPriceChange(item.id, e.target.innerText)}
                className={`text-4xl font-extrabold tracking-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-slate-50' : ''}`}
              >
                {item.price}
              </span>
              <span className="text-sm font-semibold text-slate-500">{item.period || '/mo'}</span>
            </div>
            
            <ul className="space-y-3 mb-8 text-left text-sm text-slate-600 max-w-[240px] mx-auto w-full">
              {item.features?.map((feat, fidx) => (
                <li key={fidx} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-auto pt-4">
              <span 
                className={`block w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm ${styles.borderRadius || 'rounded-lg'}`}
              >
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemButtonChange(item.id, e.target.innerText)}
                  className={isEditing ? 'outline-dashed outline-1 outline-indigo-400 px-1 rounded hover:bg-slate-50/20 cursor-text text-white' : ''}
                >
                  {item.buttonText}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const ContactBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Contact Us', subtitle = 'Subtitle', formEmailPlaceholder = 'Email', formMessagePlaceholder = 'Message', formButtonText = 'Send' } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const handleEmailPlaceholderChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (onContentChange) onContentChange(block.id, { formEmailPlaceholder: e.target.innerText });
  };

  const handleMessagePlaceholderChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (onContentChange) onContentChange(block.id, { formMessagePlaceholder: e.target.innerText });
  };

  const handleButtonTextChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (onContentChange) onContentChange(block.id, { formButtonText: e.target.innerText });
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#ffffff',
    color: styles.textColor || '#1e293b',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-16'} ${styles.paddingBottom || 'py-16'}`}
    >
      <div className="max-w-4xl mx-auto mb-10">
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          className={`text-3xl font-extrabold mb-3 tracking-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          className={`text-slate-600 opacity-90 max-w-2xl mx-auto ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {subtitle}
        </p>
      </div>

      <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/60 p-6 rounded-2xl shadow-sm text-left">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                disabled
                placeholder={formEmailPlaceholder}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg cursor-not-allowed focus:outline-none"
              />
              {isEditing && (
                <span 
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handleEmailPlaceholderChange}
                  className="absolute right-3 text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 outline-dashed outline-1 outline-indigo-400 px-1 rounded bg-indigo-50 cursor-text"
                  title="Edit Placeholder"
                >
                  {formEmailPlaceholder}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Message</label>
            <div className="relative">
              <textarea
                rows={3}
                disabled
                placeholder={formMessagePlaceholder}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg cursor-not-allowed focus:outline-none resize-none"
              />
              {isEditing && (
                <span 
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={handleMessagePlaceholderChange}
                  className="absolute bottom-3 right-3 text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 outline-dashed outline-1 outline-indigo-400 px-1 rounded bg-indigo-50 cursor-text"
                  title="Edit Placeholder"
                >
                  {formMessagePlaceholder}
                </span>
              )}
            </div>
          </div>
          
          <button
            type="button"
            className={`w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm ${styles.borderRadius || 'rounded-lg'} flex items-center justify-center`}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleButtonTextChange}
              className={isEditing ? 'outline-dashed outline-1 outline-indigo-400 px-1 rounded hover:bg-slate-50/20 cursor-text text-white' : ''}
            >
              {formButtonText}
            </span>
          </button>
        </form>
      </div>
    </section>
  );
};

export const SocialBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Social Links', subtitle = 'Subtitle', items = [] } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const handleItemTitleChange = (itemId: string, text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, title: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#ffffff',
    color: styles.textColor || '#1e293b',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-12'} ${styles.paddingBottom || 'py-12'}`}
    >
      <div className="max-w-4xl mx-auto mb-6">
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          className={`text-2xl font-bold mb-2 tracking-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          className={`text-sm text-slate-500 opacity-90 max-w-xl mx-auto ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {subtitle}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 max-w-xl mx-auto">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-1.5">
            <a 
              href={item.link || '#'}
              className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm"
            >
              <IconRenderer name={item.icon || 'Layout'} className="w-5 h-5" />
            </a>
            <span 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleItemTitleChange(item.id, e.target.innerText)}
              className={`text-[10px] font-semibold text-slate-500 hover:text-slate-800 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-slate-50' : ''}`}
            >
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export const LinkButtonBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Link Button', subtitle = 'Subtitle', buttonText = 'Button', buttonLink = '#' } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const handleButtonTextChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (onContentChange) onContentChange(block.id, { buttonText: e.target.innerText });
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#f1f5f9',
    color: styles.textColor || '#1e293b',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-12'} ${styles.paddingBottom || 'py-12'}`}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          className={`text-2xl font-bold mb-2 tracking-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          className={`text-sm opacity-90 max-w-xl mb-6 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {subtitle}
        </p>
        <div className="relative group/btn flex items-center gap-2">
          <a
            href={isEditing ? undefined : buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block py-2.5 px-6 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm ${styles.borderRadius || 'rounded-lg'}`}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleButtonTextChange}
              className={isEditing ? 'outline-dashed outline-1 outline-indigo-400 px-1 rounded hover:bg-slate-50/20 cursor-text text-white' : ''}
            >
              {buttonText}
            </span>
          </a>
          {isEditing && (
            <button
              onClick={() => {
                const newLink = window.prompt('Enter button URL link:', buttonLink);
                if (newLink !== null && onContentChange) {
                  onContentChange(block.id, { buttonLink: newLink });
                }
              }}
              className="p-1 bg-white border border-slate-200 rounded-md text-[10px] text-slate-500 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer"
              title="Edit Link URL"
            >
              Link
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export const VideoBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Video Player', subtitle = 'Subtitle', youtubeId = 'dQw4w9WgXcQ' } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const inlineStyles: React.CSSProperties = {
    backgroundColor: styles.bgColor || '#ffffff',
    color: styles.textColor || '#1e293b',
    textAlign: styles.textAlign || 'center',
  };

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-16'} ${styles.paddingBottom || 'py-16'}`}
    >
      <div className="max-w-4xl mx-auto mb-8">
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          className={`text-3xl font-extrabold mb-3 tracking-tight ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          className={`text-slate-600 opacity-90 max-w-2xl mx-auto ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {subtitle}
        </p>
      </div>

      <div className="max-w-3xl mx-auto relative group/video">
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-slate-900 border border-slate-200">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="Embedded Video"
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        {isEditing && (
          <button
            onClick={() => {
              const newUrl = window.prompt('Enter YouTube Video ID (e.g. dQw4w9WgXcQ):', youtubeId);
              if (newUrl !== null && onContentChange) {
                onContentChange(block.id, { youtubeId: newUrl.trim() });
              }
            }}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Change Video ID
          </button>
        )}
      </div>
    </section>
  );
};

export const BlockRenderer: React.FC<{
  block: Block;
  isEditing: boolean;
  onContentChange: (id: string, content: Partial<Block['content']>) => void;
}> = ({ block, isEditing, onContentChange }) => {
  switch (block.type) {
    case 'header':
      return <HeaderBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'hero':
      return <HeroBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'features':
      return <FeaturesBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'cta':
      return <CtaBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'testimonials':
      return <TestimonialsBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'pricing':
      return <PricingBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'contact':
      return <ContactBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'social':
      return <SocialBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'linkButton':
      return <LinkButtonBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'video':
      return <VideoBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'footer':
      return <FooterBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    default:
      return (
        <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200">
          Component <strong>{block.name}</strong> ({block.type}) is loaded.
        </div>
      );
  }
};
