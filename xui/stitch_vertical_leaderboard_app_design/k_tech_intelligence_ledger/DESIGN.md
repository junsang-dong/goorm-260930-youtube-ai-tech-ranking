---
name: K-Tech Intelligence Ledger
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f87'
  primary: '#022448'
  on-primary: '#ffffff'
  primary-container: '#1e3a5f'
  on-primary-container: '#8aa4cf'
  inverse-primary: '#adc8f5'
  secondary: '#255dac'
  on-secondary: '#ffffff'
  secondary-container: '#7babff'
  on-secondary-container: '#003e81'
  tertiary: '#00263a'
  on-tertiary: '#ffffff'
  tertiary-container: '#003d5a'
  on-tertiary-container: '#24acf1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#adc8f5'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2d486d'
  secondary-fixed: '#d7e3ff'
  secondary-fixed-dim: '#aac7ff'
  on-secondary-fixed: '#001b3e'
  on-secondary-fixed-variant: '#00458e'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 34px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  stat-display:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 26px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-numeric:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
The design system positions itself as an authoritative, high-precision analytics terminal tailored for the Korean AI and tech education vertical. It merges the analytical gravity of enterprise fintech dashboards with the agility of high-density mobile media indexing. The UI must evoke technical trust, objective editorial authority, and momentum without resorting to sensationalist consumer gimmicks.

The visual style is **Corporate Modern with High-Density FinTech Accents**:
- Structural discipline anchored by clean grid lines, low-contrast bounding borders, and clear quantitative hierarchies.
- High-contrast numerical data layers set against calm slate-tinted canvas surfaces.
- Micro-visual indicators (growth deltas, rank tiers, topical heat flags) that communicate vital shifts instantly without visual noise.
- Tactile affordances that feel crisp, precise, and engineered rather than playful or ambiguous.

## Colors
The color architecture relies on a multi-tiered cool-spectrum foundation designed for data legibility, supplemented by deliberate semantic accents.

- **Primary (`#1E3A5F` - Deep Navy):** Anchors dominant navigational frames, primary headers, authoritative tags, and strong interactive states.
- **Secondary (`#1A56A4` - Royal Blue):** Drives primary interactive paths, tab underlines, segmented control highlights, and verified credential tags.
- **Tertiary (`#0EA5E9` - Electric Sky Blue):** Serves as the growth indicator, signaling rank ascents, live metric recalculations, and positive delta indicators.
- **Accent Coral / Flame (`#F43F5E`):** Reserved strictly for negative shifts (rank drops), critical threshold breaches, and high-velocity trend flags ("Hot").
- **Neutral Palette:**
  - Base Canvas: `#F8FAFC` (Slate 50)
  - Card/Surface Tier 1: `#FFFFFF`
  - Subtle Borders: `#E2E8F0` (Slate 200)
  - Text Primary: `#0F172A` (Slate 900)
  - Text Secondary: `#475569` (Slate 600)
  - Text Muted: `#94A3B8` (Slate 400)
- **Rank Tier Metallics:**
  - 1st Place (Gold): Background `#FEF3C7`, Border `#FDE68A`, Text `#B45309`
  - 2nd Place (Silver): Background `#F1F5F9`, Border `#CBD5E1`, Text `#475569`
  - 3rd Place (Bronze): Background `#FFEDD5`, Border `#FED7AA`, Text `#9A3412`

Dark mode transitions replace the canvas with `#0B0F19`, surface containers with `#111827`, and borders with `#1F2937`, maintaining absolute chromatic consistency for the semantic accents.

## Typography
The typographic system pairs the structural, geometric presence of Plus Jakarta Sans for structural headers with the neutral clarity of Inter for dense Korean/English bilingual interfaces, while JetBrains Mono handles tabular metrics, percentages, and ordinal rankings.

- **Korean Localization Rule:** When Pretendard or system Neo-Gothic typefaces are rendered natively on client clients, fallback styles must maintain letter spacing at `-0.015em` to `-0.025em` across all scale steps to avoid line wraps in high-density data cards.
- **Tabular Figures:** All growth percentages, view counts, subscriber counts, and rank indexes must be rendered with tabular lining figures (`font-variant-numeric: tabular-nums`) using the `label_font` (`JetBrains Mono`) to preserve column vertical tracking.
- **Hierarchy:** Primary channel titles use `title-md`. Growth and algorithmic indexes use `label-numeric` or `stat-display`. Section identifiers and filter group titles use `headline-md` or `label-md` with upper-range medium weights.

## Layout & Spacing
The layout follows a fluid-grid structure optimized for vertical density on mobile viewports (360px–428px) while cleanly expanding into multi-column comparative analytics on tablet (768px+) and desktop (1200px+).

