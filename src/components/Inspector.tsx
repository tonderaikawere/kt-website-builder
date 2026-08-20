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
        {/* Placeholder for controls - to be populated in upcoming commits */}
        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
          Select individual tabs below or modify styles using the panel controls.
        </div>
      </div>
    </div>
  );
};
