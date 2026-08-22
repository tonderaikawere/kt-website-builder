import React, { useState } from 'react';
import type { Block } from '../types';
import { X, Copy, Download, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: Block[];
  settings: any;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, blocks, settings }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate exported HTML
  const generateHTML = () => {
    const bodyContent = blocks.map(block => {
      switch (block.type) {
        case 'header': {
          const logoText = block.content.logoText || 'LOGO';
          const items = block.content.items || [];
          return `
    <header style="background-color: ${block.styles.bgColor || '#ffffff'}; color: ${block.styles.textColor || '#1e293b'}; text-align: ${block.styles.textAlign || 'left'};" class="px-6 py-4 flex items-center justify-between border-b border-slate-100 ${block.styles.paddingTop || 'py-4'} ${block.styles.paddingBottom || 'py-4'}">
      <div class="font-bold text-xl tracking-tight">${logoText}</div>
      <nav class="flex items-center gap-6">
        ${items.map(item => `<a href="${item.link || '#'}" class="text-sm font-medium hover:opacity-85 transition-opacity">${item.title}</a>`).join('\n        ')}
      </nav>
    </header>`;
        }
        case 'hero': {
          const title = block.content.title || 'Title';
          const subtitle = block.content.subtitle || 'Subtitle';
          const buttonText = block.content.buttonText || 'Button';
          const imageSrc = block.content.imageSrc || '';
          return `
    <section style="background-color: ${block.styles.bgColor || '#4f46e5'}; color: ${block.styles.textColor || '#ffffff'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 md:px-16 ${block.styles.paddingTop || 'py-20'} ${block.styles.paddingBottom || 'py-20'} flex flex-col md:flex-row items-center gap-8 ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="flex-1 flex flex-col ${block.styles.textAlign === 'center' ? 'items-center text-center' : block.styles.textAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}">
        <h2 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">${title}</h2>
        <p class="text-lg md:text-xl opacity-90 max-w-2xl mb-8">${subtitle}</p>
        <div>
          <a href="#" class="inline-block px-6 py-3 font-semibold text-indigo-600 bg-white shadow hover:bg-indigo-50 transition-colors ${block.styles.borderRadius || 'rounded-md'}">${buttonText}</a>
        </div>
      </div>
      ${imageSrc ? `
      <div class="flex-1 w-full max-w-md md:max-w-none">
        <img src="${imageSrc}" alt="Hero Banner" class="w-full h-auto object-cover shadow-lg ${block.styles.borderRadius || 'rounded-lg'}" />
      </div>` : ''}
    </section>`;
        }
        case 'features': {
          const title = block.content.title || 'Features';
          const subtitle = block.content.subtitle || 'Subtitle';
          const items = block.content.items || [];
          return `
    <section style="background-color: ${block.styles.bgColor || '#f8fafc'}; color: ${block.styles.textColor || '#1e293b'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 md:px-16 ${block.styles.paddingTop || 'py-16'} ${block.styles.paddingBottom || 'py-16'} ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="max-w-4xl mx-auto mb-12">
        <h2 class="text-3xl font-extrabold mb-3 tracking-tight">${title}</h2>
        <p class="text-slate-600 opacity-90 max-w-2xl mx-auto">${subtitle}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        ${items.map(item => `
        <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col ${block.styles.textAlign === 'left' ? 'items-start text-left' : block.styles.textAlign === 'right' ? 'items-end text-right' : 'items-center text-center'}">
          <div class="p-3 bg-indigo-50 text-indigo-600 rounded-lg mb-4 w-fit">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          </div>
          <h3 class="text-lg font-bold mb-2">${item.title}</h3>
          <p class="text-sm text-slate-500 leading-relaxed">${item.description}</p>
        </div>`).join('\n        ')}
      </div>
    </section>`;
        }
        case 'cta': {
          const title = block.content.title || 'Call to Action';
          const subtitle = block.content.subtitle || 'Subtitle';
          const buttonText = block.content.buttonText || 'Button';
          return `
    <section style="background-color: ${block.styles.bgColor || '#1e1b4b'}; color: ${block.styles.textColor || '#ffffff'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 md:px-16 ${block.styles.paddingTop || 'py-16'} ${block.styles.paddingBottom || 'py-16'} ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="max-w-4xl mx-auto flex flex-col ${block.styles.textAlign === 'center' ? 'items-center text-center' : block.styles.textAlign === 'right' ? 'items-end text-right' : block.styles.textAlign === 'left' ? 'items-start text-left' : 'items-start'}">
        <h2 class="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight leading-tight">${title}</h2>
        <p class="text-lg opacity-80 max-w-2xl mb-8">${subtitle}</p>
        <div>
          <a href="#" class="inline-block px-6 py-3 font-semibold text-indigo-600 bg-white shadow hover:bg-indigo-50 transition-colors ${block.styles.borderRadius || 'rounded-md'}">${buttonText}</a>
        </div>
      </div>
    </section>`;
        }
        case 'testimonials': {
          const title = block.content.title || 'Testimonials';
          const subtitle = block.content.subtitle || 'Subtitle';
          const items = block.content.items || [];
          return `
    <section style="background-color: ${block.styles.bgColor || '#ffffff'}; color: ${block.styles.textColor || '#1e293b'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 md:px-16 ${block.styles.paddingTop || 'py-16'} ${block.styles.paddingBottom || 'py-16'} ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="max-w-4xl mx-auto mb-12">
        <h2 class="text-3xl font-extrabold mb-3 tracking-tight">${title}</h2>
        <p class="text-slate-600 opacity-90 max-w-2xl mx-auto">${subtitle}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        ${items.map(item => `
        <div class="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center shadow-sm">
          ${item.imageSrc ? `<img src="${item.imageSrc}" alt="${item.name}" class="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-sm mb-4" />` : ''}
          <p class="text-sm italic text-slate-600 leading-relaxed mb-6">"${item.quote}"</p>
          <div class="mt-auto">
            <h4 class="font-bold text-sm text-slate-800">${item.name}</h4>
            <p class="text-xs text-indigo-600 font-medium">${item.role}</p>
          </div>
        </div>`).join('\n        ')}
      </div>
    </section>`;
        }
        case 'pricing': {
          const title = block.content.title || 'Pricing Plans';
          const subtitle = block.content.subtitle || 'Subtitle';
          const items = block.content.items || [];
          return `
    <section style="background-color: ${block.styles.bgColor || '#f8fafc'}; color: ${block.styles.textColor || '#1e293b'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 md:px-16 ${block.styles.paddingTop || 'py-16'} ${block.styles.paddingBottom || 'py-16'} ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="max-w-4xl mx-auto mb-12">
        <h2 class="text-3xl font-extrabold mb-3 tracking-tight">${title}</h2>
        <p class="text-slate-600 opacity-90 max-w-2xl mx-auto">${subtitle}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        ${items.map(item => `
        <div class="p-8 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-md hover:shadow-lg transition-shadow">
          <h3 class="text-xl font-bold mb-2 text-slate-800">${item.title}</h3>
          <p class="text-xs text-slate-400 mb-6">${item.description}</p>
          <div class="flex items-baseline justify-center gap-1 mb-6 text-slate-900">
            <span class="text-4xl font-extrabold tracking-tight">${item.price}</span>
            <span class="text-sm font-semibold text-slate-500">${item.period || '/mo'}</span>
          </div>
          <ul class="space-y-3 mb-8 text-left text-sm text-slate-600 max-w-[240px] mx-auto w-full">
            ${(item.features || []).map(feat => `
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>${feat}</span>
            </li>`).join('\n            ')}
          </ul>
          <div class="mt-auto pt-4">
            <a href="#" class="block w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm ${block.styles.borderRadius || 'rounded-lg'}">${item.buttonText}</a>
          </div>
        </div>`).join('\n        ')}
      </div>
    </section>`;
        }
        case 'contact': {
          const title = block.content.title || 'Contact Us';
          const subtitle = block.content.subtitle || 'Subtitle';
          const formEmailPlaceholder = block.content.formEmailPlaceholder || 'Email';
          const formMessagePlaceholder = block.content.formMessagePlaceholder || 'Message';
          const formButtonText = block.content.formButtonText || 'Send';
          return `
    <section style="background-color: ${block.styles.bgColor || '#ffffff'}; color: ${block.styles.textColor || '#1e293b'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 md:px-16 ${block.styles.paddingTop || 'py-16'} ${block.styles.paddingBottom || 'py-16'} ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="max-w-4xl mx-auto mb-10">
        <h2 class="text-3xl font-extrabold mb-3 tracking-tight">${title}</h2>
        <p class="text-slate-600 opacity-90 max-w-2xl mx-auto">${subtitle}</p>
      </div>
      <div class="max-w-md mx-auto bg-slate-50 border border-slate-200/60 p-6 rounded-2xl shadow-sm text-left">
        <form onsubmit="event.preventDefault(); alert('Message sent (demo only)!');" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
            <input type="email" placeholder="${formEmailPlaceholder}" class="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" required />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Message</label>
            <textarea rows="3" placeholder="${formMessagePlaceholder}" class="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" required></textarea>
          </div>
          <button type="submit" class="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm ${block.styles.borderRadius || 'rounded-lg'}">${formButtonText}</button>
        </form>
      </div>
    </section>`;
        }
        case 'social': {
          const title = block.content.title || 'Social Links';
          const subtitle = block.content.subtitle || 'Subtitle';
          const items = block.content.items || [];
          return `
    <section style="background-color: ${block.styles.bgColor || '#ffffff'}; color: ${block.styles.textColor || '#1e293b'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 md:px-16 ${block.styles.paddingTop || 'py-12'} ${block.styles.paddingBottom || 'py-12'} ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="max-w-4xl mx-auto mb-6">
        <h2 class="text-2xl font-bold mb-2 tracking-tight">${title}</h2>
        <p class="text-sm text-slate-500 opacity-90 max-w-xl mx-auto">${subtitle}</p>
      </div>
      <div class="flex items-center justify-center gap-6 max-w-xl mx-auto">
        ${items.map(item => `
        <div class="flex flex-col items-center gap-1.5">
          <a href="${item.link || '#'}" class="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          </a>
          <span class="text-[10px] font-semibold text-slate-500">${item.title}</span>
        </div>`).join('\n        ')}
      </div>
    </section>`;
        }
        case 'linkButton': {
          const title = block.content.title || 'Ready to Get Started?';
          const subtitle = block.content.subtitle || 'Build your online presence today with our powerful site builder.';
          const buttonText = block.content.buttonText || 'Learn More';
          const buttonLink = block.content.buttonLink || '#';
          return `
    <section style="background-color: ${block.styles.bgColor || '#f1f5f9'}; color: ${block.styles.textColor || '#1e293b'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 md:px-16 ${block.styles.paddingTop || 'py-12'} ${block.styles.paddingBottom || 'py-12'} ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="max-w-4xl mx-auto flex flex-col items-center">
        <h2 class="text-2xl font-bold mb-2 tracking-tight">${title}</h2>
        <p class="text-sm opacity-90 max-w-xl mb-6">${subtitle}</p>
        <a href="${buttonLink}" target="_blank" rel="noopener noreferrer" class="inline-block py-2.5 px-6 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm ${block.styles.borderRadius || 'rounded-lg'}">${buttonText}</a>
      </div>
    </section>`;
        }
        case 'video': {
          const title = block.content.title || 'Watch Our Presentation';
          const subtitle = block.content.subtitle || 'See how KT Website Builder helps you deploy projects faster.';
          const youtubeId = block.content.youtubeId || 'dQw4w9WgXcQ';
          return `
    <section style="background-color: ${block.styles.bgColor || '#ffffff'}; color: ${block.styles.textColor || '#1e293b'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 md:px-16 ${block.styles.paddingTop || 'py-16'} ${block.styles.paddingBottom || 'py-16'} ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="max-w-4xl mx-auto mb-8">
        <h2 class="text-3xl font-extrabold mb-3 tracking-tight">${title}</h2>
        <p class="text-slate-600 opacity-90 max-w-2xl mx-auto">${subtitle}</p>
      </div>
      <div class="max-w-3xl mx-auto">
        <div class="aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-slate-900 border border-slate-200">
          <iframe src="https://www.youtube.com/embed/${youtubeId}" title="Embedded Video" class="w-full h-full border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    </section>`;
        }
        case 'footer': {
          const copyrightText = block.content.copyrightText || '';
          const items = block.content.items || [];
          return `
    <footer style="background-color: ${block.styles.bgColor || '#0f172a'}; color: ${block.styles.textColor || '#94a3b8'}; text-align: ${block.styles.textAlign || 'center'};" class="px-8 py-12 ${block.styles.paddingTop || 'py-8'} ${block.styles.paddingBottom || 'py-8'} border-t border-slate-800 ${block.styles.marginTop || 'mt-0'} ${block.styles.marginBottom || 'mb-0'}">
      <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-sm">${copyrightText}</p>
        <div class="flex gap-6">
          ${items.map(item => `<a href="${item.link || '#'}" class="text-sm font-medium hover:text-white transition-colors">${item.title}</a>`).join('\n          ')}
        </div>
      </div>
    </footer>`;
        }
        default:
          return `<!-- Unknown block type: ${block.type} -->`;
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.title || 'KT Web Builder Export'}</title>
  <meta name="description" content="${settings.description || ''}">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${settings.customGlobalCss || ''}
  </style>
</head>
<body class="bg-slate-50 text-slate-800">
  ${bodyContent}
</body>
</html>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateHTML());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateHTML()], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Export Website Code</h2>
            <p className="text-xs text-slate-500 mt-0.5">Copy or download your complete visual layout as HTML/CSS</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <textarea
            readOnly
            value={generateHTML()}
            className="w-full flex-1 min-h-[300px] text-xs font-mono p-4 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 focus:outline-none resize-none overflow-y-auto"
          />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-500 font-medium">Includes responsive classes & Tailwind CDN</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download index.html
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
