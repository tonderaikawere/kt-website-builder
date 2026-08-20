import React from 'react';
import { Block } from '../types';

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
        <div className="flex-1 w-full max-w-md md:max-w-none">
          <img 
            src={imageSrc} 
            alt="Hero Banner" 
            className={`w-full h-auto object-cover shadow-lg ${styles.borderRadius || 'rounded-lg'}`} 
          />
        </div>
      )}
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
    default:
      return (
        <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200">
          Component <strong>{block.name}</strong> ({block.type}) is loaded.
        </div>
      );
  }
};
