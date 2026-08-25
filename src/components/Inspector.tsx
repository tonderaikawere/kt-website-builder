import React from 'react';
import type { Block, BlockStyles } from '../types';
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Sliders, Palette, Type, Layout
} from 'lucide-react';

interface InspectorProps {
  selectedBlock: Block | undefined;
  onUpdateStyles: (id: string, styles: Partial<BlockStyles>) => void;
  selectedElement?: { blockId: string; elementPath: string; elementType: string } | null;
  onSelectElement?: (element: { blockId: string; elementPath: string; elementType: string } | null) => void;
  onUpdateBlockContent?: (id: string, content: Partial<Block['content']>) => void;
}

export const Inspector: React.FC<InspectorProps> = ({ 
  selectedBlock, 
  onUpdateStyles,
  selectedElement,
  onSelectElement,
  onUpdateBlockContent
}) => {
  if (!selectedBlock) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs text-center px-4 space-y-2">
        <Sliders className="w-8 h-8 text-slate-300 dark:text-slate-700" />
        <span className="font-semibold text-slate-500">No element selected</span>
        <p className="max-w-[180px] leading-normal text-[10px] text-slate-400">Select any layout section or double-click text elements to inspect Figma properties.</p>
      </div>
    );
  }

  const { styles } = selectedBlock;

  // Render properties when an element is active (Double Clicked text/button/link)
  if (selectedElement && selectedElement.blockId === selectedBlock.id) {
    const { elementPath, elementType } = selectedElement;
    
    let currentValue = '';
    let currentLinkValue = '';
    
    if (elementPath.startsWith('items.')) {
      const parts = elementPath.split('.');
      const itemId = parts[1];
      const fieldName = parts[2];
      const item = (selectedBlock.content.items || []).find(i => i.id === itemId);
      if (item) {
        currentValue = (item as any)[fieldName] || '';
        currentLinkValue = item.link || '';
      }
    } else {
      currentValue = (selectedBlock.content as any)[elementPath] || '';
      if (elementPath === 'buttonText') {
        currentLinkValue = selectedBlock.content.buttonLink || '';
      }
    }

    const currentFontSize = (selectedBlock.content as any)[`${elementPath}FontSize`] || '';
    const currentColor = (selectedBlock.content as any)[`${elementPath}Color`] || '';

    const handleFontSizeChange = (val: string) => {
      if (onUpdateBlockContent) {
        onUpdateBlockContent(selectedBlock.id, { [`${elementPath}FontSize`]: val });
      }
    };

    const handleColorChange = (val: string) => {
      if (onUpdateBlockContent) {
        onUpdateBlockContent(selectedBlock.id, { [`${elementPath}Color`]: val });
      }
    };

    const handleValueChange = (val: string) => {
      if (!onUpdateBlockContent) return;
      if (elementPath.startsWith('items.')) {
        const parts = elementPath.split('.');
        const itemId = parts[1];
        const fieldName = parts[2];
        const updatedItems = (selectedBlock.content.items || []).map(item => 
          item.id === itemId ? { ...item, [fieldName]: val } : item
        );
        onUpdateBlockContent(selectedBlock.id, { items: updatedItems });
      } else {
        onUpdateBlockContent(selectedBlock.id, { [elementPath]: val });
      }
    };

    const handleLinkChange = (val: string) => {
      if (!onUpdateBlockContent) return;
      if (elementPath.startsWith('items.')) {
        const parts = elementPath.split('.');
        const itemId = parts[1];
        const updatedItems = (selectedBlock.content.items || []).map(item => 
          item.id === itemId ? { ...item, link: val } : item
        );
        onUpdateBlockContent(selectedBlock.id, { items: updatedItems });
      } else {
        onUpdateBlockContent(selectedBlock.id, { buttonLink: val });
      }
    };

    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-ink pb-3">
          <button
            onClick={() => onSelectElement && onSelectElement(null)}
            className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            ← Close Inspector
          </button>
          <span className="text-[9px] uppercase font-extrabold text-[#6C63FF] tracking-wider px-2 py-0.5 bg-[#6C63FF]/10 rounded">
            Figma Element
          </span>
        </div>

        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase">
            {elementType === 'title' ? 'Header Content' : elementType === 'subtitle' ? 'Subheading Content' : elementType === 'button' ? 'Action Button' : `Edit ${elementType}`}
          </h3>
          <p className="text-[9px] text-slate-400 mt-0.5">Customize active element properties below.</p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Main Text Content */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              {elementType === 'image' ? 'Image Cover URL' : 'Content Text'}
            </label>
            {elementType === 'description' ? (
              <textarea
                rows={3}
                value={currentValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-slate-100 resize-none leading-relaxed"
              />
            ) : (
              <input
                type="text"
                value={currentValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-slate-100"
              />
            )}
          </div>

          {/* Action Links */}
          {(elementType === 'button' || elementPath.includes('link') || elementPath === 'buttonText') && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Action Link URL</label>
              <input
                type="text"
                value={currentLinkValue}
                onChange={(e) => handleLinkChange(e.target.value)}
                placeholder="https://example.com"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-slate-100"
              />
            </div>
          )}

          {/* Font Size & Color Pickers */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-brand-ink/50">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Font Size (px)</label>
              <input
                type="number"
                min="8"
                max="120"
                value={currentFontSize || '16'}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Text Color</label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg">
                <input
                  type="color"
                  value={currentColor || '#1e293b'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-6 h-6 border-0 rounded cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono uppercase">{currentColor || '#1E293B'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Section Layout & Style Properties (Figma inspector)
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-brand-ink pb-3">
        <h3 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Properties</h3>
        <span className="text-[9px] font-bold text-slate-400 font-mono">ID: #{selectedBlock.id}</span>
      </div>

      {/* 1. Layout & Coordinates */}
      <div className="space-y-3">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Layout className="w-3.5 h-3.5 text-slate-400" />
          <span>Layout & Coordinates</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
            <span className="block text-[8px] text-slate-400 font-bold uppercase">Width</span>
            <input 
              type="text" 
              value={styles.width || '100%'} 
              onChange={(e) => onUpdateStyles(selectedBlock.id, { width: e.target.value })}
              className="w-full bg-transparent border-none text-[11px] font-bold dark:text-white focus:outline-none p-0 mt-0.5" 
            />
          </div>
          <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
            <span className="block text-[8px] text-slate-400 font-bold uppercase">Height</span>
            <input 
              type="text" 
              value={styles.height || 'auto'} 
              onChange={(e) => onUpdateStyles(selectedBlock.id, { height: e.target.value })}
              className="w-full bg-transparent border-none text-[11px] font-bold dark:text-white focus:outline-none p-0 mt-0.5" 
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-slate-50 dark:bg-slate-850 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
            <span className="block text-[8px] text-slate-400 font-bold uppercase">X</span>
            <input 
              type="text" 
              value={styles.x || '0px'} 
              onChange={(e) => onUpdateStyles(selectedBlock.id, { x: e.target.value })}
              className="w-full bg-transparent border-none text-[10px] font-mono dark:text-white focus:outline-none p-0" 
            />
          </div>
          <div className="bg-slate-50 dark:bg-slate-850 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
            <span className="block text-[8px] text-slate-400 font-bold uppercase">Y</span>
            <input 
              type="text" 
              value={styles.y || '0px'} 
              onChange={(e) => onUpdateStyles(selectedBlock.id, { y: e.target.value })}
              className="w-full bg-transparent border-none text-[10px] font-mono dark:text-white focus:outline-none p-0" 
            />
          </div>
          <div className="bg-slate-50 dark:bg-slate-850 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
            <span className="block text-[8px] text-slate-400 font-bold uppercase">Rotation</span>
            <input 
              type="text" 
              value={styles.rotation || '0deg'} 
              onChange={(e) => onUpdateStyles(selectedBlock.id, { rotation: e.target.value })}
              className="w-full bg-transparent border-none text-[10px] font-mono dark:text-white focus:outline-none p-0" 
            />
          </div>
        </div>
      </div>

      {/* 2. Color Fill & Stroke */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-brand-ink/50">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <span>Fills & Borders</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500">Solid Color</span>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 p-1 rounded-lg border border-slate-250 dark:border-slate-700">
              <input 
                type="color" 
                value={styles.bgColor || '#ffffff'} 
                onChange={(e) => onUpdateStyles(selectedBlock.id, { bgColor: e.target.value })}
                className="w-5 h-5 border-0 rounded cursor-pointer bg-transparent"
              />
              <span className="text-[9px] font-mono uppercase dark:text-slate-200">{styles.bgColor || '#FFFFFF'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">Gradient Fill</span>
            <input 
              type="text" 
              placeholder="linear-gradient(45deg, #6C63FF, #2D3748)"
              value={styles.bgGradient || ''} 
              onChange={(e) => onUpdateStyles(selectedBlock.id, { bgGradient: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">Stroke</span>
            <select
              value={styles.borderWidth || 'border-0'}
              onChange={(e) => onUpdateStyles(selectedBlock.id, { borderWidth: e.target.value })}
              className="w-full text-[10px] p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-slate-200"
            >
              <option value="border-0">None</option>
              <option value="border">Thin (1px)</option>
              <option value="border-2">Medium (2px)</option>
              <option value="border-4">Thick (4px)</option>
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 block">Stroke Color</span>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-850 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <input 
                type="color" 
                value={styles.borderColor || '#cbd5e1'} 
                onChange={(e) => onUpdateStyles(selectedBlock.id, { borderColor: e.target.value })}
                className="w-4 h-4 border-0 rounded cursor-pointer"
              />
              <span className="text-[9px] font-mono uppercase">{styles.borderColor || '#CBD5E1'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Spacing & Opacity */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-brand-ink/50">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Type className="w-3.5 h-3.5 text-slate-400" />
          <span>Effects & Spacing</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500">Opacity</span>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={styles.opacity ? parseInt(styles.opacity) : 100}
              onChange={(e) => onUpdateStyles(selectedBlock.id, { opacity: `${e.target.value}%` })}
              className="w-24 accent-[#6C63FF]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">Corner Radius</span>
              <select
                value={styles.borderRadius || 'rounded-none'}
                onChange={(e) => onUpdateStyles(selectedBlock.id, { borderRadius: e.target.value })}
                className="w-full text-[10px] p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-slate-200"
              >
                <option value="rounded-none">None (0px)</option>
                <option value="rounded-md">Small (6px)</option>
                <option value="rounded-xl">Large (12px)</option>
                <option value="rounded-3xl">Extra Large (24px)</option>
                <option value="rounded-full">Pill (999px)</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">Text Align</span>
              <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onUpdateStyles(selectedBlock.id, { textAlign: align })}
                    className={`flex-1 py-1.5 flex justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${styles.textAlign === align ? 'bg-slate-150 dark:bg-slate-800 text-[#6C63FF]' : 'text-slate-400'}`}
                  >
                    {align === 'left' ? <AlignLeft className="w-3 h-3" /> :
                     align === 'center' ? <AlignCenter className="w-3 h-3" /> :
                     align === 'right' ? <AlignRight className="w-3 h-3" /> :
                     <AlignJustify className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Advanced CSS Override */}
      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-brand-ink/50">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Custom CSS Stylesheet</label>
        <textarea
          rows={4}
          value={styles.customCss || ''}
          onChange={(e) => onUpdateStyles(selectedBlock.id, { customCss: e.target.value })}
          placeholder="/* Custom CSS overrides */&#10;__self__ {&#10;  filter: grayscale(1);&#10;}"
          className="w-full text-[10px] font-mono p-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none text-brand-light resize-none leading-normal"
        />
      </div>
    </div>
  );
};
