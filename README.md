# Pixel Portfolio (My Pixel Village)

A small Next.js pixel-art portfolio / demo built with the App Router, Tailwind CSS, and simple sprite-based character & NPC logic.

Quick links:
- Main page and NPC logic: [`SPRITE_CONFIG`](app/page.tsx) & [`CitizenData`](app/page.tsx) in [app/page.tsx](app/page.tsx)
- Player character component: [`Character`](components/Character.tsx) in [components/Character.tsx](components/Character.tsx)
- Tailwind sprite animation config: [tailwind.config.js](tailwind.config.js)
- App layout and global styles: [app/layout.tsx](app/layout.tsx) and [app/globals.css](app/globals.css)
- Project metadata / scripts: [package.json](package.json)

Getting started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```
Open http://localhost:3000

Build and production
```bash
npm run build
npm run start
```

Project notes
- Sprites / assets live under public/assets. Replace or add images there to customize visuals.
- NPC behavior is implemented in [app/page.tsx](app/page.tsx) (see [`CitizenData`](app/page.tsx) and movement loop).
- The on-page player uses scroll velocity to animate and flip the sprite—see [`Character`](components/Character.tsx).
- Sprite sheet animation is driven by keyframes/animation settings in [tailwind.config.js](tailwind.config.js).

Contributing
- Feel free to open PRs for fixes, performance improvements, or new pixel-art assets.
- Keep pixel rendering sharp by using `image-rendering: pixelated` (already used in CSS).

License
- MIT
