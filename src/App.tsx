import { useState, useEffect } from 'react';
import { 
  Layout, 
  Layers, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Upload, 
  Download,
  Plus,
  Trash2,
  Undo,
  Redo,
  Grid,
  Image,
  Search,
  Copy,
  Sliders,
  ArrowLeft,
  ChevronRight,
  EyeOff
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'blocks' | 'inspector' | 'templates' | 'css' | 'seo' | 'assets'>('blocks');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{ blockId: string; elementPath: string; elementType: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGridLines, setShowGridLines] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'shape' | 'text' | 'media'>('select');

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
    projects,
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
    duplicatePage,
    deletePage,
    createProject,
    deleteProject,
    duplicateProject,
    loadProject,
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

  // Export JSON
  const exportProjectJson = () => {
    if (!activeProject) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeProject.name.toLowerCase().replace(/\s+/g, '-')}-project.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.name && Array.isArray(data.pages)) {
          const id = createProject(data.name);
          loadProject(id);
          setPages(data.pages);
          if (data.settings) updateSettings(data.settings);
          alert('Project imported successfully!');
          setCurrentView('editor');
        } else {
          alert('Invalid file structure. Must be a multi-page site project.');
        }
      } catch (err) {
        alert('Invalid project JSON file!');
      }
    };
    reader.readAsText(file);
  };



  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as BlockType;
    if (type) addBlock(type);
  };

  // Document Title update
  useEffect(() => {
    document.title = activeProject ? `${activeProject.name} | Editor` : 'SiteBuilder Dashboard';
  }, [activeProject]);

  // 1. DASHBOARD PORTAL RENDERING
  if (currentView === 'dashboard') {
    const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col antialiased">
        {/* Navigation Header */}
        <header className="h-16 px-8 border-b border-slate-800 bg-[#1e293b] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#6C63FF]/30">
              S
            </div>
            <span className="font-extrabold tracking-tight text-md bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-350">
              SiteBuilder
            </span>
            <span className="text-[10px] bg-[#6C63FF]/20 text-[#818cf8] font-bold px-2 py-0.5 rounded-full border border-[#6C63FF]/30 uppercase tracking-wide">
              Kawerify Tech Edition
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-150 focus:outline-none focus:border-[#6C63FF] transition-all"
              />
            </div>
            <button 
              onClick={() => {
                const name = window.prompt('Enter new site name:');
                if (name) {
                  const id = createProject(name);
                  loadProject(id);
                  setCurrentView('editor');
                }
              }}
              className="px-4 py-2 bg-[#6C63FF] hover:bg-[#5b52e0] text-white text-xs font-bold rounded-xl shadow-md shadow-[#6C63FF]/20 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Site
            </button>
            <input 
              type="file" 
              id="dash-import" 
              accept=".json" 
              onChange={handleJsonImport} 
              className="hidden" 
            />
            <button
              onClick={() => document.getElementById('dash-import')?.click()}
              className="px-3.5 py-2 bg-[#1e293b] hover:bg-slate-800 border border-slate-700 hover:border-slate-650 text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>
          </div>
        </header>

        {/* Hero Welcome Section */}
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-10 overflow-y-auto">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#131a31] to-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-[#6C63FF] opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="space-y-2 relative">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Design with Complete Freedom
              </h1>
              <p className="text-slate-400 text-xs md:text-sm max-w-xl leading-relaxed">
                Combine the modular power of Wix, canvas grids of Figma, and simple templates of Canva to build pixel-perfect interfaces with zero restrictions.
              </p>
            </div>
            <div className="flex gap-3 relative shrink-0">
              <button 
                onClick={() => {
                  const id = createProject('My Blank Site');
                  loadProject(id);
                  setCurrentView('editor');
                }}
                className="px-5 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Create Blank Canvas
              </button>
            </div>
          </div>

          {/* Explore Design Templates */}
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Explore Design Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Creative Portfolio', desc: 'Sleek developer portfolio grid layouts with design sandboxes.', type: 'portfolio', img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600', color: 'from-pink-500 to-[#6C63FF]' },
                { name: 'Brand Storefront', desc: 'Product lists, prices, collapsable FAQ lists, and carts.', type: 'ecommerce', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600', color: 'from-[#6C63FF] to-blue-500' }
              ].map((tpl, i) => (
                <div key={i} className="group bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-[#6C63FF]/50 transition-all flex flex-col">
                  <div className="aspect-[16/10] bg-slate-950 relative overflow-hidden">
                    <img src={tpl.img} alt={tpl.name} className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-4">
                      <span className={`text-[10px] font-black uppercase text-white px-2 py-0.5 rounded bg-gradient-to-r ${tpl.color}`}>
                        {tpl.name} Preset
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-sm mb-1">{tpl.name}</h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed mb-4 flex-1">{tpl.desc}</p>
                    <button 
                      onClick={() => {
                        const id = createProject(tpl.name, tpl.type);
                        loadProject(id);
                        setCurrentView('editor');
                      }}
                      className="w-full py-2.5 bg-[#6C63FF]/10 group-hover:bg-[#6C63FF] text-[#818cf8] group-hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:border-[#6C63FF]/50 transition-all group">
                <Plus className="w-8 h-8 text-slate-500 mb-2 group-hover:text-[#6C63FF] transition-colors" />
                <h3 className="text-white font-bold text-sm">Blank Wireframe</h3>
                <p className="text-slate-500 text-[11px] max-w-[200px] mt-1 leading-normal">Start completely from scratch with a blank page grid.</p>
                <button
                  onClick={() => {
                    const id = createProject('Untitled Project');
                    loadProject(id);
                    setCurrentView('editor');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-350 text-xs font-bold rounded-xl hover:bg-slate-850 cursor-pointer"
                >
                  Start Canvas
                </button>
              </div>
            </div>
          </div>

          {/* All Saved Projects */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Your Projects ({projects.length})</h2>
            {filteredProjects.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col items-center">
                <p className="text-slate-400 text-xs font-bold">No projects matched your search.</p>
                <p className="text-slate-500 text-[11px] mt-1">Try another keyword or create a new project above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((proj) => (
                  <div key={proj.id} className="p-5 bg-slate-900 border border-slate-805 rounded-2xl hover:border-slate-700 transition-all flex flex-col space-y-4 relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-white text-sm truncate max-w-[180px]">{proj.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{proj.pages.length} {proj.pages.length === 1 ? 'page' : 'pages'}</span>
                          <span>•</span>
                          <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => duplicateProject(proj.id)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete project permanently?')) {
                              deleteProject(proj.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-950 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <button 
                        onClick={() => {
                          loadProject(proj.id);
                          setCurrentView('editor');
                        }}
                        className="px-3.5 py-1.5 bg-[#6C63FF] hover:bg-[#5b52e0] text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                      >
                        Edit Design <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // 2. FIGMA-STYLE EDITOR RENDERER
  return (
    <div className="min-h-screen bg-slate-50 text-slate-905 flex flex-col antialiased select-none font-sans">
      
      {/* Top Header Bar */}
      {!isPreview && (
        <header className="h-14 px-6 bg-[#1e293b] border-b border-slate-800 flex items-center justify-between z-20 select-none text-slate-100">
          <div className="flex items-center gap-4">
            {/* Back to Dashboard Arrow */}
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="Return to projects dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="w-px h-4 bg-slate-700" />
            <span className="text-[11px] font-extrabold uppercase text-[#6C63FF]">{activeProject?.name || 'My Site'}</span>
            <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded">Draft</span>
          </div>

          {/* Tools Row (Figma Style) */}
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-800 shadow-inner">
            {[
              { id: 'select', name: 'Select Pointer', label: 'Select' },
              { id: 'shape', name: 'Insert Vector Shapes', label: 'Shapes' },
              { id: 'text', name: 'Add Heading & Paragraph Text', label: 'Text' },
              { id: 'media', name: 'Embed Image/Video Cover', label: 'Media' }
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id as any);
                  if (tool.id === 'shape') {
                    addBlock('sandbox', { title: 'New Shape Element' }, { bgColor: '#6c63ff', width: '200px', height: '150px', borderRadius: 'rounded-xl' });
                  } else if (tool.id === 'text') {
                    addBlock('features', { title: 'Editable Text Element', description: 'Double click this block to customize layout colors and inline fonts.' });
                  } else if (tool.id === 'media') {
                    addBlock('video', { title: 'Featured Media', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
                  }
                }}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer uppercase ${activeTool === tool.id ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                title={tool.name}
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-750">
              <button
                onClick={undo}
                className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Undo last change"
              >
                <Undo className="w-3 h-3" />
              </button>
              <button
                onClick={redo}
                className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Redo next change"
              >
                <Redo className="w-3 h-3" />
              </button>
            </div>

            {/* View Grid overlay */}
            <button
              onClick={() => setShowGridLines(prev => !prev)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showGridLines ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title="Toggle Alignment Guidelines Grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            {/* Preview toggle */}
            <button
              onClick={() => setIsPreview(true)}
              className="text-[11px] font-bold text-slate-300 hover:text-white px-2.5 py-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Preview
            </button>

            {/* Export JSON backup button */}
            <button
              onClick={exportProjectJson}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Export Project JSON Backup"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Publish HTML output */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-4 py-1.5 bg-[#6C63FF] hover:bg-[#5b52e0] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Publish
            </button>
          </div>
        </header>
      )}

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Pages & Layers */}
        {!isPreview && (
          <aside className="w-64 bg-[#1e293b] border-r border-slate-800 text-slate-200 flex flex-col h-full z-10 select-none">
            {/* Pages Manager Container */}
            <div className="p-4 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pages (1-100)</span>
                <button
                  onClick={() => {
                    const name = window.prompt('Enter new page name:');
                    if (name) addPage(name);
                  }}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer transition-colors"
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
                    className={`px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${p.id === currentPageId ? 'bg-[#6C63FF] text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    <span>{p.name}</span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); duplicatePage(p.id); }}
                        className="hover:text-white text-[9px]"
                        title="Duplicate"
                      >
                        ❐
                      </button>
                      {pages.length > 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePage(p.id); }}
                          className="hover:text-red-400 text-[9px]"
                          title="Delete"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Layers Outline List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Layers Outline</span>
              {blocks.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">No layers loaded. Drag elements below to start.</p>
              ) : (
                <div className="space-y-1">
                  {blocks.map((block) => (
                    <div 
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`px-3 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer group ${block.id === selectedBlockId ? 'bg-slate-800 text-[#818cf8] font-bold' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
                    >
                      <span className="truncate">{block.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer"
                        title="Remove Section"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                
                {/* Snapping Guidelines columns */}
                {!isPreview && showGridLines && (
                  <div className="absolute inset-y-0 left-0 right-0 grid grid-cols-12 gap-4 pointer-events-none z-30 select-none opacity-[0.03]">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-full bg-slate-900 border-x border-dashed border-slate-900"></div>
                    ))}
                  </div>
                )}

                {blocks.length === 0 ? (
                  /* Empty Canvas Container */
                  <div className={`p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-transparent transition-all duration-300 ${isDraggingOver ? 'drag-over-pulse border-[#6C63FF] rounded-xl' : ''}`}>
                    <Layout className="w-12 h-12 text-slate-350 mb-3" />
                    <p className="font-bold text-slate-800 text-sm">Design Canvas is Empty</p>
                    <p className="text-xs max-w-xs mt-1 leading-normal text-slate-500">Drag items from presets, or choose tools from the sub-toolbar at the top to build layouts.</p>
                  </div>
                ) : (
                  /* Canvas Blocks List */
                  <div className="flex flex-col w-full h-full">
                    {blocks.map((block) => (
                      <div 
                        key={block.id} 
                        id={`block-${block.id}`}
                        onClick={(e) => {
                          if (isPreview) return;
                          e.stopPropagation();
                          setSelectedBlockId(block.id);
                        }}
                        className={`relative group/block transition-all ${!isPreview && block.id === selectedBlockId ? 'ring-2 ring-[#6C63FF] ring-offset-2' : ''}`}
                      >
                        <BlockRenderer 
                          block={block}
                          isEditing={!isPreview}
                          onContentChange={updateBlockContent}
                          selectedElement={selectedElement}
                          onSelectElement={(blockId, path, type) => {
                            setSelectedElement({ blockId, elementPath: path, elementType: type });
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
                    ))}
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
          <aside className="w-72 bg-[#1e293b] border-l border-slate-800 text-slate-200 flex flex-col h-full z-10 overflow-y-auto">
            {/* Sidebar Inspector Tabs */}
            <div className="flex border-b border-slate-800 bg-[#1e293b]">
              <button
                onClick={() => setActiveTab('blocks')}
                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${activeTab === 'blocks' ? 'border-[#6C63FF] text-[#818cf8]' : 'border-transparent text-slate-450 hover:text-white'}`}
              >
                <Layers className="w-3.5 h-3.5" />
                Layers
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${activeTab === 'inspector' ? 'border-[#6C63FF] text-[#818cf8]' : 'border-transparent text-slate-450 hover:text-white'}`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Inspect
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${activeTab === 'templates' ? 'border-[#6C63FF] text-[#818cf8]' : 'border-transparent text-slate-450 hover:text-white'}`}
              >
                <Layout className="w-3.5 h-3.5" />
                Presets
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${activeTab === 'assets' ? 'border-[#6C63FF] text-[#818cf8]' : 'border-transparent text-slate-450 hover:text-white'}`}
              >
                <Image className="w-3.5 h-3.5" />
                Assets
              </button>
            </div>

            {/* Sidebar Inspect Content Panel */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'blocks' && (
                <div className="space-y-4">
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
                <div className="space-y-4">
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
                <div className="space-y-4">
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
    </div>
  );
}

export default App;
