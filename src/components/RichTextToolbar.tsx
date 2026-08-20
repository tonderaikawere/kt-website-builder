import React, { useEffect, useState, useRef } from 'react';
import { Bold, Italic, Underline, Trash2 } from 'lucide-react';

export const RichTextToolbar: React.FC = () => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setShow(false);
        return;
      }

      // Check if selection is within an active contenteditable element
      let node = selection.anchorNode;
      let isEditable = false;
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).getAttribute('contenteditable') === 'true') {
          isEditable = true;
          break;
        }
        node = node.parentNode;
      }

      if (!isEditable) {
        setShow(false);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Align formatting toolbar just above selection bounds
        setPosition({
          top: window.scrollY + rect.top - 48,
          left: window.scrollX + rect.left + rect.width / 2
        });
        setShow(true);
      } catch (e) {
        setShow(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const format = (command: string) => {
    document.execCommand(command, false);
  };

  if (!show) return null;

  return (
    <div
      ref={toolbarRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="bg-slate-900 border border-slate-700 shadow-xl rounded-lg px-2 py-1 z-50 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100"
      onMouseDown={(e) => {
        // Prevent inputs from stealing focus from selection
        e.preventDefault();
      }}
    >
      <button
        onClick={() => format('bold')}
        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => format('italic')}
        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => format('underline')}
        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
        title="Underline"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-slate-700 mx-0.5"></div>
      <button
        onClick={() => format('removeFormat')}
        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
        title="Clear styling"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
