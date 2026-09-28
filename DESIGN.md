---
name: Sovereign Ledger
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
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#40000c'
  on-tertiary-container: '#f83256'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  numeric-metric-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  numeric-tabular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-trust, editorial-grade financial environment designed for modern wealth management, personal cashflow intelligence, and portfolio clarity. The target demographic demands analytical rigor without the cognitive fatigue associated with dense legacy fintech platforms. 

The aesthetic is Modern Executive: a blend of high-end Swiss functionalism and contemporary SaaS refinement. It relies on architectural discipline, precise spatial hierarchy, disciplined metric emphasis, and restrained ambient depth. Visual friction is eliminated to inspire confidence, calm, and agency over complex financial decisions.

## Colors

The palette pairs executive authority with distinct financial indicators.

- **Primary (`#0F172A` - Deep Slate/Navy):** Anchors high-order typography, structural sidebars, dark interaction accents, and active focus boundaries.
- **Secondary (`#0D9488` - Crisp Emerald/Teal):** Dedicated exclusively to positive states: capital appreciation, positive net cashflow, deposits, asset allocation gains, and primary constructive triggers.
- **Tertiary (`#E11D48` - Refined Rose/Coral):** Encodes debt service, negative trends, high-velocity spending, and transactional outflows with clarity rather than panic.
- **Neutral (`#64748B` - Slate Muted):** Governs secondary labels, tabular borders, and structural metadata.

### Surface System
- **Canvas Base:** `#F8FAFC` with a subtle cool-indigo bias (`#F1F5F9`) ensures content stands out without stark clinical glare.
- **Card/Container Surface:** `#FFFFFF` pure white, creating layered contrast over the tinted base.
- **Subtle Surface Accent:** `#F1F5F9` for table headers, embedded metrics, and segmented controls.
- **Semantic Muted Tints:** Positive badge surfaces use `#CCFBF1` (10% tint of Teal), while expense badges leverage `#FFE4E6` (10% tint of Rose).

## Typography

The typography couples the refined geometric authority of **Plus Jakarta Sans** for overarching metrics and titles with the neutral, analytical precision of **Inter** for dense transactional UI.

- **Tabular Figures:** Always apply `font-feature-settings: "tnum" 1, "cv05" 1` to `numeric-tabular` and metric styles. Financial ledgers, currency tickers, and percentage changes must avoid optical jitter during real-time updates.
- **Label Capitalization:** `label-sm` is reserved for metadata labels, table header categories, and delta trend badges; render in uppercase when paired with `letterSpacing: 0.04em`.
- **Weight Pairing:** Headlines use medium and semibold weights (`600`, `700`) to hold structure against large whitespace expanses, while body copy remains strictly at `400` or `500` for sustained reading clarity.

## Layout & Spacing

The system enforces a 12-column fluid grid system pinned to a maximum desktop container width of `1440px`. 

- **Desktop (>= 1024px):** 12 columns, `gutter: 1.5rem`, `margin: 2rem`. Sidebar navigation remains fixed at `260px` or can collapse to an `80px` rail, while the analytic canvas dynamically fills remaining space. Primary dashboard modules span 4, 6, 8, or 12 columns.
- **Tablet (768px - 1023px):** 8 columns, `gutter: 1.25rem`, `margin: 1.5rem`. Secondary summary cards collapse into 4-column blocks; sub-charts stack underneath primary transaction tables.
- **Mobile (< 768px):** 4 columns, `gutter-mobile: 1rem`, `margin-mobile: 1rem`. All multi-column cards collapse to full-width horizontal tracks or swipeable snap carousels for mini-cards.

Padding rhythm within cards adheres to strict spatial scales: card interiors use `space-lg` (`1.5rem`) on desktop, scaling down to `space-md` (`1rem`) on small viewports.

## Elevation & Depth

Visual hierarchy uses layered ambient shadows and low-contrast borders instead of heavy drop shadows, reinforcing a modern architectural aesthetic.

