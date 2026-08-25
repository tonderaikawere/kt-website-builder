import { useState, useCallback, useEffect } from 'react';
import type { Block, BlockType, BlockStyles, ProjectSettings, Page } from './types';

const DEFAULT_SETTINGS: ProjectSettings = {
  title: 'Kawerify Tech Site Project',
  description: 'Designed visually with Kawerify Tech Builder',
  customGlobalCss: '',
  fontFamily: 'Poppins, sans-serif',
  faviconUrl: '/favicon.ico'
};

interface HistoryState {
  pages: Page[];
  settings: ProjectSettings;
}

export function useBuilderState() {
  // Load pages from localStorage synchronously with old schema migration
  const [pages, setPagesState] = useState<Page[]>(() => {
    try {
      const saved = localStorage.getItem('kt-builder-project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.pages)) return parsed.pages;
        if (Array.isArray(parsed.blocks)) {
          return [{
            id: 'home',
            name: 'Home',
            slug: 'home',
            blocks: parsed.blocks
          }];
        }
      }
    } catch (e) {}
    return [{
      id: 'home',
      name: 'Home',
      slug: 'home',
      blocks: []
    }];
  });

  const [currentPageId, setCurrentPageId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('kt-builder-project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
          return parsed.pages[0].id;
        }
      }
    } catch (e) {}
    return 'home';
  });

  // Load settings from localStorage
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
    localStorage.setItem('kt-builder-project', JSON.stringify({ pages, settings }));
  }, [pages, settings]);

  // History tracking state
  const [history, setHistory] = useState<HistoryState[]>(() => [
    { pages, settings }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreview, setIsPreview] = useState(false);

  // Helper to push new state to history
  const pushToHistory = useCallback((newPages: Page[], newSettings: ProjectSettings) => {
    setHistory(prev => {
      const cleanHistory = prev.slice(0, historyIndex + 1);
      return [...cleanHistory, { pages: newPages, settings: newSettings }];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Undo action
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevState = history[prevIdx];
      setPagesState(prevState.pages);
      setSettingsState(prevState.settings);
      setHistoryIndex(prevIdx);
    }
  }, [history, historyIndex]);

  // Redo action
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextState = history[nextIdx];
      setPagesState(nextState.pages);
      setSettingsState(nextState.settings);
      setHistoryIndex(nextIdx);
    }
  }, [history, historyIndex]);

  // Set Pages directly (loading external json)
  const setPages = useCallback((newPages: Page[]) => {
    setPagesState(newPages);
    if (newPages.length > 0 && !newPages.some(p => p.id === currentPageId)) {
      setCurrentPageId(newPages[0].id);
    }
    pushToHistory(newPages, settings);
  }, [pushToHistory, settings, currentPageId]);

  // Generate unique IDs
  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 9);
  }, []);

  // Active Page details
  const activePage = pages.find(p => p.id === currentPageId) || pages[0] || { id: 'home', name: 'Home', slug: 'home', blocks: [] };
  const blocks = activePage.blocks;

  // Add Page
  const addPage = useCallback((name: string) => {
    const id = generateId();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newPage: Page = {
      id,
      name,
      slug,
      blocks: []
    };
    setPagesState(prev => {
      const updated = [...prev, newPage];
      pushToHistory(updated, settings);
      return updated;
    });
    setCurrentPageId(id);
  }, [generateId, pushToHistory, settings]);

  // Duplicate Page
  const duplicatePage = useCallback((id: string) => {
    const target = pages.find(p => p.id === id);
    if (!target) return;
    const newId = generateId();
    const newPage: Page = {
      ...target,
      id: newId,
      name: `${target.name} Copy`,
      slug: `${target.slug}-copy`,
      blocks: JSON.parse(JSON.stringify(target.blocks))
    };
    setPagesState(prev => {
      const updated = [...prev, newPage];
      pushToHistory(updated, settings);
      return updated;
    });
    setCurrentPageId(newId);
  }, [pages, generateId, pushToHistory, settings]);

  // Delete Page
  const deletePage = useCallback((id: string) => {
    if (pages.length <= 1) {
      alert('You cannot delete the last remaining page of the website.');
      return;
    }
    setPagesState(prev => {
      const updated = prev.filter(p => p.id !== id);
      pushToHistory(updated, settings);
      return updated;
    });
    if (currentPageId === id) {
      const remaining = pages.filter(p => p.id !== id);
      setCurrentPageId(remaining[0].id);
    }
  }, [pages, currentPageId, pushToHistory, settings]);

  // Rename Page
  const renamePage = useCallback((id: string, name: string) => {
    setPagesState(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return { ...p, name, slug };
        }
        return p;
      });
      pushToHistory(updated, settings);
      return updated;
    });
  }, [pushToHistory, settings]);

  // Reset Project
  const resetProject = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all blocks and start over?')) {
      const newPages = [{
        id: 'home',
        name: 'Home',
        slug: 'home',
        blocks: []
      }];
      const newSettings = DEFAULT_SETTINGS;
      setPagesState(newPages);
      setSettingsState(newSettings);
      setCurrentPageId('home');
      setSelectedBlockId(null);
      pushToHistory(newPages, newSettings);
    }
  }, [pushToHistory]);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<ProjectSettings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      pushToHistory(pages, updated);
      return updated;
    });
  }, [pages, pushToHistory]);

  // Add block to current page
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
    setPagesState(prev => {
      const updated = prev.map(p => p.id === currentPageId ? { ...p, blocks: [...p.blocks, newBlock] } : p);
      pushToHistory(updated, settings);
      return updated;
    });
    setSelectedBlockId(newBlock.id);
  }, [generateId, pushToHistory, settings, currentPageId]);

  // Delete block from current page
  const deleteBlock = useCallback((id: string) => {
    setPagesState(prev => {
      const updated = prev.map(p => p.id === currentPageId ? { ...p, blocks: p.blocks.filter(b => b.id !== id) } : p);
      pushToHistory(updated, settings);
      return updated;
    });
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId, pushToHistory, settings, currentPageId]);

  // Move block up/down inside current page
  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setPagesState(prev => {
      const updated = prev.map(p => {
        if (p.id !== currentPageId) return p;
        const idx = p.blocks.findIndex(b => b.id === id);
        if (idx === -1) return p;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= p.blocks.length) return p;
        const result = [...p.blocks];
        const [temp] = result.splice(idx, 1);
        result.splice(newIdx, 0, temp);
        return { ...p, blocks: result };
      });
      pushToHistory(updated, settings);
      return updated;
    });
  }, [pushToHistory, settings, currentPageId]);

  // Update block content inside current page
  const updateBlockContent = useCallback((id: string, newContent: Partial<Block['content']>) => {
    setPagesState(prev => {
      const updated = prev.map(p => {
        if (p.id !== currentPageId) return p;
        const blocks = p.blocks.map(b => (b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b));
        return { ...p, blocks };
      });
      pushToHistory(updated, settings);
      return updated;
    });
  }, [pushToHistory, settings, currentPageId]);

  // Update block styles inside current page
  const updateBlockStyles = useCallback((id: string, newStyles: Partial<BlockStyles>) => {
    setPagesState(prev => {
      const updated = prev.map(p => {
        if (p.id !== currentPageId) return p;
        const blocks = p.blocks.map(b => (b.id === id ? { ...b, styles: { ...b.styles, ...newStyles } } : b));
        return { ...p, blocks };
      });
      pushToHistory(updated, settings);
      return updated;
    });
  }, [pushToHistory, settings, currentPageId]);

  return {
    pages,
    currentPageId,
    setCurrentPageId,
    activePage,
    blocks,
    setPages,
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
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
}
