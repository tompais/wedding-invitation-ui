# Copilot Instructions: Invitación Digital de Boda

## Project Overview

This is a single-page React wedding invitation website for Angie & Tomi's July 2026 wedding. The site presents two events (civil ceremony and party) with RSVP functionality, photo gallery, and guest information.

## Architecture

### Component Structure

- **Single-page layout**: All components render sequentially in [App.jsx](../src/App.jsx) without routing
- **Component pattern**: Each component has its own directory with `.jsx` + `.css` files
- **Composition**: `InfoCards` wraps three sub-components (`DressCode`, `Tips`, `Gifts`) for modular info sections

### Styling System

- **Color palette** (defined in [index.css](../src/index.css)):
  - Burgundy scale: `--bourdeaux-dark` (#5A1F28), `--bourdeaux` (#722F37), `--bourdeaux-light` (#8B4450)
  - Cream scale: `--hueso` (#FAF0E6), `--hueso-dark` (#F5E6D3)
  - Text: `--text-dark`, `--text-muted`, `--text-light`
- **Mobile-first approach**: Base styles in component CSS files, responsive overrides in [responsive.css](../src/responsive.css) with `@media (max-width: 768px)`
- **⚠️ CRITICAL**: All CSS MUST use CSS variables. NEVER hardcode colors like `#2b3f66` or reference legacy variables (`--blue-cold`, `--blue-night`, `--white-soft`)

## Key Patterns

### Button Styling Convention

All buttons should use the burgundy/cream color scheme:

```css
button {
  background-color: var(--bourdeaux);
  color: var(--hueso);
  border: 1px solid var(--hueso);
}
button:hover {
  background-color: var(--bourdeaux-light);
}
```

### Color Usage by Component Type

- **Dark backgrounds** (Hero, Footer, EventInfo blocks, RSVP, InfoCards): Use `var(--bourdeaux)` or `var(--bourdeaux-dark)`
- **Light backgrounds** (Intro, Gallery, Album, main EventInfo section): Use `var(--hueso)` or `var(--hueso-dark)`
- **Text on dark**: Use `var(--text-light)` or `var(--hueso)`
- **Text on light**: Use `var(--text-dark)` or `var(--text-muted)`
- **Headings**: `var(--bourdeaux-dark)` on light backgrounds, `var(--hueso)` on dark

### Animation Usage

- Lottie animations via `lottie-react` package
- Animation files stored in `src/assets/animatios/` (note: typo in directory name, keep as-is)
- Example: [EventInfo.jsx](../src/components/EventInfo/EventInfo.jsx) uses `rings.json` for decorative rings animation
- **Framer Motion**: All components use scroll-triggered animations via custom `useScrollAnimation` hook
- Animation pattern: fade-in + slide-up on viewport entry (duration: 0.6-0.8s)
- Progressive delays for cascading effect (0.2s increments)
- Hero has staged animations: phrase → names → divider → date

### Image Paths

- Images in `src/assets/images/` referenced as `/src/assets/images/filename.ext`
- ⚠️ These paths work in dev but may need adjustment for production build (use Vite's import syntax)

## Development Workflow

### Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Tech Stack

- React 19.2.0 (no TypeScript)
- Vite 7.2.4 for build tooling
- ESLint with React Hooks + React Refresh plugins
- Lottie React for animations
- Framer Motion for scroll animations and transitions
- Google Fonts: Playfair Display (display) + Lora (body)

## Component Responsibilities

| Component   | Purpose                                                                  | State                           |
| ----------- | ------------------------------------------------------------------------ | ------------------------------- |
| `Hero`      | Landing section with couple names, date, romantic phrase                 | Static                          |
| `Intro`     | Brief introduction to wedding style                                      | Static                          |
| `EventInfo` | Two event blocks (Civil + Party) with dates, locations, Lottie animation | Static (buttons non-functional) |
| `Gallery`   | Horizontal scrolling photo carousel                                      | Static (4 photos)               |
| `RSVP`      | Guest confirmation form                                                  | ⚠️ No backend integration yet   |
| `InfoCards` | Container for DressCode, Tips, Gifts                                     | Static                          |
| `Album`     | External link to Google Photos album                                     | Static                          |
| `Footer`    | Closing message                                                          | Static                          |

## Responsive Design

- **Breakpoints**:
  - Desktop: Default styles (1025px+)
  - Tablet: `@media (min-width: 769px) and (max-width: 1024px)` in [responsive.css](../src/responsive.css)
  - Mobile: `@media (max-width: 768px)` in [responsive.css](../src/responsive.css)
  - Small mobile: `@media (max-width: 480px)` in [responsive.css](../src/responsive.css)
- **Mobile-specific adjustments**:
  - Event buttons stack vertically (`flex-direction: column`)
  - Info cards max-width 340px
  - Gallery images reduce to 220px height
  - Forms use full width with adjusted padding

## Known Limitations & TODOs

1. **RSVP form has no backend** - Currently just UI, needs form handler or service integration
2. **Event location buttons** - "Ver ubicación" buttons in EventInfo are non-functional
3. **Image optimization** - Gallery images not optimized, using mixed formats (jpg/png/jpeg)
4. **No form validation** - RSVP inputs lack validation logic

## Content & Copy Guidelines

- Tone: Casual, warm, personal (using "vos" Argentine Spanish form)
- Emoji usage: Minimal (🌿 for outdoor, 🤍 for heart, 📸 for photos)
- Event details intentionally vague on exact dates ("Julio 2026") - update when finalized
