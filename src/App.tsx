import { useState, useEffect } from 'react';
import { 
  Layout, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Plus,
  ChevronDown,
  EyeOff,
  Play,
  MousePointer2,
  Hash,
  Square,
  Type,
  Circle,
  Grid,
  Code2
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
    description: 'Corporate Hero, feature blocks, CTA callouts, and clean footer structures.',
    blockTypes: ['header', 'hero', 'features', 'cta', 'footer']
  },
  {
    name: 'Creative Portfolio Showcase',
    description: 'Clean showcase headers, designer grid panels, testimonial sliders, and simple footers.',
    blockTypes: ['header', 'hero', 'portfolio', 'testimonials', 'footer']
  },
  {
    name: 'E-Commerce Storefront',
    description: 'Product grids, pricing tables, collapsable FAQ lists, and newsletter signups.',
    blockTypes: ['header', 'hero', 'ecommerce', 'faq', 'footer']
  }
];

const COLOR_PALETTES = [
  { name: 'Modern Indigo (Default)', primary: '#4f46e5', accent: '#818cf8', deep: '#0f172a', light: '#f8fafc' },
  { name: 'Ocean Emerald', primary: '#059669', accent: '#34d399', deep: '#064e3b', light: '#ecfdf5' },
  { name: 'Royal Gold & Ink', primary: '#d97706', accent: '#fbbf24', deep: '#1e1b4b', light: '#fef3c7' },
  { name: 'Kawerify Tech Crimson', primary: '#e11d48', accent: '#fda4af', deep: '#111827', light: '#fff1f2' }
];

