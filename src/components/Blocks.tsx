import React, { useState, useEffect, useRef } from 'react';
import type { Block } from '../types';

interface BlockComponentProps {
  block: Block;
  isEditing: boolean;
  onContentChange?: (id: string, content: Partial<Block['content']>) => void;
  selectedElement?: { blockId: string; elementPath: string; elementType: string } | null;
  onSelectElement?: (blockId: string, elementPath: string, elementType: string) => void;
}

const getBlockStyles = (
  styles: Block['styles'],
  defaultBg: string,
  defaultText: string,
  defaultAlign: 'left' | 'center' | 'right' | 'justify' = 'center'
): React.CSSProperties => {
  return {
    backgroundColor: styles.bgImage ? undefined : (styles.bgColor || defaultBg),
    backgroundImage: styles.bgImage ? `url(${styles.bgImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: styles.textColor || defaultText,
    textAlign: styles.textAlign || defaultAlign,
  };
};

const getSelectionBorderClass = (
  blockId: string,
  elementPath: string,
  selectedElement: { blockId: string; elementPath: string; elementType: string } | null | undefined,
  isEditing: boolean
): string => {
  if (!isEditing) return '';
  const isSelected = selectedElement && 
                     selectedElement.blockId === blockId && 
                     selectedElement.elementPath === elementPath;
  return `cursor-pointer transition-all duration-150 ${
    isSelected 
      ? 'ring-2 ring-brand-accent ring-offset-1 rounded-md px-1 bg-brand-accent-bg/10' 
      : 'hover:outline-dashed hover:outline-1 hover:outline-slate-400 hover:bg-slate-500/5 px-1 rounded'
  }`;
};

const FloatingFormatToolbar: React.FC<{
  onSelectElement?: (blockId: string, elementPath: string, elementType: string) => void;
}> = ({ onSelectElement }) => {
  const triggerFormat = (e: React.MouseEvent, cmd: string) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand(cmd, false);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectElement) {
      onSelectElement('', '', '');
    }
  };

  return (
    <div 
      contentEditable={false}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl z-50 flex items-center gap-1.5 select-none animate-in fade-in slide-in-from-bottom-2 duration-150 text-[10px] font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onMouseDown={(e) => triggerFormat(e, 'bold')}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-bold w-6 h-6 flex items-center justify-center cursor-pointer text-xs"
        title="Bold text"
      >
        B
      </button>
      <button
        onMouseDown={(e) => triggerFormat(e, 'italic')}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 italic w-6 h-6 flex items-center justify-center cursor-pointer text-xs"
        title="Italic text"
      >
        I
      </button>
      <button
        onMouseDown={(e) => triggerFormat(e, 'underline')}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 underline w-6 h-6 flex items-center justify-center cursor-pointer text-xs"
        title="Underline text"
      >
        U
      </button>
      
      <div className="w-px h-4 bg-slate-250 dark:bg-slate-805 mx-0.5"></div>

      <button
        onMouseDown={(e) => triggerFormat(e, 'justifyLeft')}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer w-6 h-6"
        title="Align Left"
      >
        <Icons.AlignLeft className="w-3.5 h-3.5" />
      </button>
      <button
        onMouseDown={(e) => triggerFormat(e, 'justifyCenter')}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer w-6 h-6"
        title="Align Center"
      >
        <Icons.AlignCenter className="w-3.5 h-3.5" />
      </button>
      <button
        onMouseDown={(e) => triggerFormat(e, 'justifyRight')}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer w-6 h-6"
        title="Align Right"
      >
        <Icons.AlignRight className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-slate-250 dark:bg-slate-805 mx-0.5"></div>
      
      <button
        onClick={handleClearSelection}
        className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-white px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-pointer font-medium"
        title="Close floating format panel"
      >
        Done
      </button>
    </div>
  );
};

const FigmaResizeHandles: React.FC = () => {
  return (
    <>
      {/* Left border line and drag handle */}
      <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-brand-accent -translate-x-[2px] select-none pointer-events-none z-40">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[6px] h-[12px] bg-white border border-brand-accent rounded cursor-ew-resize"></div>
      </div>
      {/* Right border line and drag handle */}
      <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-brand-accent translate-x-[2px] select-none pointer-events-none z-40">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[6px] h-[12px] bg-white border border-brand-accent rounded cursor-ew-resize"></div>
      </div>
    </>
  );
};

export const HeaderBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange, selectedElement, onSelectElement }) => {
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

  const inlineStyles = getBlockStyles(styles, '#ffffff', '#1e293b', 'left');

  return (
    <header 
      style={inlineStyles} 
      className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${styles.paddingTop || 'py-4'} ${styles.paddingBottom || 'py-4'}`}
    >
      <div className="font-bold text-xl tracking-tight relative">
        <span
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleLogoChange}
          onClick={(e) => {
            if (!isEditing) return;
            e.stopPropagation();
            if (onSelectElement) onSelectElement(block.id, 'logoText', 'logoText');
          }}
          className={getSelectionBorderClass(block.id, 'logoText', selectedElement, isEditing)}
        >
          {logoText}
        </span>
        {isEditing && selectedElement && selectedElement.blockId === block.id && selectedElement.elementPath === 'logoText' && (
          <>
            <FigmaResizeHandles />
            <FloatingFormatToolbar onSelectElement={onSelectElement} />
          </>
        )}
      </div>
      <nav className="flex items-center gap-6">
        {items.map((item) => {
          const isLinkSelected = selectedElement && selectedElement.blockId === block.id && selectedElement.elementPath === `items.${item.id}.title`;
          return (
            <span key={item.id} className="text-sm font-medium hover:opacity-80 transition-opacity relative">
              <span
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleLinkTextChange(item.id, e.target.innerText)}
                onClick={(e) => {
                  if (!isEditing) return;
                  e.stopPropagation();
                  if (onSelectElement) onSelectElement(block.id, `items.${item.id}.title`, 'link');
                }}
                className={getSelectionBorderClass(block.id, `items.${item.id}.title`, selectedElement, isEditing)}
              >
                {item.title}
              </span>
              {isEditing && isLinkSelected && (
                <>
                  <FigmaResizeHandles />
                  <FloatingFormatToolbar onSelectElement={onSelectElement} />
                </>
              )}
            </span>
          );
        })}
      </nav>
    </header>
  );
};

