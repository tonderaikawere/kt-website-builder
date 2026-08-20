import { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { useBuilderState } from './useBuilderState';
import { BLOCK_TEMPLATES } from './blockTemplates';
import { BlockRenderer } from './components/Blocks';
import { Inspector } from './components/Inspector';
import { BlockType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'blocks' | 'inspector' | 'templates' | 'css' | 'seo'>('blocks');
  
  const {
    blocks,
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
  } = useBuilderState();

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

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-800 select-none overflow-hidden">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-slate-200 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-none">KT Website Builder</h1>
            <span className="text-xs text-slate-500 font-medium">Design & Drag Editor</span>
          </div>
        </div>

        {/* Viewport Toggles */}
        {!isPreview && (
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-md transition-colors ${deviceMode === 'desktop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-md transition-colors ${deviceMode === 'tablet' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-md transition-colors ${deviceMode === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={resetProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              isPreview
                ? 'bg-slate-800 hover:bg-slate-900 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            {isPreview ? 'Back to Edit' : 'Preview Site'}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Hidden in Preview */}
        {!isPreview && (
          <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full z-10">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setActiveTab('blocks')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'blocks'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                Blocks
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'inspector'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Palette className="w-4 h-4" />
                Styles
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'templates'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layout className="w-4 h-4" />
                Presets
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'css'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileCode className="w-4 h-4" />
                CSS
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'seo'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                SEO
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'blocks' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 text-sm">Drag & Drop Elements</h3>
                  <p className="text-xs text-slate-500 mb-4">Drag these sections on the canvas or click to add them.</p>
                  
                  <div className="space-y-2">
                    {BLOCK_TEMPLATES.map((tpl) => (
                      <div
                        key={tpl.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, tpl.type)}
                        onClick={() => handleBlockClick(tpl.type)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 border-dashed hover:border-indigo-300 transition-all cursor-grab flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-700">{tpl.name}</span>
                          <span className="text-[10px] text-slate-400 max-w-[200px] mt-0.5 line-clamp-1">{tpl.description}</span>
                        </div>
                        <Plus className="w-4 h-4 text-indigo-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
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
                <div className="text-center py-8 text-slate-400 text-sm">
                  Pre-configured layout templates will show here.
                </div>
              )}
              {activeTab === 'css' && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Custom CSS configurations will show here.
                </div>
              )}
              {activeTab === 'seo' && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  SEO Meta tags editor will show here.
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Central Canvas Workspace */}
        <main 
          className={`flex-1 flex justify-center items-start overflow-y-auto bg-slate-100 transition-all duration-300 p-8 ${isPreview ? 'p-0' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div 
            className={`bg-white shadow-sm border border-slate-200 min-h-[500px] w-full transition-all duration-300 ${
              isPreview ? 'max-w-full min-h-full border-none shadow-none' : 
              deviceMode === 'mobile' ? 'max-w-[375px]' : 
              deviceMode === 'tablet' ? 'max-w-[768px]' : 'max-w-full'
            }`}
          >
            {blocks.length === 0 ? (
              /* Empty Canvas Container */
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
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
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative group transition-all ${
                      !isPreview && selectedBlockId === block.id 
                        ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-md' 
                        : 'hover:ring-1 hover:ring-slate-300'
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
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, 'down');
                          }}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
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
                          className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <BlockRenderer 
                      block={block} 
                      isEditing={!isPreview} 
                      onContentChange={updateBlockContent}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
