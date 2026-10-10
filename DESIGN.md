---
name: QuantEdge System
colors:
  surface: '#0d1321'
  surface-dim: '#0d1321'
  surface-bright: '#333948'
  surface-container-lowest: '#080e1c'
  surface-container-low: '#151b29'
  surface-container: '#191f2e'
  surface-container-high: '#242a39'
  surface-container-highest: '#2f3544'
  on-surface: '#dde2f6'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dde2f6'
  inverse-on-surface: '#2a303f'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4ae176'
  on-secondary: '#003915'
  secondary-container: '#00b954'
  on-secondary-container: '#004119'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#ff5451'
  on-tertiary-container: '#5c0008'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#0d1321'
  on-background: '#dde2f6'
  surface-variant: '#2f3544'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
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
  financial-xl:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  financial-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  financial-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  financial-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.5rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system blends the raw institutional density of professional market terminals with the ergonomic fluidity of modern consumer fintech. Designed for algorithmic traders, active retail investors, and finance students engaging in simulated execution, the interface communicates institutional authority, mathematical precision, and rapid spatial comprehension.

The aesthetic fuses **Tactile Data Density** with **Modern Glass-Refined Minimalism**. High-contrast telemetry sits on top of deep, light-absorbing navy strata. Visual cues emulate low-latency execution engines: micro-sparklines, tabular numeric feeds, and definitive status pings. Visual noise is aggressively eliminated; every pixel, line divider, and hue shift communicates structural financial data, execution status, or portfolio delta. The emotional response is controlled, strategic, analytical, and risk-aware.

## Colors

The palette is anchored in an uncompromising deep dark mode. It prevents eye fatigue during sustained analytical sessions while offering maximum optical contrast against luminous signal colors.

### Semantic Color Distribution
- **Canvas Base (`#0B0F1A`):** Pure deep charcoal/navy ground plane absorbing background clutter.
- **Card & Tier-1 Surfaces (`#121826`):** Precision elevated surfaces framing financial widgets, order books, and depth charts.
- **Structural Stroke (`#1F2937`):** Razor-thin structural borders providing spatial delineation without visual weight.
- **Primary / Action (`#3B82F6`):** Electric blue dedicated to operational telemetry, active tab states, interactive charts, and primary execution affordances.
- **Positive / Long (`#22C55E`):** Pure trading emerald for capital appreciation, buy/long order indicators, positive delta, and execution confirmations.
- **Negative / Short (`#EF4444`):** Crimson red for capital drawdown, ask/sell actions, negative delta, and liquidation warnings.
- **Warning / System Alert (`#F59E0B`):** Amber for paper trade execution notices, circuit breaker halts, and limit order pending states.
- **Data Neutral / Muted (`#9CA3AF`):** Subdued secondary metadata text for balance labels, ticker descriptions, and column heads.

## Typography

The type system is split into two specialized engines:
1. **Inter:** Deployed for semantic layout structure, contextual narratives, navigation labels, and standard input values. Inter delivers structural neutrality and high-legibility legibility across compact viewports.
2. **JetBrains Mono:** Enforced for all monetary balances, ticker symbols, spreads, volume depths, and quantitative performance percentages. Monospaced tabular alignment ensures zero layout jitter when real-time numbers flash and update dynamically.

### Hierarchy & Composition Rules
- Apply `label-caps` in uppercase styling for table columns, order book balance indicators, and market state tokens.
- Numerical signs (+ / -) must strictly accompany all percentage deltas and adopt the corresponding semantic color (`#22C55E` or `#EF4444`).
- All figures across watchlists and order sheets must leverage monospaced alignment rules to maintain vertical decimal tracking across tabular views.

## Layout & Spacing

The layout is built on a tight 4px baseline rhythm optimized for high informational bandwidth and analytical dashboards.

### Responsive Breakpoints & Composition
- **Mobile (< 768px):** Single-column vertical stream governed by fixed 48px to 56px bottom navigation or an expandable slide drawer. Micro-padding (`space-sm` to `space-md`) minimizes scroll exhaustion while maintaining accessible touch targets (minimum 44x44px).
- **Tablet (768px – 1024px):** 6-column fluid structure where the interactive chart occupies a dominant 4-column span, coupled with a 2-column modular order ticket or watch panel.
- **Desktop (1024px+):** 12-column dynamic terminal grid. Left structural rail contains instrument navigation (2 columns), central stage hosts multi-timeframe charts and analytics (7 columns), and the right rail houses execution and real-time order books (3 columns).

Layout containers prioritize tight gutters (`gutter-sm` on compact data rows, `gutter` between standalone analytics widgets) to deliver cohesive single-screen command centers.

## Elevation & Depth

This system avoids heavy, diffused drop shadows that muddy dark themes. Depth is achieved via **Tonal Layering** combined with **Low-Contrast Razor Outlines**.

