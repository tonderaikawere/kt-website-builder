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

export const BlockRenderer: React.FC<{
  block: Block;
  isEditing: boolean;
  onContentChange: (id: string, content: Partial<Block['content']>) => void;
}> = ({ block, isEditing, onContentChange }) => {
  switch (block.type) {
    case 'header':
      return <HeaderBlock block={block} isEditing={isEditing} onContentChange={onContentChange} />;
    default:
      return (
        <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200">
          Component <strong>{block.name}</strong> ({block.type}) is loaded.
        </div>
      );
  }
};
