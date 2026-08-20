# KT Website Builder

KT Website Builder is a powerful, visual drag-and-drop website editor and designer. It operates local-first, allowing creators to visually structure sections, inspect styles, configure dynamic typography fonts, write custom CSS stylesheets, edit page SEO meta-tags, and export static HTML/CSS files instantly.

---

## 🚀 Key Features

### 1. Drag & Drop Canvas
- **Dynamic Blocks**: Drag and drop various pre-designed components directly onto the builder canvas.
- **Reordering Control**: Shift blocks up or down on the fly with instant DOM reordering animations.
- **Delete Blocks**: Remove sections quickly with hover control action toolbar.

### 2. Advanced Style Inspector
- **Bg/Text Colors**: Integrated interactive color pickers with custom hex code inputs and preset palettes.
- **Padding & Margins**: Visual spacing sliders for top/bottom margins and padding ranges.
- **Button Border Radius**: Set button corners rounded settings from none, small, medium, large, to full circle.
- **Text Alignments**: Choose text alignments (left, center, right, justify) per section block.

### 3. Typography & Styles Injection
- **Dynamic Fonts**: Load Google Web Fonts dynamically (Inter, Roboto, Playfair Display, Poppins, Lora, JetBrains Mono).
- **Custom Global CSS**: Inject global stylesheet classes directly into the page canvas.

### 4. Rich-Text formatting
- **Floating Toolbar**: Text selection triggers a formatting overlay for Bold, Italic, Underline, and clearing format.

### 5. Bezel Canvas Simulation
- **Device Modes**: Toggle views between Desktop, Tablet (768px), and Mobile (375px).
- **Hardware Bezel**: Renders beautiful mockup frames and notches around responsive layouts.

### 6. Autosave & History tracking
- **Autosave**: Automatically serializes state into `localStorage` to avoid data loss.
- **Undo / Redo**: Track editor change logs for quick state rolling back or forward.

---

## 🛠️ Architecture & Components

The application is structured into modular React components communicating through a centralized state manager hook:

- [**`src/App.tsx`**](file:///c:/Users/Tonde/Downloads/kt-website-builder/src/App.tsx): Coordinates drag-and-drop actions, viewport device toggles, tab panels selection, global settings, and modals rendering.
- [**`src/useBuilderState.ts`**](file:///c:/Users/Tonde/Downloads/kt-website-builder/src/useBuilderState.ts): State manager hook encapsulating layout blocks list, undo/redo stacks, page properties, and local storage synchronization.
- [**`src/components/Blocks.tsx`**](file:///c:/Users/Tonde/Downloads/kt-website-builder/src/components/Blocks.tsx): Custom renderer rendering Header, Hero, Features, CTA, Pricing, Testimonials, Contact Form, Social Links, and Video block variants.
- [**`src/components/Inspector.tsx`**](file:///c:/Users/Tonde/Downloads/kt-website-builder/src/components/Inspector.tsx): Sidebar styling properties selector.
- [**`src/components/ExportModal.tsx`**](file:///c:/Users/Tonde/Downloads/kt-website-builder/src/components/ExportModal.tsx): Compiles JSON canvas blocks into single static standalone HTML5 pages containing inline styling and Tailwind CSS CDN references.
- [**`src/components/RichTextToolbar.tsx`**](file:///c:/Users/Tonde/Downloads/kt-website-builder/src/components/RichTextToolbar.tsx): Floating overlay formatting toolbar hooking into selectionchange range events.

---

## 📦 Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/tonderaikawere/kt-website-builder.git
   cd kt-website-builder
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 Open Source Licenses (10 Licensing Options)

This repository is multi-licensed. Developers and organizations can utilize, modify, and distribute this software under any of the following 10 standard open-source license agreements:

### 1. MIT License
*   **Permissions**: Commercial use, modification, distribution, private use.
*   **Conditions**: Include copyright and license notice.
*   **Limitations**: No liability, no warranty.

### 2. Apache License 2.0
*   **Permissions**: Commercial use, modification, distribution, patent use, private use.
*   **Conditions**: Include copyright and license notice, state changes, and include NOTICE file.
*   **Limitations**: No liability, no warranty, no trademark rights.

### 3. GNU General Public License v3.0 (GPL-3.0)
*   **Permissions**: Commercial use, modification, distribution, patent use, private use.
*   **Conditions**: Disclose source code, include copyright and license notice, state changes, license derivatives under GPL-3.0.
*   **Limitations**: No liability, no warranty.

### 4. GNU Affero General Public License v3.0 (AGPL-3.0)
*   **Permissions**: Commercial use, modification, distribution, private use.
*   **Conditions**: Disclose source code (including when running as a network service), include license notice, state changes, license derivatives under AGPL-3.0.
*   **Limitations**: No liability, no warranty.

### 5. GNU Lesser General Public License v3.0 (LGPL-3.0)
*   **Permissions**: Commercial use, modification, distribution, patent use, private use.
*   **Conditions**: Disclose source code of modifications, include license notice, state changes, link software dynamically.
*   **Limitations**: No liability, no warranty.

### 6. BSD 3-Clause "New" or "Revised" License
*   **Permissions**: Commercial use, modification, distribution, private use.
*   **Conditions**: Include copyright and license notice, retain disclaimer.
*   **Limitations**: No liability, no warranty, do not use contributor names for endorsement.

### 7. BSD 2-Clause "Simplified" License
*   **Permissions**: Commercial use, modification, distribution, private use.
*   **Conditions**: Include copyright and license notice, retain disclaimer.
*   **Limitations**: No liability, no warranty.

### 8. Mozilla Public License 2.0 (MPL-2.0)
*   **Permissions**: Commercial use, modification, distribution, patent use, private use.
*   **Conditions**: Disclose source code of MPL-licensed files, include license notice.
*   **Limitations**: No liability, no warranty, no trademark rights.

### 9. The Unlicense (Public Domain)
*   **Permissions**: Commercial use, modification, distribution, patent use, private use.
*   **Conditions**: None (completely dedicated to the public domain).
*   **Limitations**: No liability, no warranty.

### 10. Eclipse Public License 2.0 (EPL-2.0)
*   **Permissions**: Commercial use, modification, distribution, patent use, private use.
*   **Conditions**: Disclose source code of EPL-licensed files, include license notice.
*   **Limitations**: No liability, no warranty.