function App() {
  const [leftSidebarTab, setLeftSidebarTab] = useState<'layers' | 'assets'>('layers');
  const [toolbarActiveTool, setToolbarActiveTool] = useState<'pointer' | 'frame' | 'rectangle' | 'text' | 'ellipse'>('pointer');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{ blockId: string; elementPath: string; elementType: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [promptModal, setPromptModal] = useState<{ isOpen: boolean; title: string; defaultValue: string; onConfirm: (val: string) => void } | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, blockX: 0, blockY: 0 });

  const [formSubmissions, setFormSubmissions] = useState<Array<{ id: string; name: string; email: string; message: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem('kt-form-submissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', name: 'John Doe', email: 'john@example.com', message: 'Hello! I would love to build a landing page using your awesome builder.', date: '2026-08-25 10:24' }
    ];
  });
  
  useEffect(() => {
    localStorage.setItem('kt-form-submissions', JSON.stringify(formSubmissions));
  }, [formSubmissions]);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('kt-form-submissions');
        if (saved) setFormSubmissions(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('kt-submissions-updated', handleUpdate);
    return () => window.removeEventListener('kt-submissions-updated', handleUpdate);
  }, []);
  
  const {
    activeProject,
    pages,
    currentPageId,
    setCurrentPageId,
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
    addPage,
    deletePage,
    undo,
    redo
  } = useBuilderState();

  // Apply visual theme color palette
  const applyColorPalette = (palette: typeof COLOR_PALETTES[0]) => {
    const updatedBlocks = blocks.map((block) => {
      let bgColor = palette.light;
      let textColor = palette.deep;
      if (block.type === 'header' || block.type === 'footer') {
        bgColor = palette.deep;
        textColor = palette.light;
      } else if (block.type === 'hero' || block.type === 'cta') {
        bgColor = palette.primary;
        textColor = '#ffffff';
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
    setPages(pages.map(p => p.id === currentPageId ? { ...p, blocks: updatedBlocks } : p));
  };

  // Mouse down / Drag-to-move block handler (Figma Style absolute positioning)
  const handleBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
    if (isPreview) return;
    const target = e.target as HTMLElement;
    if (target.closest('[contenteditable="true"]') || target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return;
    }
    e.preventDefault();
    setSelectedBlockId(blockId);
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const element = document.getElementById(`block-${blockId}`);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    
    const currentLeft = Math.round((rect.left - parentRect.left) / (zoomLevel / 100));
    const currentTop = Math.round((rect.top - parentRect.top) / (zoomLevel / 100));
    const currentWidth = Math.round(rect.width / (zoomLevel / 100));
    const currentHeight = Math.round(rect.height / (zoomLevel / 100));
    
    const blockX = block.styles.x ? parseInt(block.styles.x, 10) : currentLeft;
    const blockY = block.styles.y ? parseInt(block.styles.y, 10) : currentTop;
    
    if (!block.styles.x || !block.styles.y) {
      updateBlockStyles(blockId, {
        x: `${blockX}px`,
        y: `${blockY}px`,
        width: `${currentWidth}px`,
        height: `${currentHeight}px`
      });
    }
    
    setDraggedBlockId(blockId);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      blockX,
      blockY
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedBlockId) return;
      
      const dx = Math.round((e.clientX - dragStart.mouseX) / (zoomLevel / 100));
      const dy = Math.round((e.clientY - dragStart.mouseY) / (zoomLevel / 100));
      
      const newX = dragStart.blockX + dx;
      const newY = dragStart.blockY + dy;
      
      updateBlockStyles(draggedBlockId, {
        x: `${newX}px`,
        y: `${newY}px`
      });
    };

    const handleMouseUp = () => {
      setDraggedBlockId(null);
    };

    if (draggedBlockId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedBlockId, dragStart, updateBlockStyles, zoomLevel]);







  // Keyboard Shortcuts for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmdKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (cmdKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Document Title update
  useEffect(() => {
    document.title = activeProject ? `${activeProject.name} | Editor` : 'SiteBuilder Dashboard';
  }, [activeProject]);

  // Centering viewport on mount & bind custom events
  useEffect(() => {
    const viewport = document.getElementById('workspace-viewport');
    if (viewport) {
      viewport.scrollLeft = 200;
      viewport.scrollTop = 200;
    }

    const handleExportTrigger = () => setIsExportOpen(true);
    window.addEventListener('kt-trigger-export', handleExportTrigger);
    return () => window.removeEventListener('kt-trigger-export', handleExportTrigger);
  }, []);

  // 2. FIGMA-STYLE EDITOR RENDERER
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#1E1E1E] text-slate-100 flex antialiased select-none font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      {!isPreview && (
        <aside className="w-60 bg-[#161616] border-r border-[#262626] flex flex-col h-full z-20 shrink-0 select-none text-slate-350 relative">
          
          {/* Project Header */}
          <div className="p-4 border-b border-[#262626] flex items-center justify-between">
            <div 
              onClick={() => alert('Figma File Menu:\n- File\n- Edit\n- View\n- Assets\n- Preferences\n- Help')}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-800/40 p-1 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 rounded bg-[#EA4C89] flex items-center justify-center text-white font-extrabold text-[10px]">
                F
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white tracking-wide truncate max-w-[120px]">
                  Kawerify Tech Documents
                </span>
                <span className="text-[9px] text-slate-500 font-bold">
                  Drafts
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Pages Manager */}
          <div className="p-4 border-b border-[#262626]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pages</span>
              <button
                onClick={() => {
                  setPromptModal({
                    isOpen: true,
                    title: 'Add New Page Frame',
                    defaultValue: `Frame ${pages.length + 1}`,
                    onConfirm: (name) => {
                      addPage(name);
                    }
                  });
                }}
                className="p-1 hover:bg-[#202020] rounded text-slate-400 hover:text-white cursor-pointer transition-colors"
                title="Add Page Frame"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-1">
              {pages.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => setCurrentPageId(p.id)}
                  className={`px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${p.id === currentPageId ? 'bg-[#333333] text-white font-bold' : 'hover:bg-[#202020] text-slate-450 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
                      <rect x="2" y="2" width="8" height="8" rx="1" />
                      <path d="M4 4h4M4 6h4" />
                    </svg>
                    <span>{p.name}</span>
                  </div>
                  {p.id !== 'home' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this page?')) {
                          deletePage(p.id);
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
                      title="Delete Page"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Layers Tree Outline */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Layers</span>
            </div>

            <div className="space-y-1 pt-2 flex-1 overflow-y-auto">
              {blocks.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">No layers loaded. Insert elements to start.</p>
              ) : (
                blocks.map((block) => {
                  const isSelected = block.id === selectedBlockId;
                  return (
                    <div key={block.id} className="space-y-1">
                      <div 
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`px-2 py-1 rounded-lg flex items-center justify-between text-[11px] cursor-pointer transition-colors ${isSelected ? 'bg-[#2563EB]/15 text-[#6C63FF] font-bold border border-[#2563EB]/10' : 'text-slate-400 hover:bg-[#202020] hover:text-slate-200'}`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-slate-600 font-bold font-mono">#</span>
                          <span className="truncate">{block.name}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="pl-6 border-l border-[#2d2d2d] ml-2 py-1 space-y-1">
                          <div 
                            onClick={(e) => { e.stopPropagation(); setSelectedElement({ blockId: block.id, elementPath: 'title', elementType: 'title' }); }}
                            className={`px-2 py-1 rounded text-[10px] cursor-pointer flex items-center gap-1.5 transition-colors ${selectedElement?.blockId === block.id && selectedElement?.elementPath === 'title' ? 'bg-[#2563EB]/25 text-[#818cf8] font-bold border border-[#2563EB]/25' : 'text-slate-450 hover:bg-[#202020]'}`}
                          >
                            <span className="text-slate-500 font-bold font-mono">T</span>
                            <span>Headline Title</span>
                          </div>
                          {block.content.subtitle && (
                            <div 
                              onClick={(e) => { e.stopPropagation(); setSelectedElement({ blockId: block.id, elementPath: 'subtitle', elementType: 'subtitle' }); }}
                              className={`px-2 py-1 rounded text-[10px] cursor-pointer flex items-center gap-1.5 transition-colors ${selectedElement?.blockId === block.id && selectedElement?.elementPath === 'subtitle' ? 'bg-[#2563EB]/25 text-[#818cf8] font-bold border border-[#2563EB]/25' : 'text-slate-455 hover:bg-[#202020]'}`}
                            >
                              <span className="text-slate-500 font-bold font-mono">T</span>
                              <span>Subheadline</span>
                            </div>
                          )}
                          {block.content.buttonText && (
                            <div 
                              onClick={(e) => { e.stopPropagation(); setSelectedElement({ blockId: block.id, elementPath: 'buttonText', elementType: 'button' }); }}
                              className={`px-2 py-1 rounded text-[10px] cursor-pointer flex items-center gap-1.5 transition-colors ${selectedElement?.blockId === block.id && selectedElement?.elementPath === 'buttonText' ? 'bg-[#2563EB]/25 text-[#818cf8] font-bold border border-[#2563EB]/25' : 'text-slate-455 hover:bg-[#202020]'}`}
                            >
                              <span>⊏⊐</span>
                              <span>Action Button</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Expandable Slide-out Assets Panel Overlay */}
          {leftSidebarTab === 'assets' && (
            <div className="absolute inset-y-0 left-0 w-60 bg-[#161616] border-r border-[#262626] flex flex-col h-full z-30 text-slate-350 p-4 space-y-6 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between border-b border-[#262626]/80 pb-3">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Library Components</span>
                <button 
                  onClick={() => setLeftSidebarTab('layers')}
                  className="text-[10px] text-slate-450 hover:text-white cursor-pointer px-2 py-1 bg-[#222222] hover:bg-[#2d2d2d] rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Insert Vector Shapes */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Insert Vector Shapes</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Wireframe Box', type: 'sandbox', styles: { bgColor: '#1e293b', borderRadius: 'rounded-none', borderWidth: 'border-2', borderColor: '#475569' } },
                    { name: 'Accent Pill', type: 'sandbox', styles: { bgColor: '#6c63ff', borderRadius: 'rounded-full' } }
                  ].map((shp, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        addBlock(shp.type as any, { title: shp.name }, shp.styles);
                        setLeftSidebarTab('layers');
                      }}
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-[10px] font-bold rounded-xl text-left cursor-pointer transition-colors"
                    >
                      {shp.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Presets List */}
              <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Section Presets</span>
                <div className="space-y-2">
                  {PAGE_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (window.confirm(`Overwriting active frame blocks with template settings. Proceed?`)) {
                          const newBlocks = tpl.blockTypes.map(type => {
                            const blockTpl = BLOCK_TEMPLATES.find(t => t.type === type);
                            return {
                              id: Math.random().toString(36).substring(2, 9),
                              type: type as BlockType,
                              name: type.charAt(0).toUpperCase() + type.slice(1) + ' Section',
                              content: blockTpl ? { ...blockTpl.defaultContent } : {},
                              styles: blockTpl ? { ...blockTpl.defaultStyles } : { bgColor: '#ffffff', textColor: '#07162f' }
                            };
                          });
                          setPages(pages.map(p => p.id === currentPageId ? { ...p, blocks: newBlocks } : p));
                          setSelectedBlockId(newBlocks[0]?.id || null);
                          setLeftSidebarTab('layers');
                        }
                      }}
                      className="w-full text-left p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500 transition-all flex flex-col gap-1 cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-100">{tpl.name}</span>
                      <span className="text-[9px] text-slate-500 leading-normal">{tpl.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* 2. CENTRAL WORKSPACE BOARD */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-[#1E1E1E]">
        {/* Top Canvas Ruler */}
        {!isPreview && (
          <div className="h-6 bg-[#161616] border-b border-[#262626] flex items-center relative overflow-hidden select-none z-10 text-slate-600 shrink-0">
            <div className="w-6 h-full bg-[#161616] border-r border-[#262626] sticky left-0 z-20 shrink-0"></div>
            <svg className="absolute inset-y-0 left-6 w-full h-full text-slate-700">
              <pattern id="ruler-h" width="50" height="24" patternUnits="userSpaceOnUse">
                <line x1="0" y1="12" x2="0" y2="24" stroke="currentColor" strokeWidth="1" />
                <line x1="10" y1="18" x2="10" y2="24" stroke="currentColor" strokeWidth="1" />
                <line x1="20" y1="18" x2="20" y2="24" stroke="currentColor" strokeWidth="1" />
                <line x1="30" y1="18" x2="30" y2="24" stroke="currentColor" strokeWidth="1" />
                <line x1="40" y1="18" x2="40" y2="24" stroke="currentColor" strokeWidth="1" />
                <text x="5" y="10" fontSize="8" fill="currentColor" fontFamily="monospace">50</text>
              </pattern>
              <rect width="100%" height="100%" fill="url(#ruler-h)" />
            </svg>
          </div>
        )}

        {/* Canvas Body Container */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Left Canvas Ruler */}
          {!isPreview && (
            <div className="w-6 bg-[#161616] border-r border-[#262626] relative overflow-hidden select-none z-10 text-slate-600 shrink-0">
              <svg className="absolute inset-x-0 top-0 w-full h-full text-slate-700">
                <pattern id="ruler-v" width="24" height="50" patternUnits="userSpaceOnUse">
                  <line x1="12" y1="0" x2="24" y2="0" stroke="currentColor" strokeWidth="1" />
                  <line x1="18" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="1" />
                  <line x1="18" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1" />
                  <line x1="18" y1="30" x2="24" y2="30" stroke="currentColor" strokeWidth="1" />
                  <line x1="18" y1="40" x2="24" y2="40" stroke="currentColor" strokeWidth="1" />
                  <text x="2" y="15" fontSize="8" fill="currentColor" fontFamily="monospace" transform="rotate(-90 2 15)">50</text>
                </pattern>
                <rect width="100%" height="100%" fill="url(#ruler-v)" />
              </svg>
            </div>
          )}

          {/* Workspace Viewport */}
          <main 
            id="workspace-viewport"
            className={`flex-1 overflow-auto transition-all duration-300 relative ${isPreview ? 'p-0 bg-white' : 'bg-[#1E1E1E]'}`}
            onDragOver={(e) => e.preventDefault()}
          >
            {!isPreview ? (
              /* FIGMA GIANT MULTI-FRAME CANVAS */
              <div 
                style={{ 
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  width: '8000px',
                  height: '4000px',
                  position: 'relative'
                }}
              >
                {/* Infinite gridlines pattern overlay */}
                <div className="absolute inset-0 bg-transparent opacity-[0.25] pointer-events-none select-none" style={{ backgroundImage: 'radial-gradient(#4d4d4d 1.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                
                {/* Map over all pages as side-by-side Frames */}
                {pages.map((page, pidx) => (
                  <div 
                    key={page.id} 
                    className="absolute flex flex-col select-none"
                    style={{ 
                      left: `${300 + pidx * 1700}px`, 
                      top: '300px',
                    }}
                  >
                    {/* Frame Title Tag */}
                    <div className="flex items-center justify-between mb-3 select-none">
                      <span 
                        onClick={() => setCurrentPageId(page.id)}
                        className={`text-sm font-extrabold cursor-pointer transition-colors ${page.id === currentPageId ? 'text-white' : 'text-slate-450 hover:text-slate-200'}`}
                      >
                        {page.name}
                      </span>
                      {page.id === currentPageId && (
                        <span className="text-[9px] px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-lg font-bold tracking-wider uppercase select-none">
                          Active Frame
                        </span>
                      )}
                    </div>
                    
                    {/* Device Frame Bezel */}
                    <div 
                      style={{ 
                        fontFamily: settings.fontFamily,
                        width: deviceMode === 'desktop' ? '1440px' : deviceMode === 'tablet' ? '768px' : '375px',
                        backgroundColor: '#ffffff',
                        boxShadow: page.id === currentPageId ? '0 0 0 4px #2563EB, 0 35px 70px -10px rgba(0,0,0,0.5)' : '0 20px 40px -10px rgba(0,0,0,0.35)',
                        minHeight: '1600px',
                        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease'
                      }}
                      className="bg-white relative overflow-hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPageId(page.id);
                      }}
                    >
                      {/* Phone Notch Simulator */}
                      {deviceMode === 'mobile' && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-955 rounded-full z-40 flex items-center justify-center gap-1.5 px-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                          <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
                        </div>
                      )}

                      {page.blocks.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-slate-250 bg-white">
                          <Layout className="w-12 h-12 text-slate-300 mb-3" />
                          <p className="font-bold text-slate-700 text-sm">Empty Page Frame</p>
                          <p className="text-xs max-w-xs mt-1 leading-normal text-slate-400">Select this Frame and click components in the bottom resources toolbar to insert them.</p>
                        </div>
                      ) : (
                        <div className="relative w-full min-h-[1400px]">
                          {page.blocks.map((block) => {
                            const isAbsolute = !!(block.styles.x || block.styles.y);
                            const isSelected = page.id === currentPageId && block.id === selectedBlockId;
                            return (
                              <div 
                                key={block.id} 
                                id={`block-${block.id}`}
                                onMouseDown={(e) => {
                                  if (page.id !== currentPageId) setCurrentPageId(page.id);
                                  handleBlockMouseDown(e, block.id);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentPageId(page.id);
                                  setSelectedBlockId(block.id);
                                }}
                                style={{
                                  position: isAbsolute ? 'absolute' : 'relative',
                                  left: isAbsolute ? block.styles.x : undefined,
                                  top: isAbsolute ? block.styles.y : undefined,
                                  width: isAbsolute ? block.styles.width : '100%',
                                  height: isAbsolute ? block.styles.height : 'auto',
                                  transform: block.styles.rotation ? `rotate(${block.styles.rotation})` : undefined,
                                  zIndex: isSelected ? 20 : 10
                                }}
                                className={`group/block select-none ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                              >
                                <BlockRenderer 
                                  block={block}
                                  isEditing={true}
                                  onContentChange={updateBlockContent}
                                  selectedElement={page.id === currentPageId ? selectedElement : null}
                                  onSelectElement={(blockId, path, type) => {
                                    setCurrentPageId(page.id);
                                    setSelectedBlockId(blockId);
                                    setSelectedElement({ blockId, elementPath: path, elementType: type });
                                  }}
                                />

                                {/* Section Action Context Controllers */}
                                {isSelected && (
                                  <div className="absolute right-4 top-4 bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 shadow-xl flex items-center gap-2 z-30 scale-95 opacity-0 group-hover/block:opacity-100 group-hover/block:scale-100 transition-all">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-800 rounded">{block.name}</span>
                                    <div className="w-px h-3 bg-slate-800" />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                                      title="Move Up"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                                      title="Move Down"
                                    >
                                      ▼
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                                      className="p-1 hover:bg-red-950 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                                      title="Delete Block"
                                    >
                                      🗑
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* PURE PREVIEW SCREEN (Simulating Full Website View) */
              <div className="w-full min-h-screen bg-white">
                {blocks.map((block) => (
                  <BlockRenderer 
                    key={block.id}
                    block={block}
                    isEditing={false}
                    onContentChange={updateBlockContent}
                  />
                ))}
              </div>
            )}
          </main>

          {/* FIGMA FLOATING TOOLBAR */}
          {!isPreview && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2c2c2c] border border-[#3c3c3c] rounded-2xl py-2 px-3.5 shadow-2xl flex items-center gap-1.5 z-40 text-white select-none">
              <button 
                onClick={() => setToolbarActiveTool('pointer')}
                className={`p-2 rounded-xl cursor-pointer transition-colors ${toolbarActiveTool === 'pointer' ? 'bg-[#3c3c3c] text-blue-400' : 'text-slate-300 hover:bg-[#3c3c3c]'}`}
                title="Select Tool"
              >
                <MousePointer2 className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => {
                  setToolbarActiveTool('frame');
                  setPromptModal({
                    isOpen: true,
                    title: 'Add Frame / Page',
                    defaultValue: `Frame ${pages.length + 1}`,
                    onConfirm: (name) => {
                      addPage(name);
                      setToolbarActiveTool('pointer');
                    }
                  });
                }}
                className={`p-2 rounded-xl cursor-pointer transition-colors ${toolbarActiveTool === 'frame' ? 'bg-[#3c3c3c] text-blue-400' : 'text-slate-300 hover:bg-[#3c3c3c]'}`}
                title="Add Page Frame"
              >
                <Hash className="w-4 h-4" />
              </button>

              <button 
                onClick={() => {
                  setToolbarActiveTool('rectangle');
                  addBlock('sandbox', { title: 'Wireframe Box' }, { bgColor: '#475569', borderRadius: 'rounded-none' });
                  setToolbarActiveTool('pointer');
                }}
                className={`p-2 rounded-xl cursor-pointer transition-colors ${toolbarActiveTool === 'rectangle' ? 'bg-[#3c3c3c] text-blue-400' : 'text-slate-300 hover:bg-[#3c3c3c]'}`}
                title="Rectangle Tool"
              >
                <Square className="w-4 h-4" />
              </button>

              <button 
                onClick={() => {
                  setToolbarActiveTool('text');
                  addBlock('sandbox', { title: 'T Text Element' }, { bgColor: 'transparent', textColor: '#000000' });
                  setToolbarActiveTool('pointer');
                }}
                className={`p-2 rounded-xl cursor-pointer transition-colors ${toolbarActiveTool === 'text' ? 'bg-[#3c3c3c] text-blue-400' : 'text-slate-300 hover:bg-[#3c3c3c]'}`}
                title="Text Tool"
              >
                <Type className="w-4 h-4" />
              </button>

              <button 
                onClick={() => {
                  setToolbarActiveTool('ellipse');
                  addBlock('sandbox', { title: 'Accent Pill' }, { bgColor: '#6c63ff', borderRadius: 'rounded-full' });
                  setToolbarActiveTool('pointer');
                }}
                className={`p-2 rounded-xl cursor-pointer transition-colors ${toolbarActiveTool === 'ellipse' ? 'bg-[#3c3c3c] text-blue-400' : 'text-slate-300 hover:bg-[#3c3c3c]'}`}
                title="Circle Tool"
              >
                <Circle className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-[#3c3c3c] mx-1" />

              <button 
                onClick={() => {
                  setLeftSidebarTab('assets');
                }}
                className={`p-2 rounded-xl cursor-pointer transition-colors ${leftSidebarTab === 'assets' ? 'bg-[#3c3c3c] text-blue-400' : 'text-slate-300 hover:bg-[#3c3c3c]'}`}
                title="Resources Presets"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button 
                onClick={() => {
                  setIsExportOpen(true);
                }}
                className="p-2 rounded-xl text-slate-300 hover:bg-[#3c3c3c] cursor-pointer transition-colors"
                title="Export HTML/CSS Code"
              >
                <Code2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Floating Zoom Control Slider */}
          {!isPreview && (
            <div className="absolute bottom-6 right-6 bg-[#161616] border border-[#262626] px-4 py-2 rounded-2xl flex items-center gap-3.5 shadow-2xl z-30 select-none text-slate-350 text-xs font-bold">
              <span className="text-[10px] font-bold text-slate-450">Zoom</span>
              <input 
                type="range" 
                min="0" 
                max="125" 
                value={zoomLevel} 
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-24 accent-indigo-500 cursor-pointer" 
              />
              <span className="w-8 text-right font-mono text-[10px]">{zoomLevel}%</span>
              <div className="w-px h-3 bg-slate-700" />
              <button 
                onClick={() => setZoomLevel(100)} 
                className="hover:text-white text-[10px] cursor-pointer"
              >
                Fit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. FIGMA-STYLE RIGHT SIDEBAR */}
      {!isPreview && (
        <aside className="w-64 bg-[#181818] border-l border-[#262626] flex flex-col h-full z-20 shrink-0 select-none">
          {/* Right Header */}
          <div className="p-4 border-b border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs select-none">
                T
              </button>
              <div className="flex bg-[#222222] p-0.5 rounded-lg border border-[#2d2d2d]">
                <button className="px-2.5 py-1 text-[10px] font-bold rounded bg-[#333333] text-white shadow">
                  Design
                </button>
                <button 
                  onClick={() => alert('Prototype mode is enabled! Drag links between artboard page frames.')}
                  className="px-2.5 py-1 text-[10px] font-bold rounded text-slate-450 hover:text-white cursor-pointer"
                >
                  Prototype
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsPreview(true)}
                className="p-1.5 hover:bg-[#222222] rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Present Simulation"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Design workspace link copied to clipboard! Share it with your team.');
                }}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow"
              >
                Share
              </button>
            </div>
          </div>

          {/* Right Inspector contents */}
          <div className="flex-1 overflow-y-auto">
            <Inspector 
              selectedBlock={blocks.find(b => b.id === selectedBlockId)}
              onUpdateStyles={updateBlockStyles}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateBlockContent={updateBlockContent}
              applyColorPalette={applyColorPalette}
              colorPalettes={COLOR_PALETTES}
              settings={settings}
              onUpdateSettings={updateSettings}
            />
          </div>
        </aside>
      )}

      {/* Floating Preview Device Toggle */}
      {isPreview && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-2xl flex items-center gap-4 px-4 py-2 z-50">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-full transition-all ${deviceMode === 'desktop' ? 'bg-[#6C63FF]/15 text-[#6C63FF] scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-full transition-all ${deviceMode === 'tablet' ? 'bg-[#6C63FF]/15 text-[#6C63FF] scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-full transition-all ${deviceMode === 'mobile' ? 'bg-[#6C63FF]/15 text-[#6C63FF] scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
          <button
            onClick={() => setIsPreview(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#6C63FF] cursor-pointer"
          >
            <EyeOff className="w-4 h-4" />
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

      {/* Prompt Modal Dialog */}
      {promptModal && promptModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-150">
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-sm text-white">{promptModal.title}</h3>
            <input
              type="text"
              defaultValue={promptModal.defaultValue}
              id="prompt-modal-input"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#6C63FF]"
              placeholder="Name..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (document.getElementById('prompt-modal-input') as HTMLInputElement)?.value;
                  if (val) {
                    promptModal.onConfirm(val);
                    setPromptModal(null);
                  }
                }
              }}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPromptModal(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-350 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = (document.getElementById('prompt-modal-input') as HTMLInputElement)?.value;
                  if (val) {
                    promptModal.onConfirm(val);
                    setPromptModal(null);
                  }
                }}
                className="px-4 py-1.5 bg-[#6C63FF] hover:bg-[#5b52e0] text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
