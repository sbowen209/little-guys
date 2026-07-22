// src/utils/assets.js
// Resolves a /public asset path against Vite's base URL so it works locally
// and under the /little-guys/ GitHub Pages sub-path.
export const assetUrl = (path = '') =>
  `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}`;