- **Mobile Viewport (Base):** Single-column stack. Page container uses fixed `margin` (16px), with intra-card spacing locked to `space-md` (12px) to maximize above-the-fold rank visibility. Lists enforce strict vertical cadence with elements separated by `space-sm` (8px).
- **Tablet (768px–1023px):** 6-column fluid structure. Outer margins increase to `margin-tablet` (24px) with `gutter` (16px). Top 3 podium items transition from a vertical stack to an asymmetrical 3-column comparative hero unit.
- **Desktop (1024px+):** 12-column layout bounded by a `max-width` of 1280px. Main ranking table occupies 8 columns, while real-time rising topics, category filters, and predictive indices occupy the remaining 4 columns as a sticky rail.
- **Vertical Rhythm:** Strict multiples of 4px dictate all spacing tokens. Interactive targets retain an absolute minimum hit-box size of 44px regardless of container padding.

## Elevation & Depth
Elevation is achieved using sharp tonal layering and structural borders rather than heavy atmospheric drops. This maintains the clean, calculated feel of an institutional data dashboard.

- **Level 0 (Canvas):** Flat `#F8FAFC`. Zero elevation.
- **Level 1 (Card & Modular Rows):** Pure white `#FFFFFF` bounded by a 1px continuous border of `#E2E8F0`. Shadow is microscopic and directional: `0 1px 2px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Active/Hover Cards, Flyout Drawers):** `#FFFFFF` paired with an outline shift to `#CBD5E1`. Shadow: `0 4px 12px -2px rgba(30, 58, 95, 0.08)`.
- **Level 3 (Sticky Headers, Bottom Filter Bars, Modals):** Surface rendered with background blur (`backdrop-filter: blur(12px)`) using an 85% opacity fill of `#FFFFFF` (or `#111827` in dark mode), supported by a hard bottom border of `#E2E8F0`. Shadow: `0 8px 24px -4px rgba(15, 23, 42, 0.12)`.

## Shapes
A unified radius scale (`roundedness: 2`) balances clean corporate precision with modern digital ergonomics. 

- Base components (rank rows, inputs, standard cards) use `0.5rem` (8px).
- Larger layout surfaces, dialogs, and segmented parent containers use `1rem` (16px).
- Deep structural overlays use `1.5rem` (24px).
- Category badges, status indicators, and micro-metric chips deviate from the base scale to use fully pill-shaped contours (`9999px`) to immediately distinguish contextual metadata from clickable structural cards.

## Components

### 1. Buttons
- **Primary Action:** Solid Deep Navy (`#1E3A5F`) fill, `#FFFFFF` text, 8px radius. Height 40px (compact 32px for in-row table actions). Active state scales to `98%` with `#152943` fill.
- **Secondary / Filter Button:** Outline style with `#E2E8F0` border, `#FFFFFF` fill, `#1E3A5F` text. Active state renders `#F1F5F9`.
- **Ghost Action:** No background, `#1A56A4` text with subtle underline or chevron on hover.

### 2. Category & Filter Chips
- **Neutral Chip:** Height 28px, pill-shaped (`rounded-full`), `#F1F5F9` background, `#475569` label text (`label-md`).
- **Selected/Active Chip:** Solid `#1A56A4` background, `#FFFFFF` text, optional dismissal 'x' icon.
- **Topic Flag Chips (e.g., 'LLM 활용', '바이브코딩'):** 1px border using `#E2E8F0`, subtle gradient or tinted background (`#F8FAFC`), accompanied by a 6px leading semantic dot.

### 3. Ranking List Items & Cards
- **Structure:** Horizontal flexbox (Rank Number | Avatar/Channel Badge | Info Group | Growth Velocity | Action).
- **Height & Padding:** 72px fixed height on mobile, 12px horizontal padding, 8px vertical padding.
- **Top 3 Podium Variants:**
  - Rank 1: Border left 3px solid `#F59E0B`, medal badge (`#FEF3C7` background, `#B45309` numeral).
  - Rank 2: Border left 3px solid `#94A3B8`, medal badge (`#F1F5F9` background, `#475569` numeral).
  - Rank 3: Border left 3px solid `#F97316`, medal badge (`#FFEDD5` background, `#9A3412` numeral).
- **Ranks 4+:** Border uniform `#E2E8F0`, plain high-contrast monospace numeral (`#64748B`).

### 4. Growth & Topic Badges
- **Rising Badge:** Micro-tag featuring tertiary color (`#0EA5E9`) with an upward-pointing triangle vector, containing text like `+12.4%` or `▲ 3` in `label-numeric` font.
- **Falling Badge:** Accent Coral (`#F43F5E`) with a downward vector (`▼ 2` or `-4.1%`).
- **Hot Topic Tag:** `#FFF1F2` background, `#F43F5E` text, featuring a flame icon glyph.

### 5. Input Fields & Search Bars
- **Global Search:** Height 44px, full width. Fill `#FFFFFF`, 1px solid border `#CBD5E1`, inset leading search icon in `#94A3B8`. Placeholder text in `#94A3B8` (`body-md`).
- **Focus State:** 2px ring in `#0EA5E9` with 0px offset.

### 6. Checkboxes & Radio Segmented Controls
- **Segmented Time Range Control (24H / 7D / 30D / All):** Encapsulated container `#F1F5F9` with 8px radius. Active item has `#FFFFFF` card surface, subtle drop shadow, and `#1E3A5F` bold text.