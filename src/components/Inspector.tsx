import React from 'react';
import { Block, BlockStyles } from '../types';

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
        <h3 className="font-semibold text-slate-900 text-sm">Styles Inspector</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Customize {selectedBlock.name} appearance</p>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-4">
        {/* Background Color */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 block">Background Color</label>
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
              className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-700"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {['#ffffff', '#f8fafc', '#f1f5f9', '#4f46e5', '#1e1b4b', '#0f172a'].map((color) => (
              <button
                key={color}
                onClick={() => onUpdateStyles(selectedBlock.id, { bgColor: color })}
                style={{ backgroundColor: color }}
                className={`w-5 h-5 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 ${
                  styles.bgColor === color ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                }`}
                title={color}
              />
            ))}
          </div>
        {/* Text Color */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-600 block">Text Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={styles.textColor || '#1e293b'}
              onChange={(e) => onUpdateStyles(selectedBlock.id, { textColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0 overflow-hidden bg-transparent shrink-0"
            />
            <input
              type="text"
              value={styles.textColor || '#1e293b'}
              onChange={(e) => onUpdateStyles(selectedBlock.id, { textColor: e.target.value })}
              className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-700"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {['#1e293b', '#64748b', '#94a3b8', '#ffffff', '#4f46e5', '#ef4444'].map((color) => (
              <button
                key={color}
                onClick={() => onUpdateStyles(selectedBlock.id, { textColor: color })}
                style={{ backgroundColor: color }}
                className={`w-5 h-5 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 ${
                  styles.textColor === color ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                }`}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
