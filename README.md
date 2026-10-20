# Goodskin

**Skincare, with context.** Goodskin turns a skin check-in into a calmer shopping experience: a visitor can consent to a YouCam AI Skin Analysis, see cosmetic signals returned by the API, and explore a simple three-step routine.

![AI-generated synthetic demo portrait; not a real person's photo](https://raw.githubusercontent.com/praveenkumar5151/goodskin-youcam-hackathon/main/public/synthetic-sample.png)

## Why it exists

Online skincare shopping often starts with a long product list and little context. Goodskin begins with the customer's question, explains what an image-based check-in can and cannot tell them, and keeps the next step intentionally simple. The sample routine is educational storefront content, not a medical prescription.

## What the prototype includes

- Responsive storefront with photo selection, validation, consent, routine cards, and an add-to-bag interaction.
- Server-side YouCam AI Skin Analysis request flow using the [v2.0 File API](https://docs.perfectcorp.com/develop/quick_start_guide) and [v2.1 Skin Analysis API](https://docs.perfectcorp.com/reference/ai_skin_analysis/v2.1).
- Bundled AI-generated portrait so judges can explore photo selection without using a real person's image. Select the sample, review the consent notice, and start analysis manually.
- Results appear only when returned by YouCam. There are no fabricated fallback scores.

## Run locally

Requires Node.js 20 or later.

```sh
cp .env.example .env
# Set YOUCAM_API_KEY in .env. Keep this file private.
npm start
```

Open http://localhost:4173. The check-in accepts JPG, PNG, or WebP images up to 10 MB. Before upload, the browser prepares the image within the API dimensions (short side at least 480 px; long side at most 2560 px).

To enable live analysis, create and verify your YouCam API account through the India portal, redeem the hackathon promotion under **Account → Redeem Code**, and create an API key in the account console. Copy the **API Key** (not the separate Secret Key) into YOUCAM_API_KEY in .env. Never commit or paste the key into Devpost. The Secret Key is only needed for webhook signature verification.

The configured API origin is https://yce-api-01.makeupar.com, matching Perfect Corp's current API examples. Confirm the API server shown in your India account console before your first live request; use the server assigned to that account if it differs.

## Privacy and limitations

The photo is sent to YouCam for processing only after the visitor checks the consent box. Goodskin holds the image in memory for the request and does not write it to disk. YouCam's processing and retention terms still apply. Do not upload anyone else's photo without permission. This prototype offers cosmetic observations, not medical advice. Products and prices are illustrative and do not link to a retailer or place orders.

GET /api/health reports whether the API key is configured without exposing it.

## Hackathon submission

**Project name:** Goodskin  
**Tagline:** Skincare, with context.  
**Built with:** Node.js, HTML, CSS, JavaScript, YouCam AI Skin Analysis API  
**License:** MIT (see LICENSE).

The public repository includes the source, synthetic portrait, and demo outline. The integration should only be described as live-verified after a successful analysis run. A hosted app and public demo video still need to be added to the Devpost draft.

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the 90-second walkthrough outline.

## Judging fit

- **Implementation:** Connects YouCam's file upload and asynchronous Skin Analysis task flow to a retail experience.
- **Design:** Guides the customer from consent through results to a small product routine.
- **Impact:** Offers a first-time skincare shopper a guided starting point while setting expectations for image-based analysis.
- **Idea:** Connects an analysis moment to a useful commerce next step rather than presenting an isolated API demo.
