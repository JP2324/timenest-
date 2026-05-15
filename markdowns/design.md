# TimeNest Design System & Web App Aesthetics

This document outlines the design principles, color palette, typography, and component styling used in the TimeNest landing page. It serves as a reference for extending the application's UI.

## 1. Core Philosophy

- **Apple-esque Aesthetic**: Clean, spacious, and highly legible. Emphasizes content over Chrome.
- **Light Mode Only**: The interface is intentionally designed for a bright, clean look.
- **Soft Geometry**: Sharp corners are avoided. Extensive use of `rounded-2xl`, `rounded-3xl`, and `rounded-[2.5rem]` parameters create a friendly and premium feel.
- **Subtle Depth**: Elements use `backdrop-blur`, soft borders (`border-black/5`), and delicate drop shadows to establish hierarchy without heavy shadows.

## 2. Color Palette

The color system relies on high contrast for text and reserved, intentional use of the brand color.

- **Primary Brand (Maroon/Deep Red)**
  - `brand`: `#7A1B2D` (Primary buttons, accents, active states)
  - `brand-light`: `#9C273E` (Hover states)
  - `brand-soft`: `#F9EBEB` (Subtle backgrounds, tag backgrounds)

- **Neutrals (The Canvas)**
  - `paper`: `#F5F5F7` (Main application background, same as Apple's default light gray)
  - `surface`: `#FFFFFF` (Cards, elevated containers)
  
- **Typography (Ink)**
  - `ink`: `#1D1D1F` (Primary text, headings - soft black for readability)
  - `ink-muted`: `#86868B` (Secondary text, descriptions, placeholders)

## 3. Typography

- **Primary Font Family**: `Inter`, falling back to standard system sans-serifs (`-apple-system`, `BlinkMacSystemFont`).
- **Headings**: Use `font-semibold` or `font-medium` with `tracking-tight` (negative letter-spacing) to create a premium, authoritative look.
- **Body / Labels**: standard tracking, or `tracking-wide`/`tracking-widest` for small, uppercase labels to enhance legibility.

## 4. Layout & Spacing

- **Grid Background**: A subtle, semi-transparent grid pattern (`bg-grid-pattern`) is used in the hero backdrop to provide texture without overwhelming the content.
- **Light Gradients**: Large, heavily blurred colored orbs (opacity: `0.05` to `0.1`, blur: `100px`) sit in the background to provide warmth and visual interest.
- **Max Widths**: Content is sensibly constrained (e.g., `max-w-6xl`, `max-w-4xl`) to maintain comfortable reading lengths.

## 5. UI Components

### Navigation (Navbar)
- **Floating Pill**: The navbar floats near the top as a pill shape (`rounded-[2rem]`).
- **Scroll Behavior**: On scroll, it shifts to `backdrop-blur-xl`, `bg-white/70`, and a subtle `shadow-sm`, reducing padding slightly to sit out of the way.

### Buttons & Interactivity
- **Primary Fill**: Dark (`bg-ink`) or Brand (`bg-brand`), fully rounded caps (`rounded-full`).
- **Interactions**: Clickable elements leverage scaling transforms (`hover:scale-105 active:scale-95`) to feel physical and responsive to touch/click.

### Cards & Containers
- **Borders**: Distinct sections and cards are framed with very light borders (`border-black/5` or `border-black/10`).
- **Inner Padding**: High internal padding (`p-6`, `p-8`) gives text and inner components room to breathe.
- **Hover Effects**: Interactive cards lift up (`hover:-translate-y-1`) and gain stronger shadows (`hover:shadow-xl`) over a quick `duration-300` transition.

## 6. Motion & Animation
- Uses `motion/react` (Framer Motion) for sophisticated entrance and layout animations.
- **Entrances**: Elements gently slide up (`y: 20` to `y: 0`) while fading in.
- **Spring Physics**: Number dials (e.g., in the countdown timer) pop utilizing spring physics (`type: "spring", stiffness: 300, damping: 25`) for organic feeling increments.
