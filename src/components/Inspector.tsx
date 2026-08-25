import React, { useState } from 'react';
import type { Block, BlockStyles } from '../types';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Plus,
  Minus
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    alignment: true,
    size: true,
    position: true,
    animation: false,
    text: true,
    colors: true,
    stroke: true,
    effects: true,
    scroll: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!selectedBlock) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs text-center px-6 space-y-3 bg-[#181818] h-full select-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
        <span className="font-bold text-slate-400">No selection</span>
        <p className="max-w-[180px] leading-normal text-[10px] text-slate-500">Select any layer or double-click text to display properties.</p>
      </div>
    );
  }

  const { styles } = selectedBlock;
  const isElementActive = !!(selectedElement && selectedElement.blockId === selectedBlock.id);

  // 1. Resolve current active element values
  let elementPath = '';
  let elementType = '';
  let currentValue = '';
  let currentFontSize = '16';
  let currentColor = '#FFFFFF';
  let elementWidth = 'auto';
  let elementHeight = 'auto';
  let elementX = '0px';
  let elementY = '0px';
  let elementRotation = '0deg';

  if (isElementActive && selectedElement) {
    elementPath = selectedElement.elementPath;
    elementType = selectedElement.elementType;

    if (elementPath.startsWith('items.')) {
      const parts = elementPath.split('.');
      const itemId = parts[1];
      const fieldName = parts[2];
      const item = (selectedBlock.content.items || []).find((i: any) => i.id === itemId);
      if (item) {
        currentValue = (item as any)[fieldName] || '';
      }
    } else {
      currentValue = (selectedBlock.content as any)[elementPath] || '';
    }

    currentFontSize = (selectedBlock.content as any)[`${elementPath}FontSize`] || '16';
    currentColor = (selectedBlock.content as any)[`${elementPath}Color`] || '#FFFFFF';
    elementWidth = (selectedBlock.content as any)[`${elementPath}Width`] || 'auto';
    elementHeight = (selectedBlock.content as any)[`${elementPath}Height`] || 'auto';
    elementX = (selectedBlock.content as any)[`${elementPath}X`] || '0px';
    elementY = (selectedBlock.content as any)[`${elementPath}Y`] || '0px';
    elementRotation = (selectedBlock.content as any)[`${elementPath}Rotation`] || '0deg';
  }

  // 2. Element change handlers
  const handleElementWidthChange = (val: string) => {
    if (onUpdateBlockContent && selectedElement) {
      onUpdateBlockContent(selectedBlock.id, { [`${selectedElement.elementPath}Width`]: val });
    }
  };

  const handleElementHeightChange = (val: string) => {
    if (onUpdateBlockContent && selectedElement) {
      onUpdateBlockContent(selectedBlock.id, { [`${selectedElement.elementPath}Height`]: val });
    }
  };

  const handleElementXChange = (val: string) => {
    if (onUpdateBlockContent && selectedElement) {
      onUpdateBlockContent(selectedBlock.id, { [`${selectedElement.elementPath}X`]: val });
    }
  };

  const handleElementYChange = (val: string) => {
    if (onUpdateBlockContent && selectedElement) {
      onUpdateBlockContent(selectedBlock.id, { [`${selectedElement.elementPath}Y`]: val });
    }
  };

  const handleElementRotationChange = (val: string) => {
    if (onUpdateBlockContent && selectedElement) {
      onUpdateBlockContent(selectedBlock.id, { [`${selectedElement.elementPath}Rotation`]: val });
    }
  };

  const handleElementFontSizeChange = (val: string) => {
    if (onUpdateBlockContent && selectedElement) {
      onUpdateBlockContent(selectedBlock.id, { [`${selectedElement.elementPath}FontSize`]: val });
    }
  };

  const handleElementColorChange = (val: string) => {
    if (onUpdateBlockContent && selectedElement) {
      onUpdateBlockContent(selectedBlock.id, { [`${selectedElement.elementPath}Color`]: val });
    }
  };

  const handleElementValueChange = (val: string) => {
    if (!onUpdateBlockContent || !selectedElement) return;
    if (selectedElement.elementPath.startsWith('items.')) {
      const parts = selectedElement.elementPath.split('.');
      const itemId = parts[1];
      const fieldName = parts[2];
      const updatedItems = (selectedBlock.content.items || []).map((item: any) => 
        item.id === itemId ? { ...item, [fieldName]: val } : item
      );
      onUpdateBlockContent(selectedBlock.id, { items: updatedItems });
    } else {
      onUpdateBlockContent(selectedBlock.id, { [selectedElement.elementPath]: val });
    }
  };

  // Align calculations
  const triggerAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (isElementActive && selectedElement) {
      if (type === 'left') handleElementXChange('0px');
      else if (type === 'center') handleElementXChange('calc(50% - 100px)');
      else if (type === 'right') handleElementXChange('calc(100% - 200px)');
      else if (type === 'top') handleElementYChange('0px');
      else if (type === 'middle') handleElementYChange('calc(50% - 20px)');
      else if (type === 'bottom') handleElementYChange('calc(100% - 50px)');
    } else {
      if (type === 'left') onUpdateStyles(selectedBlock.id, { x: '0px' });
      else if (type === 'center') onUpdateStyles(selectedBlock.id, { x: 'calc(50% - 550px)' });
      else if (type === 'right') onUpdateStyles(selectedBlock.id, { x: 'calc(100% - 1100px)' });
      else if (type === 'top') onUpdateStyles(selectedBlock.id, { y: '0px' });
      else if (type === 'middle') onUpdateStyles(selectedBlock.id, { y: '300px' });
      else if (type === 'bottom') onUpdateStyles(selectedBlock.id, { y: '800px' });
    }
  };

  return (
    <div className="bg-[#181818] text-slate-300 h-full select-none text-xs flex flex-col font-sans border-l border-[#262626]">
      {/* Active Selection Header */}
      <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
        <span className="font-bold text-white text-[11px] uppercase tracking-wider">
          {isElementActive ? 'Element Layer' : 'Section Block'}
        </span>
        {isElementActive && (
          <button 
            onClick={() => onSelectElement && onSelectElement(null)}
            className="text-[10px] text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            Esc
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#262626]">
        {/* 1. Alignment Panel */}
        {expandedSections.alignment && (
          <div className="p-4 space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Alignment</span>
            <div className="grid grid-cols-6 bg-[#222222] p-1 rounded-lg border border-[#2d2d2d] text-slate-400">
              <button onClick={() => triggerAlign('left')} className="p-1.5 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer" title="Align Left">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="2" width="6" height="2" rx="0.5" />
                  <rect x="3" y="6" width="4" height="2" rx="0.5" />
                  <line x1="1" y1="1" x2="1" y2="11" />
                </svg>
              </button>
              <button onClick={() => triggerAlign('center')} className="p-1.5 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer" title="Align Horizontal Centers">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="2" width="6" height="2" rx="0.5" />
                  <rect x="4" y="6" width="4" height="2" rx="0.5" />
                  <line x1="6" y1="0" x2="6" y2="12" strokeDasharray="1 1" />
                </svg>
              </button>
              <button onClick={() => triggerAlign('right')} className="p-1.5 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer" title="Align Right">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="2" width="6" height="2" rx="0.5" />
                  <rect x="5" y="6" width="4" height="2" rx="0.5" />
                  <line x1="11" y1="1" x2="11" y2="11" />
                </svg>
              </button>
              <button onClick={() => triggerAlign('top')} className="p-1.5 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer" title="Align Top">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="2" height="6" rx="0.5" />
                  <rect x="6" y="3" width="2" height="4" rx="0.5" />
                  <line x1="1" y1="1" x2="11" y2="1" />
                </svg>
              </button>
              <button onClick={() => triggerAlign('middle')} className="p-1.5 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer" title="Align Vertical Centers">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="2" height="6" rx="0.5" />
                  <rect x="6" y="4" width="2" height="4" rx="0.5" />
                  <line x1="0" y1="6" x2="12" y2="6" strokeDasharray="1 1" />
                </svg>
              </button>
              <button onClick={() => triggerAlign('bottom')} className="p-1.5 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer" title="Align Bottom">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="2" height="6" rx="0.5" />
                  <rect x="6" y="5" width="2" height="4" rx="0.5" />
                  <line x1="1" y1="11" x2="11" y2="11" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 2. Size Panel */}
        {expandedSections.size && (
          <div className="p-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Size</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#222222] border border-[#2d2d2d] px-3 py-2 rounded-xl flex items-center justify-between">
                <span className="text-slate-500 font-bold font-mono">W</span>
                <input 
                  type="text" 
                  value={isElementActive ? elementWidth : (styles.width || '100%')} 
                  onChange={(e) => isElementActive ? handleElementWidthChange(e.target.value) : onUpdateStyles(selectedBlock.id, { width: e.target.value })}
                  className="w-16 bg-transparent border-none text-right font-bold text-white focus:outline-none p-0" 
                />
                <span className="text-[9px] text-slate-500 ml-1">px</span>
              </div>
              <div className="bg-[#222222] border border-[#2d2d2d] px-3 py-2 rounded-xl flex items-center justify-between">
                <span className="text-slate-500 font-bold font-mono">H</span>
                <input 
                  type="text" 
                  value={isElementActive ? elementHeight : (styles.height || 'auto')} 
                  onChange={(e) => isElementActive ? handleElementHeightChange(e.target.value) : onUpdateStyles(selectedBlock.id, { height: e.target.value })}
                  className="w-16 bg-transparent border-none text-right font-bold text-white focus:outline-none p-0" 
                />
                <span className="text-[9px] text-slate-500 ml-1">px</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Position Panel */}
        {expandedSections.position && (
          <div className="p-4 space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Position</span>
            <select className="w-full bg-[#222222] border border-[#2d2d2d] rounded-xl py-2 px-3 text-white font-semibold focus:outline-none">
              <option value="relative">Relative</option>
              <option value="absolute">Absolute</option>
            </select>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-[#222222] border border-[#2d2d2d] px-3 py-2 rounded-xl flex items-center justify-between">
                <span className="text-slate-500 font-bold font-mono">X</span>
                <input 
                  type="text" 
                  value={isElementActive ? elementX : (styles.x || '0px')} 
                  onChange={(e) => isElementActive ? handleElementXChange(e.target.value) : onUpdateStyles(selectedBlock.id, { x: e.target.value })}
                  className="w-16 bg-transparent border-none text-right font-bold text-white focus:outline-none p-0" 
                />
              </div>
              <div className="bg-[#222222] border border-[#2d2d2d] px-3 py-2 rounded-xl flex items-center justify-between">
                <span className="text-slate-500 font-bold font-mono">Y</span>
                <input 
                  type="text" 
                  value={isElementActive ? elementY : (styles.y || '0px')} 
                  onChange={(e) => isElementActive ? handleElementYChange(e.target.value) : onUpdateStyles(selectedBlock.id, { y: e.target.value })}
                  className="w-16 bg-transparent border-none text-right font-bold text-white focus:outline-none p-0" 
                />
              </div>
            </div>
            <div className="bg-[#222222] border border-[#2d2d2d] px-3 py-2 rounded-xl flex items-center justify-between mt-2">
              <span className="text-slate-500 font-bold">Rotation</span>
              <input 
                type="text" 
                value={isElementActive ? elementRotation : (styles.rotation || '0deg')} 
                onChange={(e) => isElementActive ? handleElementRotationChange(e.target.value) : onUpdateStyles(selectedBlock.id, { rotation: e.target.value })}
                className="w-20 bg-transparent border-none text-right font-bold text-white focus:outline-none p-0" 
              />
            </div>
          </div>
        )}

        {/* 4. Animation Section Header */}
        <div 
          onClick={() => toggleSection('animation')}
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#202020]"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Animation</span>
          <Plus className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* 5. Text Panel (Rendered only when editing text or active elements) */}
        {expandedSections.text && (
          <div className="p-4 space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Text</span>
            <div className="space-y-2">
              {/* Target element string editing box */}
              {isElementActive && (
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">Content Text</span>
                  <input 
                    type="text" 
                    value={currentValue}
                    onChange={(e) => handleElementValueChange(e.target.value)}
                    className="w-full bg-[#222222] border border-[#2d2d2d] rounded-xl py-2 px-3 text-white focus:outline-none"
                  />
                </div>
              )}

              <select className="w-full bg-[#222222] border border-[#2d2d2d] rounded-xl py-2 px-3 text-white font-semibold focus:outline-none">
                <option>{elementType === 'title' ? 'Heading 1' : elementType === 'subtitle' ? 'Subtitle 1' : 'Paragraph body'}</option>
              </select>

              <select className="w-full bg-[#222222] border border-[#2d2d2d] rounded-xl py-2 px-3 text-white font-semibold focus:outline-none font-mono text-[10px]">
                <option>Neue Haas Grotesk Display Pro</option>
                <option>Inter</option>
                <option>System UI</option>
              </select>

              <div className="grid grid-cols-2 gap-2">
                <select className="bg-[#222222] border border-[#2d2d2d] rounded-xl py-2 px-2.5 text-white font-semibold focus:outline-none text-[11px]">
                  <option>Regular</option>
                  <option>Medium</option>
                  <option>Bold</option>
                </select>
                <div className="bg-[#222222] border border-[#2d2d2d] rounded-xl px-2.5 py-2 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Size</span>
                  <input 
                    type="number" 
                    value={isElementActive ? currentFontSize : '16'}
                    onChange={(e) => isElementActive ? handleElementFontSizeChange(e.target.value) : onUpdateStyles(selectedBlock.id, { lineHeight: e.target.value })}
                    className="w-10 bg-transparent border-none text-right font-bold text-white focus:outline-none p-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#222222] border border-[#2d2d2d] rounded-xl px-2.5 py-2 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Line H</span>
                  <span className="font-semibold text-white">Auto</span>
                </div>
                <div className="bg-[#222222] border border-[#2d2d2d] rounded-xl px-2.5 py-2 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Spacing</span>
                  <span className="font-semibold text-white">-1.5%</span>
                </div>
              </div>

              {/* Text formatting toggles */}
              <div className="grid grid-cols-4 bg-[#222222] p-1 rounded-lg border border-[#2d2d2d] text-center font-bold text-slate-400">
                <button className="py-1 hover:bg-[#2d2d2d] hover:text-white rounded cursor-pointer">B</button>
                <button className="py-1 hover:bg-[#2d2d2d] hover:text-white rounded cursor-pointer italic">I</button>
                <button className="py-1 hover:bg-[#2d2d2d] hover:text-white rounded cursor-pointer underline">U</button>
                <button className="py-1 hover:bg-[#2d2d2d] hover:text-white rounded cursor-pointer line-through">S</button>
              </div>

              {/* Text aligns */}
              <div className="grid grid-cols-4 bg-[#222222] p-1 rounded-lg border border-[#2d2d2d] text-slate-400">
                <button className="p-1 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer">
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer">
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer">
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:bg-[#2d2d2d] hover:text-white rounded flex items-center justify-center cursor-pointer">
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Colors Panel */}
        {expandedSections.colors && (
          <div className="p-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Colors</span>
            <div className="bg-[#222222] border border-[#2d2d2d] p-1.5 rounded-xl flex items-center gap-2">
              <input 
                type="color" 
                value={isElementActive ? currentColor : (styles.bgColor || '#ffffff')} 
                onChange={(e) => isElementActive ? handleElementColorChange(e.target.value) : onUpdateStyles(selectedBlock.id, { bgColor: e.target.value })}
                className="w-7 h-7 border-0 rounded cursor-pointer bg-transparent"
              />
              <span className="text-[10px] font-mono uppercase font-bold text-white">
                {isElementActive ? currentColor : (styles.bgColor || '#FFFFFF')}
              </span>
            </div>
          </div>
        )}

        {/* 7. Stroke Section Header */}
        <div 
          onClick={() => toggleSection('stroke')}
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#202020]"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stroke</span>
          {expandedSections.stroke ? <Minus className="w-3.5 h-3.5 text-slate-500" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
        </div>
        {expandedSections.stroke && (
          <div className="p-4 pt-1 space-y-2 bg-[#1b1b1b]">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Weight</span>
                <input 
                  type="text" 
                  value={styles.borderWidth || '0px'} 
                  onChange={(e) => onUpdateStyles(selectedBlock.id, { borderWidth: e.target.value })}
                  placeholder="0px"
                  className="w-full bg-[#222222] border border-[#2d2d2d] rounded-xl py-1.5 px-3 text-white font-bold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Stroke Color</span>
                <div className="bg-[#222222] border border-[#2d2d2d] p-1 rounded-xl flex items-center gap-1.5">
                  <input 
                    type="color" 
                    value={styles.borderColor || '#262626'} 
                    onChange={(e) => onUpdateStyles(selectedBlock.id, { borderColor: e.target.value })}
                    className="w-5 h-5 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-[9px] font-mono uppercase font-bold text-white truncate">{styles.borderColor || '#262626'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Effects Section Header */}
        <div 
          onClick={() => toggleSection('effects')}
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#202020]"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Effects</span>
          {expandedSections.effects ? <Minus className="w-3.5 h-3.5 text-slate-500" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
        </div>
        {expandedSections.effects && (
          <div className="p-4 pt-1 space-y-3 bg-[#1b1b1b]">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Opacity</span>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={styles.opacity || '100'} 
                  onChange={(e) => onUpdateStyles(selectedBlock.id, { opacity: e.target.value })}
                  className="flex-1 accent-[#6C63FF] h-1 bg-[#222222] rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-mono font-bold text-white text-[10px] w-8 text-right">{styles.opacity || '100'}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Drop Shadow</span>
              <select
                value={styles.shadow || 'none'}
                onChange={(e) => onUpdateStyles(selectedBlock.id, { shadow: e.target.value as any })}
                className="w-full bg-[#222222] border border-[#2d2d2d] rounded-xl py-1.5 px-3 text-white font-semibold focus:outline-none"
              >
                <option value="none">None</option>
                <option value="sm">Soft Shadow</option>
                <option value="md">Medium Shadow</option>
                <option value="lg">Deep Shadow</option>
                <option value="glow">Neon Glow</option>
              </select>
            </div>
          </div>
        )}

        {/* 9. Scroll Section Header */}
        <div 
          onClick={() => toggleSection('scroll')}
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#202020] rounded-b-xl"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scroll Section</span>
          <Plus className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
