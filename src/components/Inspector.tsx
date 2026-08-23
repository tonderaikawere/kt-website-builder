import React from 'react';
import type { Block, BlockStyles } from '../types';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface InspectorProps {
  selectedBlock: Block | undefined;
  onUpdateStyles: (id: string, styles: Partial<BlockStyles>) => void;
}

export const Inspector: React.FC<InspectorProps> = ({ selectedBlock, onUpdateStyles }) => {
  if (!selectedBlock) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        Select a section on the canvas to customize its style parameters.
      </div>
    );
  }

  const { styles } = selectedBlock;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Styles Inspector</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Customize {selectedBlock.name} appearance</p>
      </div>

      <div className="border-t border-slate-100 dark:border-brand-ink pt-4 space-y-4">
        {/* Background Color */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={styles.bgColor || '#ffffff'}
              onChange={(e) => onUpdateStyles(selectedBlock.id, { bgColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0 overflow-hidden bg-transparent shrink-0"
            />
            <input
              type="text"
              value={styles.bgColor || '#ffffff'}
              onChange={(e) => onUpdateStyles(selectedBlock.id, { bgColor: e.target.value })}
              className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono text-slate-700 dark:text-slate-300"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {['#ffffff', '#f8fafc', '#f1f5f9', '#0b4a86', '#061a3b', '#07162f'].map((color) => (
              <button
                key={color}
                onClick={() => onUpdateStyles(selectedBlock.id, { bgColor: color })}
                style={{ backgroundColor: color }}
                className={`w-5 h-5 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 ${
                  styles.bgColor === color ? 'ring-2 ring-brand-accent ring-offset-1' : ''
                }`}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Background Image */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-brand-ink">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-350 block">Background Image URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="https://images.unsplash.com/... (optional)"
              value={styles.bgImage || ''}
              onChange={(e) => onUpdateStyles(selectedBlock.id, { bgImage: e.target.value })}
              className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-700 dark:text-slate-300"
            />
            {styles.bgImage && (
              <button
                onClick={() => onUpdateStyles(selectedBlock.id, { bgImage: '' })}
                className="text-xs text-red-500 hover:text-red-650 px-2 py-1 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900/50 cursor-pointer font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-brand-ink">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Text Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={styles.textColor || '#07162f'}
              onChange={(e) => onUpdateStyles(selectedBlock.id, { textColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0 overflow-hidden bg-transparent shrink-0"
            />
            <input
              type="text"
              value={styles.textColor || '#07162f'}
              onChange={(e) => onUpdateStyles(selectedBlock.id, { textColor: e.target.value })}
              className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono text-slate-700 dark:text-slate-300"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {['#07162f', '#64748b', '#94a3b8', '#ffffff', '#0b4a86', '#aa3bff'].map((color) => (
              <button
                key={color}
                onClick={() => onUpdateStyles(selectedBlock.id, { textColor: color })}
                style={{ backgroundColor: color }}
                className={`w-5 h-5 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 ${
                  styles.textColor === color ? 'ring-2 ring-brand-accent ring-offset-1' : ''
                }`}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Spacing Controls */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-brand-ink">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Spacing (Padding & Margin)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Padding Top</label>
              <select
                value={styles.paddingTop || 'py-16'}
                onChange={(e) => onUpdateStyles(selectedBlock.id, { paddingTop: e.target.value })}
                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-700 dark:text-slate-300"
              >
                <option value="py-0">None (0px)</option>
                <option value="py-4">Tiny (16px)</option>
                <option value="py-8">Small (32px)</option>
                <option value="py-12">Medium (48px)</option>
                <option value="py-16">Default (64px)</option>
                <option value="py-20">Large (80px)</option>
                <option value="py-24">Extra Large (96px)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Padding Bottom</label>
              <select
                value={styles.paddingBottom || 'py-16'}
                onChange={(e) => onUpdateStyles(selectedBlock.id, { paddingBottom: e.target.value })}
                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-700 dark:text-slate-300"
              >
                <option value="py-0">None (0px)</option>
                <option value="py-4">Tiny (16px)</option>
                <option value="py-8">Small (32px)</option>
                <option value="py-12">Medium (48px)</option>
                <option value="py-16">Default (64px)</option>
                <option value="py-20">Large (80px)</option>
                <option value="py-24">Extra Large (96px)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Margin Top</label>
              <select
                value={styles.marginTop || 'mt-0'}
                onChange={(e) => onUpdateStyles(selectedBlock.id, { marginTop: e.target.value })}
                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-700 dark:text-slate-300"
              >
                <option value="mt-0">None (0px)</option>
                <option value="mt-2">Small (8px)</option>
                <option value="mt-4">Medium (16px)</option>
                <option value="mt-8">Large (32px)</option>
                <option value="mt-12">Extra Large (48px)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Margin Bottom</label>
              <select
                value={styles.marginBottom || 'mb-0'}
                onChange={(e) => onUpdateStyles(selectedBlock.id, { marginBottom: e.target.value })}
                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-700 dark:text-slate-300"
              >
                <option value="mb-0">None (0px)</option>
                <option value="mb-2">Small (8px)</option>
                <option value="mb-4">Medium (16px)</option>
                <option value="mb-8">Large (32px)</option>
                <option value="mb-12">Extra Large (48px)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-brand-ink">
          <label className="text-xs font-semibold text-slate-650 dark:text-slate-300 block">Button & Image Rounding</label>
          <select
            value={styles.borderRadius || 'rounded-md'}
            onChange={(e) => onUpdateStyles(selectedBlock.id, { borderRadius: e.target.value })}
            className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-700 dark:text-slate-300"
          >
            <option value="rounded-none">Sharp Corners (rounded-none)</option>
            <option value="rounded-sm">Rounded Small (rounded-sm)</option>
            <option value="rounded-md">Rounded Medium (rounded-md)</option>
            <option value="rounded-lg">Rounded Large (rounded-lg)</option>
            <option value="rounded-xl">Rounded Extra Large (rounded-xl)</option>
            <option value="rounded-full">Pill / Circle (rounded-full)</option>
          </select>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-brand-ink">
          <label className="text-xs font-semibold text-slate-650 dark:text-slate-300 block">Text Alignment</label>
          <div className="flex bg-slate-50 dark:bg-brand-deep border border-slate-200 dark:border-brand-ink p-1 rounded-lg w-fit">
            <button
              onClick={() => onUpdateStyles(selectedBlock.id, { textAlign: 'left' })}
              className={`p-1.5 rounded transition-colors cursor-pointer ${styles.textAlign === 'left' ? 'bg-white dark:bg-brand-ink text-brand-accent shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'}`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateStyles(selectedBlock.id, { textAlign: 'center' })}
              className={`p-1.5 rounded transition-colors cursor-pointer ${styles.textAlign === 'center' || !styles.textAlign ? 'bg-white dark:bg-brand-ink text-brand-accent shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'}`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateStyles(selectedBlock.id, { textAlign: 'right' })}
              className={`p-1.5 rounded transition-colors cursor-pointer ${styles.textAlign === 'right' ? 'bg-white dark:bg-brand-ink text-brand-accent shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'}`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateStyles(selectedBlock.id, { textAlign: 'justify' })}
              className={`p-1.5 rounded transition-colors cursor-pointer ${styles.textAlign === 'justify' ? 'bg-white dark:bg-brand-ink text-brand-accent shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'}`}
              title="Align Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Layout Flex Alignment */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-brand-ink">
          <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block">Flex Content Alignment</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Horizontal Align</label>
              <select
                value={styles.flexJustify || 'justify-center'}
                onChange={(e) => onUpdateStyles(selectedBlock.id, { flexJustify: e.target.value })}
                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-700 dark:text-slate-300"
              >
                <option value="justify-start">Align Left</option>
                <option value="justify-center">Center</option>
                <option value="justify-end">Align Right</option>
                <option value="justify-between">Space Between</option>
                <option value="justify-around">Space Around</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Vertical Align</label>
              <select
                value={styles.flexAlign || 'items-center'}
                onChange={(e) => onUpdateStyles(selectedBlock.id, { flexAlign: e.target.value })}
                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-700 dark:text-slate-300"
              >
                <option value="items-start">Align Top</option>
                <option value="items-center">Center</option>
                <option value="items-end">Align Bottom</option>
                <option value="items-stretch">Stretch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Block Custom CSS */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-brand-ink">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Block Custom CSS</label>
          <textarea
            rows={4}
            value={styles.customCss || ''}
            onChange={(e) => onUpdateStyles(selectedBlock.id, { customCss: e.target.value })}
            placeholder={`.block-id {\n  border: 2px dashed #aa3bff;\n}`}
            className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 dark:bg-brand-deep/50 dark:border-brand-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none text-slate-700 dark:text-slate-300"
          />
          <p className="text-[9px] text-slate-400 dark:text-slate-400">Write CSS selectors to apply styles strictly to this section.</p>
        </div>
      </div>
    </div>
  );
};
