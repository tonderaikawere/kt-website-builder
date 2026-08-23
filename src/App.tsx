import { useState, useEffect } from 'react';
import { 
  Layout, 
  Settings, 
  Layers, 
  FileCode, 
  Palette, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Eye, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Undo,
  Redo,
  Sun,
  Moon,
  Cloud
} from 'lucide-react';
import { useBuilderState } from './useBuilderState';
import { BLOCK_TEMPLATES } from './blockTemplates';
import { BlockRenderer } from './components/Blocks';
import { Inspector } from './components/Inspector';
import { ExportModal } from './components/ExportModal';
import { RichTextToolbar } from './components/RichTextToolbar';
import type { BlockType } from './types';

const PAGE_TEMPLATES = [
  {
    name: 'Standard Landing Page',
    description: 'Clean header, hero banner, detailed feature list, CTA banner, and footer.',
    blockTypes: ['header', 'hero', 'features', 'cta', 'footer'] as BlockType[]
  },
  {
    name: 'Minimalist Landing Page',
    description: 'Engaging hero banner, quick CTA panel, and copyright footer.',
    blockTypes: ['hero', 'cta', 'footer'] as BlockType[]
  },
  {
    name: 'Business Home Page',
    description: 'Logo navigation header, structured feature grid, and page footer.',
    blockTypes: ['header', 'features', 'footer'] as BlockType[]
  },
  {
    name: 'Creative Sandbox Board',
    description: 'Logo navigation header, Figma-like sketch sandbox board, and page footer.',
    blockTypes: ['header', 'sandbox', 'footer'] as BlockType[]
  }
];

const COLOR_PALETTES = [
  {
    name: 'Kawerify Tech',
    primary: '#0b4a86',
    accent: '#aa3bff',
    deep: '#07162f',
    light: '#f6f9fd'
  },
  {
    name: 'Elegant Dark',
    primary: '#1e1b4b',
    accent: '#f43f5e',
    deep: '#0f172a',
    light: '#1e293b'
  },
  {
    name: 'Ocean Tide',
    primary: '#0f766e',
    accent: '#06b6d4',
    deep: '#111827',
    light: '#ecfeff'
  },
  {
    name: 'Sunset Rose',
    primary: '#be123c',
    accent: '#fb7185',
    deep: '#1e1b4b',
    light: '#fff1f2'
  },
  {
    name: 'Forest Gold',
    primary: '#15803d',
    accent: '#eab308',
    deep: '#14532d',
    light: '#f0fdf4'
  }
];

