import { useState, useCallback } from 'react';
import { Block, BlockType, BlockStyles, ProjectSettings } from './types';

const DEFAULT_SETTINGS: ProjectSettings = {
  title: 'My Custom Website',
  description: 'Created with KT Website Builder',
  customGlobalCss: '',
  fontFamily: 'Inter, sans-serif'
};

export function useBuilderState() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ProjectSettings>(DEFAULT_SETTINGS);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreview, setIsPreview] = useState(false);

  // Generate unique IDs
  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 9);
  }, []);

  // Reset Project
  const resetProject = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all blocks and start over?')) {
      setBlocks([]);
      setSelectedBlockId(null);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<ProjectSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

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
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, [generateId]);

  // Delete block
  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  // Move block up or down
  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;

      const result = [...prev];
      const [temp] = result.splice(idx, 1);
      result.splice(newIdx, 0, temp);
      return result;
    });
  }, []);

  // Update block content
  const updateBlockContent = useCallback((id: string, newContent: Partial<Block['content']>) => {
    setBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b))
    );
  }, []);

  // Update block styles
  const updateBlockStyles = useCallback((id: string, newStyles: Partial<BlockStyles>) => {
    setBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, styles: { ...b.styles, ...newStyles } } : b))
    );
  }, []);

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
    resetProject
  };
}
