---
name: StudySync
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
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
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
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
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is built for StudySync, a focused, technical study and knowledge-synchronization platform. It targets students, researchers, and lifelong learners who need a distraction-free environment for organizing notes, tracking study sessions, and syncing materials across devices. The interface evokes calm precision, reliability, and intellectual clarity.

The aesthetic follows a **Minimalist** and **Corporate / Modern** technical UI direction:
- **Monochrome-first hierarchy:** Content and structure take precedence over decorative color, using crisp white surfaces, subtle off-white canvases, and high-contrast dark slate typography.
- **Flat, border-driven structure:** Visual separation relies on 1px solid hairline borders rather than drop shadows, keeping the interface lightweight and scannable.
- **Technical precision:** Monospace labels, tabular numerals, and Lucide icons (with zero emojis) reinforce a disciplined, tool-like character.

## Colors

The palette is strictly monochrome-first in light mode, reserving color exclusively for semantic state feedback:

- **Canvas & Surfaces:** Use `#F8F9FA` (or `#F4F5F7` for secondary recessed areas) as the primary application canvas, paired with `#FFFFFF` for elevated card surfaces and interactive containers.
- **Borders:** Use `1px solid #E2E8F0` for structural dividers, card outlines, and input borders.
- **Text & Primary Actions:** Use `#0F172A` (dark slate) for headings, primary body copy, and primary action fills. Use `#64748B` (muted slate) for secondary text, metadata, and inactive icons.

### Semantic State Feedback
- **Normal:** Neutral `#FFFFFF` surface with `#E2E8F0` border and `#0F172A` text.
- **Empty:** Muted `#F8F9FA` surface with a `1px dashed #CBD5E1` border and `#64748B` text.
- **Loading:** Neutral surface accompanied by a `#64748B` syncing spinner icon.
- **Error:** Subtle `#FEF2F2` background tint with `#DC2626` text, icon, and border accent.
- **Offline:** Subtle `#FFFBEB` background tint with `#D97706` text, icon, and border accent.
- **Success:** Subtle `#F0FDF4` background tint with `#16A34A` text, icon, and border accent.

## Typography

The design system pairs **Inter** for clean, utilitarian sans-serif headings and body copy with **JetBrains Mono** for technical labels, timestamps, sync statuses, and keyboard shortcuts.

- **Headlines:** Use tight negative letter-spacing (`-0.01em` to `-0.02em`) and semibold (`600`) weight to establish clear hierarchy without oversized display text.
- **Body Copy:** Default to `14px` (`body-md`) for dense study dashboards and `16px` (`body-lg`) for long-form reading or note views.
- **Monospace Labels:** Use `JetBrains Mono` in uppercase or sentence case for metadata tags, status badges, and counters. Enable `tabular-nums` on all timers, progress percentages, and numerical tables.

## Layout & Spacing

The layout uses a **12-column fluid grid** on desktop and tablet, collapsing to a **4-column fluid grid** on mobile. Content is structured into clean, modular cards with generous internal breathing room (`space-md` to `space-lg`) and consistent `1rem` (`16px`) gutters.

- **Desktop (>= 1024px):** 12-column grid with `1.5rem` (`24px`) outer margins and `1rem` (`16px`) gutters. Sidebars occupy 3 columns; primary study workspaces occupy 9 columns.
- **Tablet (640px – 1023px):** 8-column grid with `1.5rem` outer margins. Secondary panels stack below the primary workspace.
- **Mobile (< 640px):** 4-column grid with `1rem` outer margins. All multi-column card grids reflow into a single vertical stack with `space-md` gaps.

## Elevation & Depth

This design system uses **low-contrast outlines** and **tonal layering** with **zero drop-shadow clutter**.

- **Surface Separation:** Hierarchy is achieved by placing `#FFFFFF` cards onto the `#F8F9FA` canvas, bounded by `1px solid #E2E8F0` hairline borders.
- **Interactive Focus:** Hovering over interactive cards or rows shifts the border from `#E2E8F0` to `#CBD5E1` or applies a subtle `#F8F9FA` background tint—never a box shadow.
- **Overlays & Modals:** Popovers and modals use a `#FFFFFF` surface with a `1px solid #CBD5E1` border and a subtle backdrop scrim (`rgba(15, 23, 42, 0.25)`), maintaining the flat, crisp aesthetic.

## Shapes

The shape language is **Rounded** (`0.5rem` / `8px` default), balancing technical precision with approachable usability.

- **Cards & Containers:** Use `8px` (`0.5rem`) border radius.
- **Buttons, Inputs & Badges:** Use `6px` (`0.375rem`) border radius for compact controls and monospace status chips.
- **Pills & Avatars:** Reserve full rounding (`9999px`) strictly for circular status indicators or user avatars.

## Components

All components must use **Lucide icons** exclusively (16px default, `1.5px` stroke width) with **zero emojis**.

- **Buttons:**
  - *Primary:* `#0F172A` background, `#FFFFFF` text, `6px` radius, `0.5rem 1rem` padding. Hover shifts to `#1E293B`.
  - *Secondary:* `#FFFFFF` background, `1px solid #E2E8F0` border, `#0F172A` text. Hover shifts background to `#F8F9FA`.
  - *Ghost:* Transparent background, `#64748B` text, shifting to `#0F172A` on hover.
- **Chips & Status Badges:** Compact `6px` radius containers using `label-sm` (`JetBrains Mono`). Normal chips use `#F8F9FA` fill with `#E2E8F0` border; semantic states use their respective subtle background tints (`#FEF2F2`, `#FFFBEB`, `#F0FDF4`) and matching text/icon colors.
- **Lists:** Clean vertical stacks separated by `1px solid #E2E8F0` dividers. Each row uses `space-md` vertical padding and aligns metadata on the right in `label-md` monospace.
- **Checkboxes & Radio Buttons:** `16px × 16px` controls with `1px solid #CBD5E1` borders (`4px` radius for checkboxes, full circle for radios). Checked state fills with `#0F172A` and a `#FFFFFF` Lucide check icon.
- **Input Fields:** `#FFFFFF` background, `1px solid #E2E8F0` border, `6px` radius, `body-md` text, and `#64748B` placeholder text. Focus state applies a `1px solid #0F172A` border.
- **Cards:** `#FFFFFF` surface, `1px solid #E2E8F0` border, `8px` radius, `space-lg` (`1.5rem`) internal padding, and zero box shadow.
- **Sync & State Banners:** Full-width or inline containers with `6px` radius, `1px solid` semantic border, and a leading Lucide icon (`Loader2` spinning for Loading, `AlertCircle` for Error, `WifiOff` for Offline, `CheckCircle2` for Success). Empty states use a `1px dashed #CBD5E1` border on `#F8F9FA` with centered `#64748B` copy.