function App() {
  const [activeTab, setActiveTab] = useState<'blocks' | 'inspector' | 'templates' | 'css' | 'seo'>('blocks');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{ blockId: string; elementPath: string; elementType: string } | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [zoomMode, setZoomMode] = useState<'fit' | 'full'>('full');
  
  const {
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
    canUndo,
    canRedo
  } = useBuilderState();

  // Global Keyboard Shortcuts for Undo, Redo, and Block Deletion (Wix / Figma style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBlockId) {
          e.preventDefault();
          deleteBlock(selectedBlockId);
          setSelectedBlockId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, undo, redo, deleteBlock, setSelectedBlockId]);

  const applyColorPalette = (palette: typeof COLOR_PALETTES[0]) => {
    const updatedBlocks = blocks.map(block => {
      let bgColor = '#ffffff';
      let textColor = palette.deep;
      
      if (block.type === 'hero' || block.type === 'cta') {
        bgColor = palette.primary;
        textColor = '#ffffff';
      } else if (block.type === 'footer') {
        bgColor = palette.deep;
        textColor = '#94a3b8';
      } else if (block.type === 'features' || block.type === 'pricing' || block.type === 'linkButton') {
        bgColor = palette.light;
        textColor = palette.deep;
      }
      
      return {
        ...block,
        styles: {
          ...block.styles,
          bgColor,
          textColor
        }
      };
    });
    setBlocks(updatedBlocks);
  };

  // Dynamically update document title for editor tab preview
  useEffect(() => {
    document.title = settings.title || 'KT Website Builder';
  }, [settings.title]);

  // Handle HTML5 drag start
  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('text/plain', type);
  };

  // Handle drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as BlockType;
    const template = BLOCK_TEMPLATES.find(t => t.type === type);
    if (template) {
      addBlock(type, template.defaultContent, template.defaultStyles);
    }
  };

  // Handle click to add block
  const handleBlockClick = (type: BlockType) => {
    const template = BLOCK_TEMPLATES.find(t => t.type === type);
    if (template) {
      addBlock(type, template.defaultContent, template.defaultStyles);
    }
  };

  // Export project layout to JSON
  const exportProjectJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ blocks, settings }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "kt-project.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
  };

  // Import project layout from JSON
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.blocks)) {
          setBlocks(data.blocks);
        }
        if (data.settings) {
          updateSettings(data.settings);
        }
        alert('Project loaded successfully!');
      } catch (err) {
        alert('Invalid project JSON file!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`flex flex-col h-screen w-screen bg-brand-soft text-slate-800 select-none overflow-hidden ${isDarkMode ? 'dark bg-brand-ink text-slate-100' : ''}`}>
      {/* Dynamic Custom Global CSS stylesheet */}
      <style>{settings.customGlobalCss}</style>

      {/* Dynamic Block-level Custom CSS rules */}
      <style>
        {blocks.map(block => {
          if (!block.styles.customCss) return '';
          return block.styles.customCss
            .replace(/\.block-id/g, `#block-${block.id}`)
            .replace(/__self__/g, `#block-${block.id}`);
        }).join('\n')}
      </style>

      {/* Dynamic Web Font Link loader */}
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${settings.fontFamily.split(',')[0].replace(/['"\s]/g, '+')}:wght@400;500;600;700;800&display=swap`}
      />

      {/* Top Toolbar (Wix Studio style) */}
      {!isPreview && (
        <header className="flex items-center justify-between px-6 h-14 bg-[#f8f9fa] dark:bg-[#1a1b1e] border-b border-slate-250 dark:border-brand-ink z-20 shrink-0 select-none">
          {/* Left Side: Brand, User Initials, Site Name and Zoom */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-4">
              <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold">
                T
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-white tracking-tight">My Site 1</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </div>
            
            <button
              onClick={() => setZoomMode(prev => prev === 'fit' ? 'full' : 'fit')}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer mr-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded transition-all"
              title="Toggle Birds-eye view vs Full scale"
            >
              <span>{zoomMode === 'fit' ? 'Zoom: 80%' : 'Fit (100%)'}</span>
              <span className="text-[8px]">▼</span>
            </button>
            
            <button
              onClick={() => setIsAddDrawerOpen(prev => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold rounded border border-slate-200 dark:border-slate-750 shadow-sm text-brand-primary cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {/* Center Address and Page selector */}
          <div className="hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-1 rounded-full text-[11px] shadow-sm text-slate-500">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Page:</span>
              <select className="bg-transparent border-none text-[11px] font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer">
                <option>Home</option>
                <option>About Projects</option>
                <option>Contact Info</option>
              </select>
            </div>
            <div className="w-px h-3 bg-slate-200 dark:bg-slate-800" />
            <span className="font-mono text-[10px] opacity-75">tondeskawere.wixsite.com/my-site-1</span>
          </div>

          {/* Right Side: Device viewports, Save, Undo, Redo, Preview, and Publish */}
          <div className="flex items-center gap-3">
            {/* Viewport device toggles */}
            <div className="flex bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-250 dark:border-slate-700 mr-2">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1 rounded-md transition-colors ${deviceMode === 'desktop' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-sm' : 'text-slate-550 hover:text-slate-850 dark:text-slate-400'}`}
                title="Desktop Layout"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1 rounded-md transition-colors ${deviceMode === 'mobile' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-sm' : 'text-slate-550 hover:text-slate-850 dark:text-slate-400'}`}
                title="Mobile Layout"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Save indicator */}
            <div className="flex items-center text-slate-400 dark:text-slate-500" title="All changes saved to cloud">
              <Cloud className="w-4 h-4 text-emerald-500 animate-pulse mr-1" />
              <span className="text-[10px] hidden lg:inline font-medium">Saved</span>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />

            {/* Undo/Redo arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`p-1.5 rounded-lg transition-colors ${canUndo ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
                title="Undo last change"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`p-1.5 rounded-lg transition-colors ${canRedo ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
                title="Redo next change"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />

            {/* Reset button */}
            <button
              onClick={resetProject}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
              title="Reset layout configuration"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-accent transition-colors"
              title="Toggle theme mode"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Import JSON */}
            <input 
              type="file" 
              id="import-json" 
              accept=".json" 
              onChange={handleJsonImport} 
              className="hidden" 
            />
            <button 
              onClick={() => document.getElementById('import-json')?.click()}
              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-accent transition-colors"
              title="Import Layout JSON"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {/* Export JSON */}
            <button 
              onClick={exportProjectJson}
              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-accent transition-colors"
              title="Export Layout JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />

            <button
              onClick={() => setIsPreview(true)}
              className="text-[11px] font-semibold text-slate-650 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Preview
            </button>

            {/* Publish button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-4 py-1.5 bg-[#005cff] hover:bg-[#004ecc] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
            >
              Publish
            </button>
          </div>
        </header>
      )}

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Wix-style Add Elements Slide-out Drawer */}
        {isAddDrawerOpen && !isPreview && (
          <div className="absolute top-0 bottom-0 left-80 w-72 bg-white dark:bg-[#1a1b1e] border-r border-slate-200 dark:border-slate-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-left duration-250">
            <div className="p-4 border-b border-slate-100 dark:border-brand-ink flex items-center justify-between bg-slate-50 dark:bg-brand-deep">
              <div>
                <h3 className="font-bold text-xs text-slate-805 dark:text-white uppercase tracking-wider">Add Elements</h3>
                <p className="text-[10px] text-slate-400">Click to insert sections to your page</p>
              </div>
              <button 
                onClick={() => setIsAddDrawerOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 hover:bg-slate-105 dark:hover:bg-slate-800 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {BLOCK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.type}
                  onClick={() => {
                    addBlock(tpl.type);
                    setIsAddDrawerOpen(false);
                  }}
                  className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-brand-ink hover:border-brand-accent transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex flex-col pr-2">
                    <span className="text-xs font-semibold text-slate-805 dark:text-white group-hover:text-brand-accent">{tpl.name}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{tpl.description}</span>
                  </div>
                  <span className="text-xs text-brand-primary opacity-0 group-hover:opacity-100 font-bold transition-opacity shrink-0">
                    + Add
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Left Sidebar - Hidden in Preview */}
        {!isPreview && (
          <aside className="w-80 bg-white dark:bg-brand-deep border-r border-slate-200 dark:border-brand-ink flex flex-col h-full z-10">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-200 dark:border-brand-ink bg-slate-50 dark:bg-brand-deep">
              <button
                onClick={() => setActiveTab('blocks')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'blocks'
                    ? 'border-brand-accent text-brand-accent bg-white dark:bg-brand-deep'
                    : 'border-transparent text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-accent'
                }`}
              >
                <Layers className="w-4 h-4" />
                Blocks
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'inspector'
                    ? 'border-brand-accent text-brand-accent bg-white dark:bg-brand-deep'
                    : 'border-transparent text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-accent'
                }`}
              >
                <Palette className="w-4 h-4" />
                Styles
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'templates'
                    ? 'border-brand-accent text-brand-accent bg-white dark:bg-brand-deep'
                    : 'border-transparent text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-accent'
                }`}
              >
                <Layout className="w-4 h-4" />
                Presets
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'css'
                    ? 'border-brand-accent text-brand-accent bg-white dark:bg-brand-deep'
                    : 'border-transparent text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-accent'
                }`}
              >
                <FileCode className="w-4 h-4" />
                CSS
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'seo'
                    ? 'border-brand-accent text-brand-accent bg-white dark:bg-brand-deep'
                    : 'border-transparent text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-accent'
                }`}
              >
                <Settings className="w-4 h-4" />
                SEO
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'blocks' && (
                <div className="space-y-6">
                  {/* Shopify-like Active Page Sections List */}
                  <div className="border-b border-slate-200 dark:border-brand-ink pb-5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Page Sections</h3>
                    {blocks.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No sections on the canvas. Drag elements below to start.</p>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {blocks.map((block, idx) => {
                          const isBlockSelected = selectedBlockId === block.id;
                          return (
                            <div key={block.id} className="space-y-1">
                              <div
                                onClick={() => {
                                  setSelectedBlockId(block.id);
                                  setSelectedElement(null);
                                }}
                                className={`group flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                                  isBlockSelected
                                    ? 'bg-brand-accent-bg border-brand-accent text-brand-accent font-semibold shadow-sm animate-pulse-once'
                                    : 'bg-slate-50 dark:bg-brand-deep/50 border-slate-200 dark:border-brand-ink text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-brand-deep'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="text-slate-450 dark:text-slate-500">
                                    {block.type === 'header' ? '☰' : block.type === 'hero' ? '❖' : block.type === 'features' ? '⚏' : block.type === 'portfolio' ? '🖼️' : '❑'}
                                  </span>
                                  <span className="truncate pr-2 font-medium">{block.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveBlock(block.id, 'up');
                                    }}
                                    disabled={idx === 0}
                                    className="hover:text-brand-primary p-0.5 disabled:opacity-30 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveBlock(block.id, 'down');
                                    }}
                                    disabled={idx === blocks.length - 1}
                                    className="hover:text-brand-primary p-0.5 disabled:opacity-30 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteBlock(block.id);
                                    }}
                                    className="hover:text-red-500 p-0.5 cursor-pointer"
                                    title="Delete Section"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Child Element Sub-tree list (Wix style) */}
                              {isBlockSelected && (
                                <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-4 animate-in fade-in slide-in-from-left-1 duration-150">
                                  {block.content.logoText !== undefined && (
                                    <div className="group/item flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded pr-1.5">
                                      <button
                                        onClick={() => setSelectedElement({ blockId: block.id, elementPath: 'logoText', elementType: 'logoText' })}
                                        className={`flex-1 text-left px-2 py-1 rounded text-[11px] flex items-center gap-2 transition-colors cursor-pointer ${selectedElement?.blockId === block.id && selectedElement?.elementPath === 'logoText' ? 'bg-slate-100 dark:bg-slate-800 text-brand-accent font-bold' : 'text-slate-500'}`}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                        <span className="truncate">Logo Text</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateBlockContent(block.id, { logoText: '' });
                                          setSelectedElement(null);
                                        }}
                                        className="opacity-0 group-hover/item:opacity-100 hover:text-red-505 p-0.5 text-slate-400 cursor-pointer"
                                        title="Clear logo text"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}
                                  {block.content.title !== undefined && (
                                    <div className="group/item flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded pr-1.5">
                                      <button
                                        onClick={() => setSelectedElement({ blockId: block.id, elementPath: 'title', elementType: 'title' })}
                                        className={`flex-1 text-left px-2 py-1 rounded text-[11px] flex items-center gap-2 transition-colors cursor-pointer ${selectedElement?.blockId === block.id && selectedElement?.elementPath === 'title' ? 'bg-slate-100 dark:bg-slate-800 text-brand-accent font-bold' : 'text-slate-500'}`}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                        <span className="truncate">Heading Title</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateBlockContent(block.id, { title: '' });
                                          setSelectedElement(null);
                                        }}
                                        className="opacity-0 group-hover/item:opacity-100 hover:text-red-505 p-0.5 text-slate-400 cursor-pointer"
                                        title="Clear heading title"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}
                                  {block.content.subtitle !== undefined && (
                                    <div className="group/item flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded pr-1.5">
                                      <button
                                        onClick={() => setSelectedElement({ blockId: block.id, elementPath: 'subtitle', elementType: 'subtitle' })}
                                        className={`flex-1 text-left px-2 py-1 rounded text-[11px] flex items-center gap-2 transition-colors cursor-pointer ${selectedElement?.blockId === block.id && selectedElement?.elementPath === 'subtitle' ? 'bg-slate-100 dark:bg-slate-800 text-brand-accent font-bold' : 'text-slate-500'}`}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                        <span className="truncate">Subheading Text</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateBlockContent(block.id, { subtitle: '' });
                                          setSelectedElement(null);
                                        }}
                                        className="opacity-0 group-hover/item:opacity-100 hover:text-red-505 p-0.5 text-slate-400 cursor-pointer"
                                        title="Clear subheading"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}
                                  {block.content.buttonText !== undefined && (
                                    <div className="group/item flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded pr-1.5">
                                      <button
                                        onClick={() => setSelectedElement({ blockId: block.id, elementPath: 'buttonText', elementType: 'button' })}
                                        className={`flex-1 text-left px-2 py-1 rounded text-[11px] flex items-center gap-2 transition-colors cursor-pointer ${selectedElement?.blockId === block.id && selectedElement?.elementPath === 'buttonText' ? 'bg-slate-100 dark:bg-slate-800 text-brand-accent font-bold' : 'text-slate-500'}`}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        <span className="truncate">Action Button</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateBlockContent(block.id, { buttonText: '' });
                                          setSelectedElement(null);
                                        }}
                                        className="opacity-0 group-hover/item:opacity-100 hover:text-red-505 p-0.5 text-slate-400 cursor-pointer"
                                        title="Clear button text"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Add Elements</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Drag these elements on the canvas or click to add them.</p>
                    
                    <div className="space-y-2">
                    {BLOCK_TEMPLATES.map((tpl) => (
                      <div
                        key={tpl.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, tpl.type)}
                        onClick={() => handleBlockClick(tpl.type)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 border-dashed hover:border-brand-accent transition-all cursor-grab flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-700">{tpl.name}</span>
                          <span className="text-[10px] text-slate-400 max-w-[200px] mt-0.5 line-clamp-1">{tpl.description}</span>
                        </div>
                        <Plus className="w-4 h-4 text-brand-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
              {activeTab === 'inspector' && (
                <Inspector 
                  selectedBlock={blocks.find(b => b.id === selectedBlockId)}
                  onUpdateStyles={updateBlockStyles}
                />
              )}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 text-sm">Preset Page Templates</h3>
                  <p className="text-xs text-slate-500 mb-4">Select a layout preset to automatically populate your website page canvas.</p>
                  
                  <div className="space-y-3">
                    {PAGE_TEMPLATES.map((tpl, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (window.confirm(`Loading "${tpl.name}" will overwrite your current layout. Proceed?`)) {
                            const newBlocks = tpl.blockTypes.map(type => {
                              const blockTpl = BLOCK_TEMPLATES.find(t => t.type === type);
                              return {
                                id: Math.random().toString(36).substring(2, 9),
                                type,
                                name: type.charAt(0).toUpperCase() + type.slice(1) + ' Section',
                                content: blockTpl ? { ...blockTpl.defaultContent } : {},
                                styles: blockTpl ? { ...blockTpl.defaultStyles } : { bgColor: '#ffffff', textColor: '#07162f' }
                              };
                            });
                            setBlocks(newBlocks);
                            setSelectedBlockId(newBlocks[0]?.id || null);
                          }
                        }}
                        className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-brand-primary rounded-xl transition-all flex flex-col gap-1 shadow-sm"
                      >
                        <span className="text-xs font-bold text-slate-800">{tpl.name}</span>
                        <span className="text-[10px] text-slate-500 leading-normal">{tpl.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'css' && (
                <div className="space-y-4 h-full flex flex-col">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Custom Global CSS</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Write custom stylesheets to style your canvas pages.</p>
                  </div>
                  <textarea
                    value={settings.customGlobalCss}
                    onChange={(e) => updateSettings({ customGlobalCss: e.target.value })}
                    placeholder="/* Write custom CSS here */&#10;body {&#10;  font-family: sans-serif;&#10;}&#10;.my-class {&#10;  border: 2px solid red;&#10;}"
                    className="w-full flex-1 min-h-[300px] text-xs font-mono p-3 bg-brand-deep text-slate-300 rounded-xl border border-brand-ink focus:outline-none resize-none"
                  />
                </div>
              )}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Page Settings</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Customize global styles, typography, and meta tags.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Font Family</label>
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-slate-100"
                    >
                      <option value="Poppins, sans-serif">(Recommended) Poppins (Sans-serif)</option>
                      <option value="Montserrat, sans-serif">Montserrat (Sans-serif)</option>
                      <option value="Inter, sans-serif">Inter (Sans-serif)</option>
                      <option value="Roboto, sans-serif">Roboto (Sans-serif)</option>
                      <option value="Playfair Display, serif">Playfair Display (Serif)</option>
                      <option value="Lora, serif">Lora (Serif)</option>
                      <option value="JetBrains Mono, monospace">JetBrains Mono (Monospace)</option>
                    </select>
                  </div>

                  {/* Theme Presets */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-brand-ink">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">Global Theme Presets</label>
                    <p className="text-[10px] text-slate-400">Instantly theme all canvas sections in one click.</p>
                    <div className="grid grid-cols-1 gap-2 mt-1.5">
                      {COLOR_PALETTES.map((palette) => (
                        <button
                          key={palette.name}
                          onClick={() => applyColorPalette(palette)}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-brand-deep/30 border border-slate-200 dark:border-brand-ink hover:border-brand-accent rounded-xl text-left text-xs transition-all cursor-pointer group"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-350 group-hover:text-brand-accent transition-colors">{palette.name}</span>
                          <div className="flex gap-1">
                            <span style={{ backgroundColor: palette.primary }} className="w-3.5 h-3.5 rounded-full border border-slate-200" title="Primary" />
                            <span style={{ backgroundColor: palette.accent }} className="w-3.5 h-3.5 rounded-full border border-slate-200" title="Accent" />
                            <span style={{ backgroundColor: palette.deep }} className="w-3.5 h-3.5 rounded-full border border-slate-200" title="Deep Background" />
                            <span style={{ backgroundColor: palette.light }} className="w-3.5 h-3.5 rounded-full border border-slate-200" title="Light Background" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-4"></div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Google Snippet Preview</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">How your page will display in search engines.</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-500 truncate">https://kt-website.builder</div>
                      <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer truncate">{settings.title || 'My Custom Website'}</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{settings.description || 'Add a meta description to see how your snippet preview renders here.'}</div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SEO Title</label>
                        <input
                          type="text"
                          value={settings.title}
                          onChange={(e) => updateSettings({ title: e.target.value })}
                          className="w-full text-xs p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-slate-100"
                          placeholder="Page Title"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meta Description</label>
                        <textarea
                          rows={3}
                          value={settings.description}
                          onChange={(e) => updateSettings({ description: e.target.value })}
                          className="w-full text-xs p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-slate-100 resize-none"
                          placeholder="Type page description here..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Favicon Icon URL</label>
                        <input
                          type="text"
                          value={settings.faviconUrl || ''}
                          onChange={(e) => updateSettings({ faviconUrl: e.target.value })}
                          className="w-full text-xs p-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-slate-100"
                          placeholder="/favicon.ico"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Central Canvas Workspace */}
        <main 
          className={`flex-1 flex justify-center items-start overflow-y-auto transition-all duration-300 ${
            isPreview && deviceMode === 'desktop' ? 'bg-brand-soft p-0' :
            isPreview ? 'bg-brand-ink p-12' : 'bg-brand-soft p-8'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragEnter={() => setIsDraggingOver(true)}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            handleDrop(e);
            setIsDraggingOver(false);
          }}
        >
          {/* Device Simulator Bezel Wrapper */}
          <div 
            style={{ 
              fontFamily: settings.fontFamily,
              transform: zoomMode === 'fit' ? 'scale(0.8)' : 'scale(1)',
              transformOrigin: 'top center',
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className={`bg-white transition-all duration-300 relative ${
              deviceMode === 'mobile' 
                ? 'w-[375px] min-h-[667px] border-[12px] border-slate-950 rounded-[40px] shadow-2xl my-8 mx-auto overflow-hidden' 
                : deviceMode === 'tablet' 
                ? 'w-[768px] min-h-[1024px] border-[16px] border-slate-950 rounded-[32px] shadow-2xl my-8 mx-auto overflow-hidden' 
                : 'w-full min-h-full shadow-sm border border-slate-200'
            }`}
          >
            {/* Phone Notch Simulator */}
            {deviceMode === 'mobile' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center gap-1.5 px-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
              </div>
            )}
            {blocks.length === 0 ? (
              /* Empty Canvas Container */
              <div className={`p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-transparent transition-all duration-300 ${isDraggingOver ? 'drag-over-pulse border-brand-accent rounded-xl' : ''}`}>
                <Layout className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600 text-sm">Your Canvas is Empty</p>
                <p className="text-xs max-w-xs mt-1">Drag and drop sections from the sidebar, or select presets to populate the builder canvas.</p>
              </div>
            ) : (
              /* Canvas Blocks List */
              <div className="flex flex-col w-full h-full">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    id={`block-${block.id}`}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative group transition-all duration-300 ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'} ${
                      !isPreview && selectedBlockId === block.id 
                        ? 'ring-2 ring-brand-accent ring-offset-2 shadow-lg scale-[1.002] z-10' 
                        : 'hover:shadow-sm hover:ring-1 hover:ring-brand-accent/50'
                    }`}
                  >
                    {/* Floating Controls */}
                    {!isPreview && (
                      <div className="absolute top-2 right-2 flex items-center bg-white border border-slate-200 rounded-lg shadow-md px-1 py-0.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, 'up');
                          }}
                          className="p-1 text-slate-500 hover:text-brand-primary hover:bg-slate-100 rounded transition-colors"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, 'down');
                          }}
                          className="p-1 text-slate-500 hover:text-brand-primary hover:bg-slate-100 rounded transition-colors"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block.id);
                          }}
                          className="p-1 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded transition-colors"
                          title="Delete Block"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    )}
                    <BlockRenderer 
                      block={block} 
                      isEditing={!isPreview} 
                      onContentChange={updateBlockContent}
                      selectedElement={selectedElement}
                      onSelectElement={(blockId, elementPath, elementType) => {
                        setSelectedElement({ blockId, elementPath, elementType });
                        setSelectedBlockId(blockId);
                        setActiveTab('inspector');
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Floating Preview Controls */}
      {isPreview && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl px-4 py-2 rounded-full z-50 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-full transition-all ${deviceMode === 'desktop' ? 'bg-brand-accent-bg text-brand-accent scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-full transition-all ${deviceMode === 'tablet' ? 'bg-brand-accent-bg text-brand-accent scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-full transition-all ${deviceMode === 'mobile' ? 'bg-brand-accent-bg text-brand-accent scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setIsPreview(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-accent px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
            title="Exit Preview"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            Exit Preview
          </button>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        blocks={blocks}
        settings={settings}
      />

      {/* Rich Text Inline Toolbar */}
      {!isPreview && <RichTextToolbar />}
    </div>
  );
}

export default App;
