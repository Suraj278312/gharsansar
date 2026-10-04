# Ghar Sansar — complete website source

This folder contains the published forest-green and ivory website, its product images, catalog, page components, fonts configuration, and scroll/reveal animations.

## Run locally
1. Install Node.js 22.13 or newer, with npm.
2. Extract this ZIP and open the ghar-sansar folder in VS Code.
3. Open a terminal in that folder and run:

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal (normally http://localhost:5173).

## Build
```sh
npm run build
```

## Main files
- app/globals.css — colors, typography and animation styles
- components/store/storefront.tsx — storefront pages and controls
- components/store/use-store-motion.ts — scroll movement and staggered reveals
- lib/store/catalog.ts — sample product catalog
- lib/store/config.ts — delivery and fee settings
- public/images — bundled photography

This is a demo storefront: orders and accounts use browser-local storage; payments are simulated. Fonts load from Google Fonts and require an internet connection. See README.md for the demo behavior and launch requirements.

Installed dependencies and generated build caches are excluded; npm ci restores dependencies from the included lockfile.