export const HeroBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange, selectedElement, onSelectElement }) => {
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

  const inlineStyles = getBlockStyles(styles, '#4f46e5', '#ffffff', 'center');

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-20'} ${styles.paddingBottom || 'py-20'} flex flex-col md:flex-row ${styles.flexAlign || 'items-center'} ${styles.flexJustify || 'justify-center'} gap-8`}
    >
      <div className={`flex-1 flex flex-col ${styles.textAlign === 'center' ? 'items-center text-center' : styles.textAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
        <div className="relative w-full">
          <h2 
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleTitleChange}
            onClick={(e) => {
              if (!isEditing) return;
              e.stopPropagation();
              if (onSelectElement) onSelectElement(block.id, 'title', 'title');
            }}
            className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight ${getSelectionBorderClass(block.id, 'title', selectedElement, isEditing)}`}
          >
            {title}
          </h2>
          {isEditing && selectedElement && selectedElement.blockId === block.id && selectedElement.elementPath === 'title' && (
            <>
              <FigmaResizeHandles />
              <FloatingFormatToolbar onSelectElement={onSelectElement} />
            </>
          )}
        </div>
        <div className="relative w-full">
          <p 
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleSubtitleChange}
            onClick={(e) => {
              if (!isEditing) return;
              e.stopPropagation();
              if (onSelectElement) onSelectElement(block.id, 'subtitle', 'subtitle');
            }}
            className={`text-lg md:text-xl opacity-90 max-w-2xl mb-8 ${getSelectionBorderClass(block.id, 'subtitle', selectedElement, isEditing)}`}
          >
            {subtitle}
          </p>
          {isEditing && selectedElement && selectedElement.blockId === block.id && selectedElement.elementPath === 'subtitle' && (
            <>
              <FigmaResizeHandles />
              <FloatingFormatToolbar onSelectElement={onSelectElement} />
            </>
          )}
        </div>
        <div className="relative">
          <span 
            className={`inline-block px-6 py-3 font-semibold text-indigo-600 bg-white shadow hover:bg-indigo-50 transition-colors ${styles.borderRadius || 'rounded-md'}`}
          >
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleButtonChange}
              onClick={(e) => {
                if (!isEditing) return;
                e.stopPropagation();
                if (onSelectElement) onSelectElement(block.id, 'buttonText', 'button');
              }}
              className={`px-1 rounded cursor-text text-slate-800 ${getSelectionBorderClass(block.id, 'buttonText', selectedElement, isEditing)}`}
            >
              {buttonText}
            </span>
          </span>
          {isEditing && selectedElement && selectedElement.blockId === block.id && selectedElement.elementPath === 'buttonText' && (
            <>
              <FigmaResizeHandles />
              <FloatingFormatToolbar onSelectElement={onSelectElement} />
            </>
          )}
        </div>
      </div>
      {imageSrc && (
        <div className="flex-1 w-full max-w-md md:max-w-none relative group/img">
          <img 
            src={imageSrc} 
            alt="Hero Banner" 
            onClick={(e) => {
              if (!isEditing) return;
              e.stopPropagation();
              if (onSelectElement) onSelectElement(block.id, 'imageSrc', 'image');
            }}
            className={`w-full h-auto object-cover shadow-lg ${styles.borderRadius || 'rounded-lg'} ${getSelectionBorderClass(block.id, 'imageSrc', selectedElement, isEditing)}`} 
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

export const FeaturesBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange, selectedElement, onSelectElement }) => {
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

  const inlineStyles = getBlockStyles(styles, '#f8fafc', '#1e293b', 'center');

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
          onClick={(e) => {
            if (!isEditing) return;
            e.stopPropagation();
            if (onSelectElement) onSelectElement(block.id, 'title', 'title');
          }}
          className={`text-3xl font-extrabold tracking-tight mb-3 ${getSelectionBorderClass(block.id, 'title', selectedElement, isEditing)}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleSubtitleChange}
          onClick={(e) => {
            if (!isEditing) return;
            e.stopPropagation();
            if (onSelectElement) onSelectElement(block.id, 'subtitle', 'subtitle');
          }}
          className={`text-slate-650 opacity-90 max-w-2xl mx-auto ${getSelectionBorderClass(block.id, 'subtitle', selectedElement, isEditing)}`}
        >
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`p-6 bg-white dark:bg-brand-deep rounded-xl shadow-sm border border-slate-100 dark:border-brand-ink flex flex-col ${styles.textAlign === 'left' ? 'items-start text-left' : styles.textAlign === 'right' ? 'items-end text-right' : 'items-center text-center'}`}
          >
            <div 
              onClick={(e) => {
                if (!isEditing) return;
                e.stopPropagation();
                if (onSelectElement) onSelectElement(block.id, `items.${item.id}.icon`, 'icon');
              }}
              className={`p-3 bg-indigo-50 text-indigo-600 rounded-lg mb-4 ${getSelectionBorderClass(block.id, `items.${item.id}.icon`, selectedElement, isEditing)}`}
            >
              <IconRenderer name={item.icon || 'Layout'} className="w-6 h-6" />
            </div>
            <h3 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleItemTitleChange(item.id, e.target.innerText)}
              onClick={(e) => {
                if (!isEditing) return;
                e.stopPropagation();
                if (onSelectElement) onSelectElement(block.id, `items.${item.id}.title`, 'title');
              }}
              className={`text-lg font-bold mb-2 ${getSelectionBorderClass(block.id, `items.${item.id}.title`, selectedElement, isEditing)}`}
            >
              {item.title}
            </h3>
            <p 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleItemDescChange(item.id, e.target.innerText)}
              onClick={(e) => {
                if (!isEditing) return;
                e.stopPropagation();
                if (onSelectElement) onSelectElement(block.id, `items.${item.id}.description`, 'description');
              }}
              className={`text-sm text-slate-550 leading-relaxed ${getSelectionBorderClass(block.id, `items.${item.id}.description`, selectedElement, isEditing)}`}
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
      <div className={`max-w-4xl mx-auto flex flex-col ${styles.flexAlign || (styles.textAlign === 'center' ? 'items-center text-center' : styles.textAlign === 'right' ? 'items-end text-right' : 'items-start text-left')} ${styles.flexJustify || 'justify-center'}`}>
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

export const SandboxBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange }) => {
  const { title = 'Visual Design Canvas', subtitle = 'Use the drawing tools to sketch your layout and align objects.', drawingData = '' } = block.content;
  const styles = block.styles;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'rect' | 'circle' | 'eraser'>('pen');
  const [color, setColor] = useState('#aa3bff');
  const [thickness, setThickness] = useState(4);
  const [showGrid, setShowGrid] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fillShape, setFillShape] = useState(false);

  // Initialize and load saved canvas drawingData
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = 400; // Fixed canvas height inside section
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = drawingData;
    }
  }, [drawingData]);

  // Handle drawing events
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    setIsDrawing(true);
    setStartPos(coords);

    // Save snapshot of canvas before drawing shape
    const snapshot = canvas.toDataURL();
    setCanvasHistory((prev: string[]) => [...prev.slice(0, historyIndex + 1), snapshot]);
    setHistoryIndex((prev: number) => prev + 1);

    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.fillStyle = 'transparent';

    if (tool === 'pen' || tool === 'eraser') {
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isEditing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    const width = canvas.width;
    const height = canvas.height;

    let targetX = coords.x;
    let targetY = coords.y;
    let snappedX = false;
    let snappedY = false;

    // Snap to center guideline X (if close to center)
    if (Math.abs(targetX - width / 2) < 8) {
      targetX = width / 2;
      snappedX = true;
    }
    // Snap to center guideline Y (if close to center)
    if (Math.abs(targetY - height / 2) < 8) {
      targetY = height / 2;
      snappedY = true;
    }

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      
      // Draw smart guide lines for freehand if snapped
      if (snappedX) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.restore();
      }
      if (snappedY) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // For shapes (rect / circle), redraw the canvas state snapshot before rendering shape
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;

        if (tool === 'rect') {
          if (fillShape) {
            ctx.fillStyle = color;
            ctx.fillRect(startPos.x, startPos.y, targetX - startPos.x, targetY - startPos.y);
          } else {
            ctx.strokeRect(startPos.x, startPos.y, targetX - startPos.x, targetY - startPos.y);
          }
        } else if (tool === 'circle') {
          const radius = Math.sqrt(Math.pow(targetX - startPos.x, 2) + Math.pow(targetY - startPos.y, 2));
          ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
          if (fillShape) {
            ctx.fillStyle = color;
            ctx.fill();
          } else {
            ctx.stroke();
          }
        }

        // Render smart red snapped guide lines
        if (snappedX) {
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.moveTo(width / 2, 0);
          ctx.lineTo(width / 2, height);
          ctx.stroke();
        }
        if (snappedY) {
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      };
      img.src = canvasHistory[canvasHistory.length - 1];
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !isEditing) return;
    setIsDrawing(false);

    // Save drawing back to state
    const canvas = canvasRef.current;
    if (canvas && onContentChange) {
      const dataUrl = canvas.toDataURL();
      onContentChange(block.id, { drawingData: dataUrl });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (onContentChange) {
      onContentChange(block.id, { drawingData: '' });
    }
    setCanvasHistory([]);
    setHistoryIndex(-1);
  };

  const alignCanvasContent = (direction: 'horizontal' | 'vertical' | 'both') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let minX = width, maxX = 0, minY = height, maxY = 0;
    let hasPixels = false;

    // Find bounding box of drawn pixels (alpha > 0)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          hasPixels = true;
        }
      }
    }

    if (!hasPixels) return;

    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;
    const boxCenterX = minX + boxWidth / 2;
    const boxCenterY = minY + boxHeight / 2;

    let dx = 0;
    let dy = 0;

    if (direction === 'horizontal' || direction === 'both') {
      dx = (width / 2) - boxCenterX;
    }
    if (direction === 'vertical' || direction === 'both') {
      dy = (height / 2) - boxCenterY;
    }

    if (dx === 0 && dy === 0) return;

    // Create temporary buffer canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(canvas, 0, 0);

    // Clear and redraw shifted
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tempCanvas, dx, dy);

    // Save state
    const dataUrl = canvas.toDataURL();
    if (onContentChange) {
      onContentChange(block.id, { drawingData: dataUrl });
    }
  };

  const inlineStyles = getBlockStyles(styles, '#f6f9fd', '#07162f', 'center');

  return (
    <section 
      style={inlineStyles}
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-12'} ${styles.paddingBottom || 'py-12'}`}
    >
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <h2 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onContentChange && onContentChange(block.id, { title: e.target.innerText })}
          className={`text-2xl font-bold tracking-tight mb-2 ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {title}
        </h2>
        <p 
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onContentChange && onContentChange(block.id, { subtitle: e.target.innerText })}
          className={`text-sm text-slate-500 max-w-xl mx-auto ${isEditing ? 'outline-dashed outline-1 outline-indigo-300 px-1 rounded hover:bg-black/5' : ''}`}
        >
          {subtitle}
        </p>
      </div>

      <div className="max-w-3xl mx-auto relative rounded-2xl overflow-hidden border border-slate-200 dark:border-brand-ink bg-white shadow-xl">
        {/* Figma-like Top Toolbar */}
        {isEditing && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50 dark:bg-brand-deep select-none">
            {/* Draw Tools */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTool('pen')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${tool === 'pen' ? 'bg-brand-accent text-white shadow-sm' : 'text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-brand-ink'}`}
                title="Pen / Brush"
              >
                <Icons.Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('rect')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${tool === 'rect' ? 'bg-brand-accent text-white shadow-sm' : 'text-slate-655 dark:text-slate-355 hover:bg-slate-200 dark:hover:bg-brand-ink'}`}
                title="Rectangle shape"
              >
                <Icons.Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('circle')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${tool === 'circle' ? 'bg-brand-accent text-white shadow-sm' : 'text-slate-655 dark:text-slate-355 hover:bg-slate-200 dark:hover:bg-brand-ink'}`}
                title="Circle shape"
              >
                <Icons.Circle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${tool === 'eraser' ? 'bg-brand-accent text-white shadow-sm' : 'text-slate-655 dark:text-slate-355 hover:bg-slate-200 dark:hover:bg-brand-ink'}`}
                title="Eraser"
              >
                <Icons.Eraser className="w-4 h-4" />
              </button>
            </div>

            {/* Drawing Color Presets */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-brand-ink pl-3.5">
              {['#aa3bff', '#0b4a86', '#07162f', '#10b981', '#db2777'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-4 h-4 rounded-full border border-slate-300 transition-transform cursor-pointer ${color === c && tool !== 'eraser' ? 'scale-125 ring-2 ring-brand-accent ring-offset-1' : ''}`}
                />
              ))}
            </div>

            {/* Shape Fill Toggle */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-brand-ink pl-3.5">
              <button
                onClick={() => setFillShape((prev: boolean) => !prev)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${fillShape ? 'bg-brand-accent-bg text-brand-accent' : 'text-slate-550 hover:bg-slate-200 dark:hover:bg-brand-ink'}`}
                title="Fill shapes (Rectangle / Circle)"
              >
                <Icons.Droplet className="w-4 h-4" />
              </button>
            </div>

            {/* Thickness Control */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-brand-ink pl-3.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Size</span>
              <input
                type="range"
                min="1"
                max="12"
                value={thickness}
                onChange={(e) => setThickness(parseInt(e.target.value))}
                className="w-16 accent-brand-accent cursor-pointer"
              />
            </div>

            {/* Figma-like Align Tools */}
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-brand-ink pl-3.5">
              <button
                onClick={() => alignCanvasContent('horizontal')}
                className="p-1 rounded text-slate-500 hover:text-brand-primary hover:bg-slate-200 dark:hover:bg-brand-ink transition-colors cursor-pointer"
                title="Align horizontally to center"
              >
                <Icons.AlignHorizontalJustifyCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => alignCanvasContent('vertical')}
                className="p-1 rounded text-slate-500 hover:text-brand-primary hover:bg-slate-200 dark:hover:bg-brand-ink transition-colors cursor-pointer"
                title="Align vertically to center"
              >
                <Icons.AlignVerticalJustifyCenter className="w-4 h-4" />
              </button>
            </div>

            {/* Grid & Clear controls */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-brand-ink pl-3.5">
              <button
                onClick={() => setShowGrid((prev: boolean) => !prev)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showGrid ? 'bg-brand-accent-bg text-brand-accent' : 'text-slate-550 hover:bg-slate-200 dark:hover:bg-brand-ink'}`}
                title="Toggle Figma layout grid"
              >
                <Icons.Grid className="w-4 h-4" />
              </button>
              <button
                onClick={clearCanvas}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Clear entire canvas"
              >
                <Icons.Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Drawing Board Canvas Area */}
        <div 
          className={`relative aspect-[3/1.8] min-h-[300px] w-full ${
            showGrid && isEditing 
              ? 'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]' 
              : 'bg-white'
          }`}
        >
          {isEditing ? (
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="absolute inset-0 w-full h-full cursor-crosshair"
            />
          ) : (
            drawingData ? (
              <img 
                src={drawingData} 
                className="absolute inset-0 w-full h-full object-contain" 
                alt="Custom design drawing" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-350 text-xs italic bg-white">
                Blank Board
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};
export const PortfolioBlock: React.FC<BlockComponentProps> = ({ block, isEditing, onContentChange, selectedElement, onSelectElement }) => {
  const { title = 'Projects Portfolio', subtitle = 'Subtitle', items = [] } = block.content;
  const styles = block.styles;

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (onContentChange) onContentChange(block.id, { title: e.target.innerText });
  };

  const handleSubtitleChange = (e: React.FocusEvent<HTMLParagraphElement>) => {
    if (onContentChange) onContentChange(block.id, { subtitle: e.target.innerText });
  };

  const handleItemTextChange = (itemId: string, field: 'title' | 'category' | 'description' | 'image' | 'link', text: string) => {
    if (onContentChange && items) {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, [field]: text } : item
      );
      onContentChange(block.id, { items: updatedItems });
    }
  };

  const inlineStyles = getBlockStyles(styles, '#ffffff', '#07162f', 'center');

  return (
    <section 
      style={inlineStyles} 
      className={`px-8 md:px-16 ${styles.paddingTop || 'py-16'} ${styles.paddingBottom || 'py-16'} ${styles.marginTop || 'mt-0'} ${styles.marginBottom || 'mb-0'}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h2 
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleTitleChange}
            onClick={(e) => {
              if (!isEditing) return;
              e.stopPropagation();
              if (onSelectElement) onSelectElement(block.id, 'title', 'title');
            }}
            className={`text-3xl font-extrabold tracking-tight mb-4 ${getSelectionBorderClass(block.id, 'title', selectedElement, isEditing)}`}
          >
            {title}
          </h2>
          <p 
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleSubtitleChange}
            onClick={(e) => {
              if (!isEditing) return;
              e.stopPropagation();
              if (onSelectElement) onSelectElement(block.id, 'subtitle', 'subtitle');
            }}
            className={`text-slate-500 text-lg max-w-2xl mx-auto ${getSelectionBorderClass(block.id, 'subtitle', selectedElement, isEditing)}`}
          >
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-brand-deep border border-slate-100 dark:border-brand-ink overflow-hidden shadow-lg transition-transform hover:-translate-y-1 duration-300 flex flex-col h-full rounded-xl text-left"
              style={{ borderRadius: styles.borderRadius === 'rounded-none' ? '0px' : styles.borderRadius === 'rounded-sm' ? '4px' : styles.borderRadius === 'rounded-md' ? '8px' : styles.borderRadius === 'rounded-lg' ? '12px' : styles.borderRadius === 'rounded-xl' ? '16px' : '16px' }}
            >
              {/* Card Image */}
              <div className="aspect-video w-full overflow-hidden bg-slate-100 relative group">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1561070791-26c113006238?w=800'} 
                  alt={item.title} 
                  onClick={(e) => {
                    if (!isEditing) return;
                    e.stopPropagation();
                    if (onSelectElement) onSelectElement(block.id, `items.${item.id}.image`, 'image');
                  }}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${getSelectionBorderClass(block.id, `items.${item.id}.image`, selectedElement, isEditing)}`}
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      const newUrl = window.prompt('Enter image URL:', item.image);
                      if (newUrl !== null) handleItemTextChange(item.id, 'image', newUrl);
                    }}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                  >
                    Change Image URL
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col">
                <span 
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemTextChange(item.id, 'category', e.target.innerText)}
                  onClick={(e) => {
                    if (!isEditing) return;
                    e.stopPropagation();
                    if (onSelectElement) onSelectElement(block.id, `items.${item.id}.category`, 'category');
                  }}
                  className={`text-[10px] uppercase font-bold tracking-wider text-brand-accent mb-2 block ${getSelectionBorderClass(block.id, `items.${item.id}.category`, selectedElement, isEditing)}`}
                >
                  {item.category || 'Category'}
                </span>
                <h3 
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemTextChange(item.id, 'title', e.target.innerText)}
                  onClick={(e) => {
                    if (!isEditing) return;
                    e.stopPropagation();
                    if (onSelectElement) onSelectElement(block.id, `items.${item.id}.title`, 'title');
                  }}
                  className={`text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 leading-snug ${getSelectionBorderClass(block.id, `items.${item.id}.title`, selectedElement, isEditing)}`}
                >
                  {item.title}
                </h3>
                <p 
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemTextChange(item.id, 'description', e.target.innerText)}
                  onClick={(e) => {
                    if (!isEditing) return;
                    e.stopPropagation();
                    if (onSelectElement) onSelectElement(block.id, `items.${item.id}.description`, 'description');
                  }}
                  className={`text-slate-505 dark:text-slate-405 text-xs flex-1 mb-4 leading-relaxed ${getSelectionBorderClass(block.id, `items.${item.id}.description`, selectedElement, isEditing)}`}
                >
                  {item.description}
                </p>
                
                {/* Link */}
                <div className="pt-2 mt-auto border-t border-slate-50 dark:border-brand-ink/50 flex justify-between items-center text-xs font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors">
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => handleItemTextChange(item.id, 'link', e.target.innerText)}
                    onClick={(e) => {
                      if (!isEditing) return;
                      e.stopPropagation();
                      if (onSelectElement) onSelectElement(block.id, `items.${item.id}.link`, 'link');
                    }}
                    className={`cursor-text ${getSelectionBorderClass(block.id, `items.${item.id}.link`, selectedElement, isEditing)}`}
                  >
                    View Project
                  </span>
                  <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BlockRenderer: React.FC<{
  block: Block;
  isEditing: boolean;
  onContentChange: (id: string, content: Partial<Block['content']>) => void;
  selectedElement?: { blockId: string; elementPath: string; elementType: string } | null;
  onSelectElement?: (blockId: string, elementPath: string, elementType: string) => void;
}> = ({ block, isEditing, onContentChange, selectedElement, onSelectElement }) => {
  switch (block.type) {
    case 'header':
      return <HeaderBlock block={block} isEditing={isEditing} onContentChange={onContentChange} selectedElement={selectedElement} onSelectElement={onSelectElement} />;
    case 'hero':
      return <HeroBlock block={block} isEditing={isEditing} onContentChange={onContentChange} selectedElement={selectedElement} onSelectElement={onSelectElement} />;
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
    case 'sandbox':
      return <SandboxBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'portfolio':
      return <PortfolioBlock block={block} isEditing={isEditing} onContentChange={onContentChange} selectedElement={selectedElement} onSelectElement={onSelectElement} />;
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
