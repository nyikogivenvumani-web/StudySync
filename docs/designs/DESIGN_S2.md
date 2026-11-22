---
name: Academic Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#006243'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d57'
  on-tertiary-container: '#bdffdc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.025em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies an institutional, focused, and distraction-free educational environment. Built exclusively around a clean light aesthetic, the visual narrative emphasizes clarity, immediate legibility, and high utility for students, educators, and administrators navigating complex coursework, schedules, and analytics.

The aesthetic blends **Modern Corporate** clarity with structured **SaaS Utility**:
- **Purity and Focus**: Strict light-mode interface using deliberate neutral contrasts rather than heavy decorative treatments.
- **Academic Reliability**: Crisp borders, restrained typography, and intentional status-driven color signaling create an atmosphere of academic rigor and operational trust.
- **Iconographic Consistency**: Strict reliance on crisp, geometric line icons (Lucide system) with zero use of informal emojis or decorative embellishments.

## Colors

The palette operates under a strict, non-inverted light framework to preserve contrast ratios across all educational data densities.

### Structural Foundations
- **Canvas Base**: `#F8FAFC` (Slate 50) provides an anti-glare, soft background layer for long study sessions.
- **Surface / Card**: `#FFFFFF` provides clean contrast over the canvas background.
- **Dividers & Subdued Borders**: `#E2E8F0` (Slate 200).
- **Interactive & Form Borders**: `#CBD5E1` (Slate 300) ensures clear boundary delineation for accessible inputs.

### Typographic Contrast Scale
- **Primary Text / Heading**: `#0F172A` (Slate 900) for uncompromised legibility.
- **Secondary Text / Supporting**: `#475569` (Slate 600) for metadata, labels, and table subheads.
- **Tertiary / Muted Text**: `#94A3B8` (Slate 400) for placeholder states and inactive timestamps.

### Interactive Brand Tones
- **Primary Action**: `#2563EB` (Blue 600).
- **Hover / Pressed**: `#1D4ED8` (Blue 700).
- **Active Selection / Subdued Highlight**: `#EFF6FF` (Blue 50).

### Contextual Status System
- **Pending / Action Required**: Background `#FEF3C7` (Amber 100), Text `#92400E` (Amber 800), Border `#FCD34D` (Amber 300).
- **Approved / Complete / Success**: Background `#D1FAE5` (Emerald 100), Text `#065F46` (Emerald 800), Border `#6EE7B7` (Emerald 300).
- **Rejected / Alert / Destructive**: Background `#FFE4E6` (Rose 100), Text `#9F1239` (Rose 800), Border `#FDA4AF` (Rose 300).
- **Notice / System Offline**: Background `#FFFBEB` (Amber 50), Text `#92400E` (Amber 800), Border `#FCD34D` (Amber 300).

## Typography

The typography scale utilizes **Inter** across all functional tiers, prioritizing neutral geometric rendering and maximum legibility during extended digital study sessions.

- **Headings & Hierarchy**: Display and headline tiers apply tight letter-spacing (`-0.02em` to `-0.025em`) with bold weight (`700`), anchoring card sections, modal titles, and dashboard overviews.
- **Reading Rhythm**: Body text uses regular weight (`400`) at comfortable line heights (`1.4` to `1.5`) in neutral slate tones to prevent reading fatigue.
- **Micro-Copy & Indicators**: Small badges, column headers, and tags deploy medium-to-semibold weights (`500` / `600`) with subtle uppercase tracking where structural separation is required.

## Layout & Spacing

The structural layout uses a responsive fluid grid bounded by a max-width container of `1280px` for desktop viewports to retain optimal line lengths for educational materials.

- **Desktop (>= 1024px)**: 12-column layout with `1.5rem` (`24px`) gutters and `2rem` (`32px`) page canvas margins. Side navigation occupies a fixed 260px column; primary learning feeds flex across the remaining 8–10 columns.
- **Tablet (768px - 1023px)**: 8-column layout with `1rem` (`16px`) gutters and `1.5rem` (`24px`) page margins. Collapsible left-hand rail for contextual navigation.
- **Mobile (< 768px)**: 4-column layout with `1rem` (`16px`) gutters and `1rem` (`16px`) page margins. Stacks cards and analytics modules vertically.

Component spacing adheres strictly to an 8-point baseline rhythm, using `space-xs` (4px) and `space-sm` (8px) for tightly grouped controls, and `space-md` (16px) or `space-lg` (24px) for card body padding.