### Elevation Stack
- **Level 0 (Canvas Base):** Solid `#0B0F1A` representing the deepest background plane.
- **Level 1 (Structural Cards / Panels):** `#121826` enclosed by a 1px uniform perimeter stroke of `#1F2937`.
- **Level 2 (Dropdowns, Floating Overlays, Modals):** `#161F33` with a 1px border of `#374151` paired with a focused ambient occlusion shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.60)`.
- **Level 3 (Tooltips & Micro Hover Popovers):** `#1E293B` bordered with `#4B5563` and a compact drop shadow: `0 4px 12px rgba(0, 0, 0, 0.45)`.

### Optical Highlights & Real-time State Changes
- **Data Flash (Up Tick):** A momentary border flare with `0 0 10px rgba(34, 197, 94, 0.35)` dissolving over 400ms.
- **Data Flash (Down Tick):** A momentary border flare with `0 0 10px rgba(239, 68, 68, 0.35)` dissolving over 400ms.
- **Focus Rings:** Non-intrusive 2px outline using `#3B82F6` with 2px offset into surface color.

## Shapes

The system relies on a modern refined curvature system (`roundedness: 2`), bridging strict corporate finance with approachable consumer fintech interfaces.

### Curvature Taxonomy
- **Analytical Containers & Metric Cards:** Standardized on `rounded-xl` (1.5rem / 24px) for expansive modules, and `rounded-lg` (1rem / 16px) for inner embedded cards, creating an organic nested card hierarchy.
- **Controls & Input Fields:** Consistent 8px (`0.5rem`) corner radius for numeric input steps, order toggles, and dropdown selectors.
- **Pill Elements:** Fully rounded (9999px) geometry reserved exclusively for time-frame tabs (e.g., `1D`, `1W`, `1M`, `1Y`, `ALL`), categorical watch filter tags, and numeric financial delta badges (`+3.42%`).

## Components

### Buttons & Execution Controls
- **Buy / Long Primary:** Background `#22C55E`, text `#0B0F1A` (extra bold), 8px radius. Active state scales to 0.98.
- **Sell / Short Primary:** Background `#EF4444`, text `#FFFFFF`, 8px radius. Active state scales to 0.98.
- **Secondary / Operational:** Background `#1F2937`, text `#FFFFFF`, hover `#374151`.
- **Execution Buttons:** Must display estimated slippage and commission markers directly within the button subtext using `financial-sm`.

### Financial Pill Tabs & Filter Chips
- **Container:** Segmented control track in `#0B0F1A` with 4px inner padding.
- **Active Pill:** Elevated `#1E293B` with bright white label text and electric blue `#3B82F6` baseline or full pill fill.
- **Inactive Pill:** Transparent fill, `#9CA3AF` text, transition to `#D1D5DB` on hover.

### Metric Cards & Sparkline Tiles
- Background `#121826`, 1px border `#1F2937`, `rounded-xl` curvature, padded with `space-lg`.
- Top row hosts instrument ticker and descriptive name; middle row presents `financial-xl` spot price; bottom row features a 48px vector SVG micro-sparkline paired with a pill badge displaying 24h percentage return.

### Data Tables & Order Books
- **Row Heights:** Compact 36px desktop, 44px mobile touch target.
- **Bids/Asks Visualization:** Subtle horizontal progress fill behind rows representing depth (`rgba(34, 197, 94, 0.08)` for bids, `rgba(239, 68, 68, 0.08)` for asks).
- Numeric values formatted strictly through `JetBrains Mono` with fixed decimal precision.

### Inputs & Quantity Pickers
- Surface `#0B0F1A`, 1px border `#1F2937`, focused border `#3B82F6`.
- Integrated step increments (`+` / `-`) positioned on right edge; clear denominator suffix (e.g., `USD`, `SHARES`, `CONTRACTS`) locked in `label-caps`.

### Checkboxes, Switches, & Radio Controls
- **Switch:** 40px track width, `#1F2937` base, shifting to `#3B82F6` when active. 16px white circular thumb.
- **Checkboxes:** 16x16px, 4px corner radius, `#1F2937` stroke. Checked state renders `#3B82F6` fill with crisp white geometric check.

### Status Indicators & Badges
- Dynamic live execution badge: Pulsing dot (6px) with an ambient green blur ring signaling real-time WebSocket connection; switches to `#F59E0B` if polling fallback engages.

### Simulation Disclaimer Footer
- **Fixed Persistent Footer / Drawer Anchor:** Low-contrast micro text (`financial-sm` or `body-sm`) rendered in `#6B7280` centered across all viewports:
  `Educational simulation software. Not investment advice.`
- Surrounded by 1px top border `#1F2937` with minimal vertical padding to maintain regulatory visibility without encroaching on actionable trading canvas.