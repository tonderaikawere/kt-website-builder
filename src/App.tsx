import { useState, useEffect } from 'react';
import { 
  Layout, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Plus,
  Undo,
  Redo,
  Image,
  Search,
  ChevronDown,
  EyeOff,
  Home,
  Edit3,
  Database,
  Folder,
  Settings,
  LogOut,
  Play,
  UserPlus
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
  const [activeTab, setActiveTab] = useState<'blocks' | 'inspector' | 'templates' | 'css' | 'seo' | 'assets'>('blocks');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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







  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as BlockType;
    if (type) addBlock(type);
  };

  // Document Title update
  useEffect(() => {
    document.title = activeProject ? `${activeProject.name} | Editor` : 'SiteBuilder Dashboard';
  }, [activeProject]);

  // 2. FIGMA-STYLE EDITOR RENDERER
  return (
    <div className="min-h-screen bg-[#111111] text-slate-100 flex flex-col antialiased select-none font-sans">
      
      {/* Top Header Bar */}
      {!isPreview && (
        <header className="h-14 px-6 bg-[#161616] border-b border-[#262626] flex items-center justify-between z-20 select-none text-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-white tracking-wide">
              Rumah Ria <span className="text-slate-500 font-normal">/ rumahria.com</span>
            </span>
            <span className="text-[9px] text-[#4285f4] bg-[#4285f4]/10 font-bold px-1.5 py-0.5 rounded border border-[#4285f4]/20 uppercase">
              PRO
            </span>
          </div>

          {/* Center controls: Device toggles & Custom dimension pixel boxes */}
          <div className="flex items-center gap-4">
            <div className="flex bg-[#222222] p-1 rounded-xl border border-[#2d2d2d] gap-1">
              <button 
                onClick={() => setDeviceMode('desktop')} 
                className={`p-1.5 rounded-lg cursor-pointer ${deviceMode === 'desktop' ? 'bg-[#333333] text-white shadow' : 'text-slate-500 hover:text-slate-350'}`}
                title="Desktop View (1440px)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setDeviceMode('tablet')} 
                className={`p-1.5 rounded-lg cursor-pointer ${deviceMode === 'tablet' ? 'bg-[#333333] text-white shadow' : 'text-slate-500 hover:text-slate-350'}`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setDeviceMode('mobile')} 
                className={`p-1.5 rounded-lg cursor-pointer ${deviceMode === 'mobile' ? 'bg-[#333333] text-white shadow' : 'text-slate-500 hover:text-slate-350'}`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="bg-[#222222] border border-[#2d2d2d] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="font-bold">W</span>
              <input 
                type="text" 
                value={deviceMode === 'desktop' ? '1440' : deviceMode === 'tablet' ? '768' : '375'} 
                readOnly
                className="w-8 bg-transparent border-none text-right font-bold text-white focus:outline-none p-0" 
              />
              <span>px</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 bg-[#222222] p-0.5 rounded-lg border border-[#2d2d2d]">
              <button
                onClick={undo}
                className="p-1 hover:bg-[#2d2d2d] rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Undo last change"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                className="p-1 hover:bg-[#2d2d2d] rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Redo next change"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collab user mock */}
            <button className="p-2 rounded-xl text-slate-450 hover:text-white hover:bg-slate-805 transition-colors cursor-pointer" title="Collab share">
              <UserPlus className="w-3.5 h-3.5" />
            </button>

            {/* Preview toggle */}
            <button
              onClick={() => setIsPreview(true)}
              className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1.5 hover:bg-slate-805 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-slate-450" />
              <span>Preview</span>
            </button>

            {/* Publish HTML output */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Publish
            </button>
          </div>
        </header>
      )}

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Leftmost Side Dock - Icon Sidebar */}
        {!isPreview && (
          <aside className="w-14 bg-[#0c0c0c] border-r border-[#262626] flex flex-col items-center py-4 justify-between z-30 shrink-0 select-none">
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Logo container */}
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-xs shadow-lg cursor-pointer">
                R
              </div>
              
              <div className="w-full flex flex-col items-center gap-1.5 px-2">
                <button 
                  className="p-2 rounded-xl text-slate-450 hover:text-white hover:bg-[#202020] transition-colors w-full flex justify-center cursor-pointer"
                  title="Dashboard"
                >
                  <Home className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('templates')}
                  className={`p-2 rounded-xl w-full flex justify-center cursor-pointer ${activeTab === 'templates' ? 'bg-[#222222] text-[#2563EB] border border-[#2d2d2d]' : 'text-slate-450 hover:text-white hover:bg-[#202020]'}`}
                  title="Insert Section Presets"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('inspector')}
                  className={`p-2 rounded-xl w-full flex justify-center cursor-pointer ${activeTab === 'inspector' ? 'bg-[#222222] text-[#2563EB] border border-[#2d2d2d]' : 'text-slate-450 hover:text-white hover:bg-[#202020]'}`}
                  title="Design Canvas Editor"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('blocks')}
                  className={`p-2 rounded-xl w-full flex justify-center cursor-pointer ${activeTab === 'blocks' ? 'bg-[#222222] text-white' : 'text-slate-455 hover:text-white hover:bg-[#202020]'}`}
                  title="Palette Themes"
                >
                  <Database className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('templates')}
                  className={`p-2 rounded-xl w-full flex justify-center cursor-pointer ${activeTab === 'templates' ? 'bg-[#222222] text-white' : 'text-slate-455 hover:text-white hover:bg-[#202020]'}`}
                  title="Presets"
                >
                  <Folder className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('assets')}
                  className={`p-2 rounded-xl w-full flex justify-center cursor-pointer ${activeTab === 'assets' ? 'bg-[#222222] text-white' : 'text-slate-455 hover:text-white hover:bg-[#202020]'}`}
                  title="Assets"
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 w-full px-2">
              <button className="p-2 rounded-xl text-slate-455 hover:text-white hover:bg-[#202020] transition-colors w-full flex justify-center cursor-pointer" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded-xl text-slate-455 hover:text-red-400 hover:bg-[#202020] transition-colors w-full flex justify-center cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

        {/* Left Sidebar - Pages & Layers Panel */}
        {!isPreview && (
          <aside className="w-60 bg-[#161616] border-r border-[#262626] flex flex-col h-full z-10 select-none text-slate-300">
            {/* Pages Manager Container */}
            <div className="p-4 border-b border-[#262626] space-y-4">
              <div className="flex bg-[#222222] p-1 rounded-xl border border-[#2d2d2d]">
                <button className="flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wide bg-[#333333] text-white shadow">
                  Pages
                </button>
                <button className="flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wide text-slate-400 hover:text-white">
                  Components
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pages</span>
                  <button
                    onClick={() => {
                      setPromptModal({
                        isOpen: true,
                        title: 'Add New Page',
                        defaultValue: 'New Page',
                        onConfirm: (name) => {
                          addPage(name);
                        }
                      });
                    }}
                    className="p-1 hover:bg-[#202020] rounded text-slate-450 hover:text-white cursor-pointer transition-colors"
                    title="Add Page"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  {pages.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => setCurrentPageId(p.id)}
                      className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${p.id === currentPageId ? 'bg-[#333333] text-white border border-[#3e3e3e]' : 'hover:bg-[#202020] text-slate-400 hover:text-slate-200'}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
                        <rect x="2" y="2" width="8" height="8" rx="1" />
                        <path d="M4 4h4M4 6h4" />
                      </svg>
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Layers Outline List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Layers</span>
                <button className="p-1 hover:bg-[#202020] rounded text-slate-455 hover:text-white cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search layers input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search layers..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#222222] border border-[#2d2d2d] rounded-xl text-[10px] text-white focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Layer Tree */}
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
                          className={`px-2 py-1.5 rounded-lg flex items-center justify-between text-[11px] cursor-pointer transition-colors ${isSelected ? 'bg-[#2563EB]/10 text-[#6C63FF] border border-[#2563EB]/25 font-bold' : 'text-slate-400 hover:bg-[#202020] hover:text-slate-200'}`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500 shrink-0">
                              <rect x="2" y="2" width="8" height="8" rx="0.5" />
                            </svg>
                            <span className="truncate">{block.name}</span>
                          </div>
                        </div>

                        {/* Indented element child nodes (Double Click editable nodes) */}
                        {isSelected && (
                          <div className="pl-6 border-l border-[#2d2d2d] ml-3.5 py-1 space-y-1">
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
          </aside>
        )}

        {/* Central Workspace Board */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#0f172a]">
          {/* Top Canvas Ruler */}
          {!isPreview && (
            <div className="h-6 bg-[#1e293b] border-b border-slate-800 flex items-center relative overflow-hidden select-none z-10 text-slate-500">
              <div className="w-6 h-full bg-slate-900 border-r border-slate-800 sticky left-0 z-20 shrink-0"></div>
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

          {/* Canvas Wrapper */}
          <div className="flex-1 flex relative overflow-hidden">
            {/* Left Canvas Ruler */}
            {!isPreview && (
              <div className="w-6 bg-[#1e293b] border-r border-slate-800 relative overflow-hidden select-none z-10 text-slate-500 shrink-0">
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

            {/* Central Simulator Bezel Container */}
            <main 
              className={`flex-1 flex justify-center items-start overflow-y-auto transition-all duration-300 relative ${isPreview ? 'p-0 bg-white' : 'p-12'}`}
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
              {/* Infinite gridlines pattern overlay */}
              {!isPreview && (
                <div className="absolute inset-0 bg-[#0f172a] opacity-[0.25] pointer-events-none select-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              )}

              {/* Central canvas bezel scaled by zoomLevel */}
              <div 
                style={{ 
                  fontFamily: settings.fontFamily,
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className={`bg-white transition-all duration-300 relative ${
                  isPreview ? 'w-full min-h-screen' :
                  deviceMode === 'mobile' 
                    ? 'w-[375px] min-h-[667px] border-[12px] border-slate-950 rounded-[40px] shadow-2xl my-8 mx-auto overflow-hidden' 
                    : deviceMode === 'tablet' 
                    ? 'w-[768px] min-h-[1024px] border-[16px] border-slate-950 rounded-[32px] shadow-2xl my-8 mx-auto overflow-hidden' 
                    : 'w-[1100px] min-h-[90%] shadow-sm border border-slate-800/80 rounded-lg'
                }`}
              >
                {/* Phone Notch Simulator */}
                {!isPreview && deviceMode === 'mobile' && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center gap-1.5 px-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                    <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
                  </div>
                )}
                


                {blocks.length === 0 ? (
                  /* Empty Canvas Container */
                  <div className={`p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-transparent transition-all duration-300 ${isDraggingOver ? 'drag-over-pulse border-[#6C63FF] rounded-xl' : ''}`}>
                    <Layout className="w-12 h-12 text-slate-350 mb-3" />
                    <p className="font-bold text-slate-800 text-sm">Design Canvas is Empty</p>
                    <p className="text-xs max-w-xs mt-1 leading-normal text-slate-500">Click the '+' icon on the side dock to insert new section presets or shapes.</p>
                  </div>
                ) : (
                  /* Canvas Blocks List (Absolute Layout Container) */
                  <div className="relative w-full min-h-[1400px]">
                    {blocks.map((block) => {
                      const isAbsolute = !!(block.styles.x || block.styles.y);
                      return (
                        <div 
                          key={block.id} 
                          id={`block-${block.id}`}
                          onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
                          onClick={(e) => {
                            if (isPreview) return;
                            e.stopPropagation();
                            setSelectedBlockId(block.id);
                            setActiveTab('inspector');
                          }}
                          style={{
                            position: isAbsolute ? 'absolute' : 'relative',
                            left: isAbsolute ? block.styles.x : undefined,
                            top: isAbsolute ? block.styles.y : undefined,
                            width: isAbsolute ? block.styles.width : '100%',
                            height: isAbsolute ? block.styles.height : 'auto',
                            transform: block.styles.rotation ? `rotate(${block.styles.rotation})` : undefined,
                            zIndex: selectedBlockId === block.id ? 20 : 10
                          }}
                          className={`group/block select-none ${!isPreview && block.id === selectedBlockId ? 'ring-2 ring-[#6C63FF] ring-offset-2' : ''}`}
                        >
                          <BlockRenderer 
                            block={block}
                            isEditing={!isPreview}
                            onContentChange={updateBlockContent}
                            selectedElement={selectedElement}
                            onSelectElement={(blockId, path, type) => {
                              setSelectedElement({ blockId, elementPath: path, elementType: type });
                              setActiveTab('inspector');
                            }}
                          />

                          {/* Section Actions context menu */}
                          {!isPreview && block.id === selectedBlockId && (
                            <div className="absolute right-4 top-4 bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 shadow-xl flex items-center gap-2 z-30 scale-95 opacity-0 group-hover/block:opacity-100 group-hover/block:scale-100 transition-all">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-800 rounded">{block.name}</span>
                              <div className="w-px h-3 bg-slate-800" />
                              <button
                                onClick={() => moveBlock(block.id, 'up')}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => moveBlock(block.id, 'down')}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                title="Move Down"
                              >
                                ▼
                              </button>
                              <button
                                onClick={() => deleteBlock(block.id)}
                                className="p-1 hover:bg-red-950 rounded text-slate-400 hover:text-red-500"
                                title="Delete"
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
            </main>

            {/* Floating Zoom Control Slider */}
            {!isPreview && (
              <div className="absolute bottom-6 right-6 bg-[#1e293b] border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3.5 shadow-2xl z-30 select-none text-slate-350 text-xs font-bold">
                <span className="text-[10px] font-bold text-slate-400">Zoom</span>
                <input 
                  type="range" 
                  min="50" 
                  max="125" 
                  value={zoomLevel} 
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="w-24 accent-[#6C63FF] cursor-pointer" 
                />
                <span className="w-8 text-right font-mono text-[10px]">{zoomLevel}%</span>
                <div className="w-px h-3 bg-slate-700" />
                <button 
                  onClick={() => setZoomLevel(100)} 
                  className="hover:text-white text-[10px]"
                >
                  Fit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties Inspector */}
        {!isPreview && (
          <aside className="w-64 bg-[#181818] border-l border-[#262626] flex flex-col h-full z-10 select-none">
            {/* Sidebar Inspect Content Panel */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'blocks' && (
                <div className="p-4 space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Palette Themes</span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {COLOR_PALETTES.map(palette => (
                      <button
                        key={palette.name}
                        onClick={() => applyColorPalette(palette)}
                        className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-[#6C63FF] text-left transition-all cursor-pointer"
                      >
                        <span className="text-[11px] font-semibold text-slate-300">{palette.name}</span>
                        <div className="flex gap-1">
                          <span style={{ backgroundColor: palette.primary }} className="w-3 h-3 rounded-full border border-slate-700" />
                          <span style={{ backgroundColor: palette.accent }} className="w-3 h-3 rounded-full border border-slate-700" />
                          <span style={{ backgroundColor: palette.deep }} className="w-3 h-3 rounded-full border border-slate-700" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'inspector' && (
                <Inspector 
                  selectedBlock={blocks.find(b => b.id === selectedBlockId)}
                  onUpdateStyles={updateBlockStyles}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  onUpdateBlockContent={updateBlockContent}
                />
              )}

              {activeTab === 'templates' && (
                <div className="p-4 space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Section Presets</span>
                  <div className="space-y-2">
                    {PAGE_TEMPLATES.map((tpl, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (window.confirm(`Overwriting active page blocks with template settings. Proceed?`)) {
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
                          }
                        }}
                        className="w-full text-left p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-[#6C63FF] transition-all flex flex-col gap-1 cursor-pointer"
                      >
                        <span className="text-xs font-bold text-slate-100">{tpl.name}</span>
                        <span className="text-[9px] text-slate-500 leading-normal">{tpl.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="p-4 space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Insert Vector Shapes</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Wireframe Box', type: 'sandbox', styles: { bgColor: '#1e293b', borderRadius: 'rounded-none', borderWidth: 'border-2', borderColor: '#475569' } },
                      { name: 'Accent Pill', type: 'sandbox', styles: { bgColor: '#6c63ff', borderRadius: 'rounded-full' } }
                    ].map((shp, i) => (
                      <button
                        key={i}
                        onClick={() => addBlock(shp.type as any, { title: shp.name }, shp.styles)}
                        className="p-3 bg-slate-900 border border-slate-850 hover:border-[#6C63FF] text-[10px] font-bold rounded-xl text-left cursor-pointer transition-colors"
                      >
                        {shp.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

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
