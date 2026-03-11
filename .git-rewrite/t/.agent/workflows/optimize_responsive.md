---
description: Optimize website for responsiveness, performance, and UI polish
---

## Overview
This workflow outlines the steps to make the existing Next.js website fully responsive, mobile‑first, and performant while preserving the visual identity.

### Prerequisites
- Ensure the project builds with `npm run dev`.
- The project already uses Tailwind CSS (imported in `src/app/globals.css`).
- Node.js and npm are installed.

## Steps
1. **Add Tailwind configuration**
   ```bash
   // turbo-all
   npx -y tailwindcss@latest init -p --full
   ```
   - Extend the default breakpoints to include `xs` (320px) and `2xl` (1536px).
   - Enable `aspectRatio` and `lineClamp` plugins.

2. **Refactor global styles** (`src/app/globals.css`)
   - Replace custom fluid typography with Tailwind utilities where possible.
   - Ensure all spacing uses `rem`/`%`/`vw` tokens defined in `:root`.
   - Add `@layer utilities` for custom glassmorphism and gradient helpers.

3. **Replace raw `<img>` tags with Next.js `<Image>`**
   - Search for all `<img` occurrences in `src`.
   - For each, import `Image` from `next/image` and rewrite:
     ```tsx
     <Image src={src} alt={alt} width={width} height={height} className="..." loading="lazy" />
     ```
   - Provide explicit `width`/`height` or `fill` with `object-cover`.
   - Add `sizes` attribute for responsive image selection.

4. **Responsive layout adjustments**
   - Review all components (`Leaderboard.tsx`, `EventGrid.tsx`, `MissionCard`, etc.)
   - Replace hard‑coded widths/heights (`w-[300px]`, `h-[200px]`) with Tailwind responsive classes (`w-full md:w-1/2 lg:w-1/3`).
   - Ensure containers use `flex`/`grid` with `gap` utilities that adapt (`gap-4 md:gap-8`).
   - Verify padding/margin use `p-4 md:p-8` patterns.

5. **Typography scaling**
   - Use Tailwind’s `text-base`, `text-lg`, `md:text-xl`, etc., combined with the custom CSS variables already defined (`--fs-h2`, `--fs-h3`).
   - Add `leading-relaxed` and `tracking-wide` where appropriate.

6. **Performance enhancements**
   - Enable `next/image` static optimization.
   - Add `loading="lazy"` to any remaining `<img>`.
   - Add `prefetch` for critical routes in `next/link`.
   - Reduce layout shifts by specifying explicit dimensions for all media.
   - Add `will-change` and `transform` utilities to animated elements.

7. **Accessibility checks**
   - Ensure all interactive elements have a minimum touch target of 48 dp (`min-h-[48px]`).
   - Verify color contrast using the defined palette.
   - Add `aria-label` where icons are used as buttons.

8. **Testing**
   - Run `npm run dev` and open the site on multiple viewports (mobile, tablet, laptop, ultra‑wide).
   - Use Chrome Lighthouse to verify performance, accessibility, and best‑practice scores.
   - Fix any reported CLS (Cumulative Layout Shift) issues.

9. **Commit changes**
   - Stage all modified files.
   - Commit with message `chore: responsive & performance optimization`.

## End of Workflow

You can now follow these steps sequentially. The `// turbo-all` annotation on step 1 will automatically run the Tailwind init command.