## Elevation & Depth

Visual hierarchy is maintained primarily through surface separation, controlled border definitions, and subtle, low-opacity drop shadows. 

- **Level 0 (Flat / Canvas)**: Background canvas `#F8FAFC`. Used exclusively for application viewport backdrops.
- **Level 1 (Cards, Modules, Input Surfaces)**: Surface `#FFFFFF` bordered with a 1px line of `#E2E8F0` and elevated with `shadow-sm` (`0 1px 2px 0 rgba(15, 23, 42, 0.05)`). Used for static assignment modules, course overview tiles, and persistent sidebars.
- **Level 2 (Interactive Floating, Dropdowns, Hovered Cards)**: Elevated with `shadow-md` (`0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`), paired with border `#CBD5E1`. Used for course selector popovers, user menus, and cards in an active hover state.
- **Level 3 (Modals & Overlays)**: Surface `#FFFFFF` supported by `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)`, set above a backdrop wash of `#0F172A` with 40% opacity.

## Shapes

The design system maintains a balanced, friendly, yet structured architectural posture:
- **Base Rounding (`rounded-lg`, 8px)**: Standard for interactive controls including primary/secondary buttons, text input fields, status chips, and table row groupings.
- **Container Rounding (`rounded-xl`, 12px)**: Applied to course cards, submission modules, diagnostic score banners, and modals.
- **Pill Rounding (`rounded-full`)**: Strictly reserved for circular profile avatars, count badges, and small binary tag indicators.

## Components

### Buttons
- **Primary**: Background `#2563EB`, text `#FFFFFF`, radius `rounded-lg`, hover `#1D4ED8`. Height 40px (padding 0 16px).
- **Secondary / Outline**: Background `#FFFFFF`, border 1px `#CBD5E1`, text `#0F172A`, hover `#F8FAFC`.
- **Tertiary / Ghost**: Transparent background, text `#475569`, hover `#EFF6FF` with text `#2563EB`.
- **Destructive**: Background `#FFE4E6`, text `#9F1239`, border 1px `#FDA4AF`, hover background `#FECDD3`.

### Badges & Status Chips
- Rendered with `rounded-lg`, font `label-sm`, padding `2px 8px`, border 1px.
- **Pending**: Background `#FEF3C7`, text `#92400E`, border `#FCD34D`.
- **Success / Approved**: Background `#D1FAE5`, text `#065F46`, border `#6EE7B7`.
- **Rejected / Failed**: Background `#FFE4E6`, text `#9F1239`, border `#FDA4AF`.

### System & Offline Banners
- Full-width or inline container, `rounded-xl`, padding 12px 16px.
- **Offline / Alert State**: Background `#FFFBEB`, text `#92400E`, border 1px `#FCD34D`. Contains a 16px Lucide `WifiOff` or `AlertTriangle` icon positioned left.

### Form Inputs & Selects
- Height 40px, padding `0 12px`, surface `#FFFFFF`, border 1px `#CBD5E1`, `rounded-lg`, font `body-md`.
- **Placeholder**: Color `#94A3B8`.
- **Focus**: Border color `#2563EB`, focus ring of 3px with `#EFF6FF`.
- **Error**: Border color `#FDA4AF`, text remains `#0F172A`, supporting label in `#9F1239`.

### Cards & Learning Modules
- Surface `#FFFFFF`, border 1px `#E2E8F0`, `rounded-xl`, elevation `shadow-sm`.
- Padding: Standard `space-lg` (24px), compact modules `space-md` (16px).
- Hoverable cards transition to `shadow-md` with border `#CBD5E1`.

### Selection Controls (Checkboxes & Radios)
- Checkboxes: 18x18px, `rounded` (4px), border 1.5px `#CBD5E1`. Checked state: background `#2563EB`, border `#2563EB`, checkmark icon in `#FFFFFF`.
- Radios: 18x18px, `rounded-full`, border 1.5px `#CBD5E1`. Checked state: border `#2563EB`, inner dot `#2563EB`.

### Tables & Academic Rosters
- Container: Surface `#FFFFFF`, border 1px `#E2E8F0`, `rounded-xl`, overflow hidden.
- Table Header: Background `#F8FAFC`, border-bottom 1px `#E2E8F0`, text `label-xs` in `#475569`.
- Table Rows: Alternating hover `#F8FAFC`, border-bottom 1px `#E2E8F0`, cell text `body-md` in `#0F172A`.