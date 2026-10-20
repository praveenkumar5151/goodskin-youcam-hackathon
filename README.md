# Goodskin

**Skincare, with context.** Goodskin is a consent-first skincare storefront prototype that connects YouCam AI Skin Analysis with a simple three-step product routine.

## What it demonstrates

- A responsive storefront with image selection, consent, photo guidance, and a working shopping bag.
- A server-side YouCam analysis flow. API credentials stay on the server, and submitted photos are held in memory rather than saved by this app.
- A bundled synthetic portrait for exploring the demo without using a real person's photo.

Analysis provides cosmetic observations, not a medical diagnosis. Sample products and prices are illustrative.

## Run locally

Requires Node.js 20+. Copy .env.example to .env, set YOUCAM_API_KEY, then run npm start and open http://localhost:4173. Keep .env private; it is ignored by Git.

See the source for setup, privacy notes, and API configuration.
