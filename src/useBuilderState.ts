import { useState, useCallback, useEffect } from 'react';
import type { Block, BlockType, BlockStyles, ProjectSettings } from './types';

const DEFAULT_SETTINGS: ProjectSettings = {
  title: 'My Custom Website',
  description: 'Created with KT Website Builder',
  customGlobalCss: '',
  fontFamily: 'Inter, sans-serif'
};

interface HistoryState {
  blocks: Block[];
  settings: ProjectSettings;
}

export function useBuilderState() {
  // Load blocks from localStorage synchronously
  const [blocks, setBlocksState] = useState<Block[]>(() => {
    try {
      const saved = localStorage.getItem('kt-builder-project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.blocks)) return parsed.blocks;
      }
    } catch (e) {}
    return [];
  });

  // Load settings from localStorage synchronously
  const [settings, setSettingsState] = useState<ProjectSettings>(() => {
    try {
      const saved = localStorage.getItem('kt-builder-project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) return { ...DEFAULT_SETTINGS, ...parsed.settings };
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });
  
  // Autosave to localStorage on changes
  useEffect(() => {
    localStorage.setItem('kt-builder-project', JSON.stringify({ blocks, settings }));
  }, [blocks, settings]);
  
  // History tracking state initialized with the loaded initial state
  const [history, setHistory] = useState<HistoryState[]>(() => [
    { blocks, settings }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreview, setIsPreview] = useState(false);

  // Helper to push new state to history
  const pushToHistory = useCallback((newBlocks: Block[], newSettings: ProjectSettings) => {
    setHistory(prev => {
      const cleanHistory = prev.slice(0, historyIndex + 1);
      return [...cleanHistory, { blocks: newBlocks, settings: newSettings }];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Undo action
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevState = history[prevIdx];
      setBlocksState(prevState.blocks);
      setSettingsState(prevState.settings);
      setHistoryIndex(prevIdx);
    }
  }, [history, historyIndex]);

  // Redo action
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextState = history[nextIdx];
      setBlocksState(nextState.blocks);
      setSettingsState(nextState.settings);
      setHistoryIndex(nextIdx);
    }
  }, [history, historyIndex]);

  // Wrapper setter for loading external projects or templates directly
  const setBlocks = useCallback((newBlocks: Block[]) => {
    setBlocksState(newBlocks);
    pushToHistory(newBlocks, settings);
  }, [pushToHistory, settings]);

  // Generate unique IDs
  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 9);
  }, []);

  // Reset Project
  const resetProject = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all blocks and start over?')) {
      const newBlocks: Block[] = [];
      const newSettings = DEFAULT_SETTINGS;
      setBlocksState(newBlocks);
      setSettingsState(newSettings);
      setSelectedBlockId(null);
      pushToHistory(newBlocks, newSettings);
    }
  }, [pushToHistory]);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<ProjectSettings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      pushToHistory(blocks, updated);
      return updated;
    });
  }, [blocks, pushToHistory]);

  // Add block to canvas
  const addBlock = useCallback((type: BlockType, content: Block['content'] = {}, styles: BlockStyles = {}) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1) + ' Section',
      content,
      styles: {
        bgColor: '#ffffff',
        textColor: '#1e293b',
        paddingTop: 'py-16',
        paddingBottom: 'py-16',
        textAlign: 'center',
        borderRadius: 'rounded-none',
        ...styles
      }
    };
    setBlocksState(prev => {
      const updated = [...prev, newBlock];
      pushToHistory(updated, settings);
      return updated;
    });
    setSelectedBlockId(newBlock.id);
  }, [generateId, pushToHistory, settings]);

  // Delete block
  const deleteBlock = useCallback((id: string) => {
    setBlocksState(prev => {
      const updated = prev.filter(b => b.id !== id);
      pushToHistory(updated, settings);
      return updated;
    });
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId, pushToHistory, settings]);

  // Move block up or down
  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setBlocksState(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;

      const result = [...prev];
      const [temp] = result.splice(idx, 1);
      result.splice(newIdx, 0, temp);
      pushToHistory(result, settings);
      return result;
    });
  }, [pushToHistory, settings]);

  // Update block content
  const updateBlockContent = useCallback((id: string, newContent: Partial<Block['content']>) => {
    setBlocksState(prev => {
      const updated = prev.map(b => (b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b));
      pushToHistory(updated, settings);
      return updated;
    });
  }, [pushToHistory, settings]);

  // Update block styles
  const updateBlockStyles = useCallback((id: string, newStyles: Partial<BlockStyles>) => {
    setBlocksState(prev => {
      const updated = prev.map(b => (b.id === id ? { ...b, styles: { ...b.styles, ...newStyles } } : b));
      pushToHistory(updated, settings);
      return updated;
    });
  }, [pushToHistory, settings]);

  return {
    blocks,
    setBlocks,
    selectedBlockId,
    setSelectedBlockId,
    settings,
    updateSettings,
    deviceMode,
    setDeviceMode,
    isPreview,
    setIsPreview,
    addBlock,
    deleteBlock,
    moveBlock,
    updateBlockContent,
    updateBlockStyles,
    resetProject,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
}
