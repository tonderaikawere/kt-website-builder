import { useState, useCallback, useEffect } from 'react';
import type { Block, BlockType, BlockStyles, ProjectSettings, Page, Project } from './types';

const DEFAULT_SETTINGS: ProjectSettings = {
  title: 'Kawerify Tech Site Project',
  description: 'Designed visually with Kawerify Tech Builder',
  customGlobalCss: '',
  fontFamily: 'Poppins, sans-serif',
  faviconUrl: '/favicon.ico'
};

const DEFAULT_PORTFOLIO_BLOCKS: Block[] = [
  {
    id: 'h1',
    type: 'header',
    name: 'Header Section',
    content: { 
      logoText: 'Rumah Ria', 
      items: [
        { id: '1', title: 'Home', link: '#' }, 
        { id: '2', title: 'Shop', link: '#shop' }, 
        { id: '3', title: 'Inspiration', link: '#inspiration' },
        { id: '4', title: 'About us', link: '#about' },
        { id: '5', title: 'Blog', link: '#blog' },
        { id: '6', title: 'Contact', link: '#contact' }
      ] 
    },
    styles: { bgColor: '#f5f2eb', textColor: '#1a1a1a', paddingTop: 'py-4', paddingBottom: 'py-4' }
  },
  {
    id: 'hero1',
    type: 'hero',
    name: 'Hero Section',
    content: { 
      title: 'Craft Your Perfect Space', 
      subtitle: 'Our curated collection combines timeless designs with modern comfort, helping you create a space where you can truly relax and unwind.', 
      buttonText: 'SHOP NOW', 
      buttonLink: '#shop',
      imageSrc: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800'
    },
    styles: { bgColor: '#f5f2eb', textColor: '#1a1a1a', paddingTop: 'py-20', paddingBottom: 'py-20' }
  },
  {
    id: 'port1',
    type: 'portfolio',
    name: 'Products Grid',
    content: {
      title: 'Featured Collection',
      items: [
        { id: '1', title: 'Nakamura Sofa', description: 'Living Room', price: '$900', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500' },
        { id: '2', title: 'Rimba Drawer Table', description: 'Living Room', price: '$750', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500' },
        { id: '3', title: 'Awan Armchair', description: 'Living Room', price: '$825', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500' }
      ]
    },
    styles: { bgColor: '#f5f2eb', textColor: '#1a1a1a', paddingTop: 'py-16', paddingBottom: 'py-16' }
  },
  {
    id: 'f1',
    type: 'footer',
    name: 'Footer Section',
    content: { copyrightText: '© 2026 Rumah Ria. All rights reserved.' },
    styles: { bgColor: '#1a1a1a', textColor: '#94a3b8', paddingTop: 'py-6', paddingBottom: 'py-6' }
  }
];

export function useBuilderState() {
  const [projects, setProjectsState] = useState<Project[]>(() => {
    try {
      // 1. Check for multiple projects database
      const savedProjects = localStorage.getItem('kt-builder-projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }

      // 2. Auto-migration check: If old single project exists, migrate it
      const savedOld = localStorage.getItem('kt-builder-project');
      if (savedOld) {
        const parsedOld = JSON.parse(savedOld);
        const migratedProject: Project = {
          id: Math.random().toString(36).substring(2, 9),
          name: parsedOld.settings?.title || 'My Migrated Site',
          pages: parsedOld.pages || [{ id: 'home', name: 'Home', slug: 'home', blocks: parsedOld.blocks || [] }],
          settings: parsedOld.settings || DEFAULT_SETTINGS,
          updatedAt: new Date().toISOString()
        };
        localStorage.removeItem('kt-builder-project');
        return [migratedProject];
      }
    } catch (e) {}

    // 3. Fallback: Pre-populate beautiful default template sites
    return [
      {
        id: 'portfolio-pro',
        name: 'Creative Portfolio',
        pages: [{ id: 'home', name: 'Home', slug: 'home', blocks: DEFAULT_PORTFOLIO_BLOCKS }],
        settings: DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ecommerce-pro',
        name: 'Brand Storefront',
        pages: [{
          id: 'home',
          name: 'Home',
          slug: 'home',
          blocks: [
            {
              id: 'h2',
              type: 'header',
              name: 'Header Section',
              content: { logoText: 'MODERN SHOP', items: [{ id: '1', title: 'Store', link: '#' }, { id: '2', title: 'About', link: '#' }] },
              styles: { bgColor: '#ffffff', textColor: '#0f172a', paddingTop: 'py-4', paddingBottom: 'py-4' }
            },
            {
              id: 'hero2',
              type: 'hero',
              name: 'Hero Section',
              content: { title: 'Premium Design Goods', subtitle: 'Curated products built for visual architects and digital artists.', buttonText: 'Shop All Items' },
              styles: { bgColor: '#f8fafc', textColor: '#0f172a', paddingTop: 'py-20', paddingBottom: 'py-20' }
            },
            {
              id: 'store1',
              type: 'ecommerce',
              name: 'Product Grid',
              content: {
                title: 'Featured Collection',
                items: [
                  { id: 'e1', title: 'Minimalist Clock', price: '$49.00', description: 'Sleek wood frame analog piece.', imageSrc: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
                  { id: 'e2', title: 'Leather Backpack', price: '$129.00', description: 'Full grain laptop-ready bag.', imageSrc: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' }
                ]
              },
              styles: { bgColor: '#ffffff', textColor: '#0f172a', paddingTop: 'py-16', paddingBottom: 'py-16' }
            }
          ]
        }],
        settings: DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString()
      }
    ];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const projId = urlParams.get('project');
      if (projId && projects.some(p => p.id === projId)) return projId;
    } catch (e) {}
    if (projects.length > 0) return projects[0].id;
    return null;
  });

  const [currentPageId, setCurrentPageId] = useState<string>('home');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreview, setIsPreview] = useState(false);

  const [history, setHistory] = useState<Project[][]>(() => [projects]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushToHistory = useCallback((newProjects: Project[]) => {
    setHistory(prev => {
      const clean = prev.slice(0, historyIndex + 1);
      return [...clean, newProjects];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setProjectsState(history[prevIdx]);
      setHistoryIndex(prevIdx);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setProjectsState(history[nextIdx]);
      setHistoryIndex(nextIdx);
    }
  }, [history, historyIndex]);

  // Autosave to localStorage on changes
  useEffect(() => {
    localStorage.setItem('kt-builder-projects', JSON.stringify(projects));
  }, [projects]);

  // Current active project details
  const activeProject = projects.find(p => p.id === currentProjectId) || projects[0] || null;
  const pages = activeProject ? activeProject.pages : [];
  const activePage = pages.find(p => p.id === currentPageId) || pages[0] || null;
  const blocks = activePage ? activePage.blocks : [];
  const settings = activeProject ? activeProject.settings : DEFAULT_SETTINGS;

  // Sync current page id if current project switches
  useEffect(() => {
    if (pages.length > 0 && !pages.some(p => p.id === currentPageId)) {
      setCurrentPageId(pages[0].id);
    }
  }, [currentProjectId, pages, currentPageId]);

  // Helper to generate IDs
  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2, 9);
  }, []);

  // Update projects list helper
  const updateActiveProject = useCallback((updater: (proj: Project) => Project) => {
    if (!currentProjectId) return;
    setProjectsState(prev => {
      const updated = prev.map(p => {
        if (p.id === currentProjectId) {
          return updater({
            ...p,
            updatedAt: new Date().toISOString()
          });
        }
        return p;
      });
      pushToHistory(updated);
      return updated;
    });
  }, [currentProjectId, pushToHistory]);

  // Load project
  const loadProject = useCallback((id: string) => {
    setCurrentProjectId(id);
    setSelectedBlockId(null);
  }, []);

  // Create project
  const createProject = useCallback((name: string, templateType?: string) => {
    const id = generateId();
    let templateBlocks: Block[] = [];
    if (templateType === 'portfolio') {
      templateBlocks = DEFAULT_PORTFOLIO_BLOCKS;
    }
    const newProject: Project = {
      id,
      name,
      pages: [{ id: 'home', name: 'Home', slug: 'home', blocks: templateBlocks }],
      settings: { ...DEFAULT_SETTINGS, title: name },
      updatedAt: new Date().toISOString()
    };
    setProjectsState(prev => [newProject, ...prev]);
    setCurrentProjectId(id);
    return id;
  }, [generateId]);

  // Delete project
  const deleteProject = useCallback((id: string) => {
    setProjectsState(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (filtered.length === 0) {
        // Re-create a default placeholder if empty
        return [{
          id: 'default',
          name: 'My Visual Website',
          pages: [{ id: 'home', name: 'Home', slug: 'home', blocks: [] }],
          settings: DEFAULT_SETTINGS,
          updatedAt: new Date().toISOString()
        }];
      }
      return filtered;
    });
    if (currentProjectId === id) {
      setCurrentProjectId(projects.find(p => p.id !== id)?.id || null);
    }
  }, [projects, currentProjectId]);

  // Duplicate project
  const duplicateProject = useCallback((id: string) => {
    const target = projects.find(p => p.id === id);
    if (!target) return;
    const newId = generateId();
    const duplicated: Project = {
      ...target,
      id: newId,
      name: `${target.name} Copy`,
      pages: JSON.parse(JSON.stringify(target.pages)),
      settings: { ...target.settings, title: `${target.settings.title} Copy` },
      updatedAt: new Date().toISOString()
    };
    setProjectsState(prev => [duplicated, ...prev]);
    setCurrentProjectId(newId);
  }, [projects, generateId]);

  // Rename Project
  const renameProject = useCallback((id: string, name: string) => {
    setProjectsState(prev => prev.map(p => p.id === id ? { ...p, name, settings: { ...p.settings, title: name }, updatedAt: new Date().toISOString() } : p));
  }, []);

  // Add Page
  const addPage = useCallback((name: string) => {
    if (!activeProject) return;
    const id = generateId();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newPage: Page = { id, name, slug, blocks: [] };
    updateActiveProject(p => ({
      ...p,
      pages: [...p.pages, newPage]
    }));
    setCurrentPageId(id);
  }, [activeProject, generateId, updateActiveProject]);

  // Duplicate Page
  const duplicatePage = useCallback((id: string) => {
    if (!activeProject) return;
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
    updateActiveProject(p => ({
      ...p,
      pages: [...p.pages, newPage]
    }));
    setCurrentPageId(newId);
  }, [activeProject, pages, generateId, updateActiveProject]);

  // Delete Page
  const deletePage = useCallback((id: string) => {
    if (pages.length <= 1) {
      alert('You cannot delete the last remaining page of the website.');
      return;
    }
    updateActiveProject(p => ({
      ...p,
      pages: p.pages.filter(pg => pg.id !== id)
    }));
    if (currentPageId === id) {
      setCurrentPageId(pages.filter(pg => pg.id !== id)[0].id);
    }
  }, [pages, currentPageId, updateActiveProject]);

  // Set pages directly
  const setPages = useCallback((newPages: Page[]) => {
    updateActiveProject(p => ({
      ...p,
      pages: newPages
    }));
  }, [updateActiveProject]);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<ProjectSettings>) => {
    updateActiveProject(p => ({
      ...p,
      settings: { ...p.settings, ...newSettings }
    }));
  }, [updateActiveProject]);

  // Reset project page canvas
  const resetProject = useCallback(() => {
    if (window.confirm('Clear all blocks on this page and start over?')) {
      updateActiveProject(p => ({
        ...p,
        pages: p.pages.map(pg => pg.id === currentPageId ? { ...pg, blocks: [] } : pg)
      }));
      setSelectedBlockId(null);
    }
  }, [currentPageId, updateActiveProject]);

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
    updateActiveProject(p => ({
      ...p,
      pages: p.pages.map(pg => pg.id === currentPageId ? { ...pg, blocks: [...pg.blocks, newBlock] } : pg)
    }));
    setSelectedBlockId(newBlock.id);
  }, [generateId, currentPageId, updateActiveProject]);

  // Delete block
  const deleteBlock = useCallback((id: string) => {
    updateActiveProject(p => ({
      ...p,
      pages: p.pages.map(pg => pg.id === currentPageId ? { ...pg, blocks: pg.blocks.filter(b => b.id !== id) } : pg)
    }));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId, currentPageId, updateActiveProject]);

  // Move block
  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    updateActiveProject(p => ({
      ...p,
      pages: p.pages.map(pg => {
        if (pg.id !== currentPageId) return pg;
        const idx = pg.blocks.findIndex(b => b.id === id);
        if (idx === -1) return pg;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= pg.blocks.length) return pg;
        const result = [...pg.blocks];
        const [temp] = result.splice(idx, 1);
        result.splice(newIdx, 0, temp);
        return { ...pg, blocks: result };
      })
    }));
  }, [currentPageId, updateActiveProject]);

  // Update block content
  const updateBlockContent = useCallback((id: string, newContent: Partial<Block['content']>) => {
    updateActiveProject(p => ({
      ...p,
      pages: p.pages.map(pg => {
        if (pg.id !== currentPageId) return pg;
        return {
          ...pg,
          blocks: pg.blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b)
        };
      })
    }));
  }, [currentPageId, updateActiveProject]);

  // Update block styles
  const updateBlockStyles = useCallback((id: string, newStyles: Partial<BlockStyles>) => {
    updateActiveProject(p => ({
      ...p,
      pages: p.pages.map(pg => {
        if (pg.id !== currentPageId) return pg;
        return {
          ...pg,
          blocks: pg.blocks.map(b => b.id === id ? { ...b, styles: { ...b.styles, ...newStyles } } : b)
        };
      })
    }));
  }, [currentPageId, updateActiveProject]);

  return {
    projects,
    currentProjectId,
    setCurrentProjectId,
    activeProject,
    pages,
    currentPageId,
    setCurrentPageId,
    activePage,
    blocks,
    settings,
    setPages,
    selectedBlockId,
    setSelectedBlockId,
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
    createProject,
    deleteProject,
    duplicateProject,
    renameProject,
    loadProject,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
}