- **Surface Tiers:**
  - **Level 0 (Canvas):** `#F8FAFC`, background foundation.
  - **Level 1 (Cards & Data Panels):** `#FFFFFF` background, structured by a hairline border: `1px solid rgba(226, 232, 240, 0.8)`. Resting shadow is ultra-diffused: `0 1px 3px rgba(15, 23, 42, 0.03), 0 4px 12px rgba(15, 23, 42, 0.02)`.
  - **Level 2 (Hovered Cards & Dropdowns):** `1px solid rgba(203, 213, 225, 0.9)`, cast with tinted ambient depth: `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 10px 24px -3px rgba(15, 23, 42, 0.04)`.
  - **Level 3 (Modals & Command Palettes):** Backdrop frosted with `backdrop-filter: blur(8px); background: rgba(15, 23, 42, 0.4)`. Modal elevated with `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)`.
- **Chart Elevation:** Line charts utilize faint vertical gradients running down from the primary metric line, fading from `rgba(13, 148, 136, 0.14)` to `rgba(13, 148, 136, 0.0)` at the X-axis baseline.

## Shapes

The design system adopts a balanced geometry (`roundedness: 2`):

- **Data Cards & Modules:** `rounded-lg` (`1rem` / `16px`) creates clean separation without looking overly casual or toy-like.
- **Interactive Controls (Inputs, Buttons, Dropdowns):** `rounded` (`0.5rem` / `8px`) provides tactile, grounded interaction targets.
- **Status Pills, Value Tags, & Badges:** `rounded-full` (`9999px`) distinctively segregates categorical attributes and transactional deltas from card frames.

## Components

### Buttons
- **Primary:** Background `#0F172A`, foreground `#FFFFFF`, border `none`, padding `0.625rem 1.25rem`, border-radius `0.5rem`. Subtle hover transition to `#1E293B`.
- **Secondary:** Background `#FFFFFF`, foreground `#0F172A`, border `1px solid #E2E8F0`, hover background `#F8FAFC`.
- **Success/Destructive Actions:** Use muted surface fills (`#F0FDFA` / `#FFF1F2`) with solid text (`#0D9488` / `#E11D48`) for contextual secondary actions.

### Cards & Metrics Containers
- Pure white container (`#FFFFFF`) with `1px solid #E2E8F0` and `16px` corner radius.
- Header contains section label (`label-sm`, uppercase), balance amount (`numeric-metric-lg`), and inline delta badge.
- Padded with `1.5rem` uniformly.

### Chips & Badges
- **Positive Delta Chip:** `background: #CCFBF1`, `color: #0F766E`, font-weight `600`, padding `0.25rem 0.625rem`, pill-shaped. Includes prefixed `+` and directional arrow.
- **Negative Delta Chip:** `background: #FFE4E6`, `color: #BE123C`, font-weight `600`, padding `0.25rem 0.625rem`, pill-shaped. Includes prefixed `-`.
- **Category Filter Chip:** Outline `1px solid #E2E8F0`, text `#475569`, active state: `#0F172A` fill with `#FFFFFF` text.

### Inputs & Select Fields
- Height `40px`, background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`.
- Focus state: border color `#0F172A`, box-shadow `0 0 0 3px rgba(15, 23, 42, 0.08)`. Placeholder color `#94A3B8`.

### Data Tables & Transaction Rows
- Header row uses `#F8FAFC`, uppercase `label-sm` (`#64748B`), cell padding `0.75rem 1rem`.
- Data rows feature subtle bottom border `1px solid #F1F5F9`, hover highlight with background `#F8FAFC`.
- Cash amounts must always align right with monospace/tabular numerical formatting.

### Chart Tooltips
- Minimal dark theme tooltip: background `rgba(15, 23, 42, 0.95)`, backdrop-blur `4px`, padding `0.5rem 0.75rem`, text `#FFFFFF`, border-radius `0.375rem`. Displays date and tabular value with indicator dot.