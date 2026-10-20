# Goodskin

**Skincare, with context.** Goodskin turns a skin check-in into a calmer shopping experience: a visitor can consent to a YouCam AI Skin Analysis, see a small set of cosmetic signals, and explore a simple three-step routine.

## Why it exists

Online skincare shopping often starts with a long list of products and little context. Goodskin begins with the customer's question, explains what an image-based check-in can and cannot tell them, and keeps the next step intentionally simple. The sample routine is educational storefront content, not a medical prescription.

## Prototype status

- Responsive, accessible single-page storefront with photo selection, validation, consent, a routine shelf, and a working add-to-bag interaction. Before upload, the browser checks the minimum image dimension, scales oversized photos to YouCam's documented limit, and converts WebP to JPEG.
- Server-side YouCam AI Skin Analysis request flow uses the [v2.0 File API](https://docs.perfectcorp.com/develop/quick_start_guide) and [v2.1 Skin Analysis API](https://docs.perfectcorp.com/reference/ai_skin_analysis/v2.1). The browser sends the selected photo to this app; the server initializes YouCam's file upload, uploads directly to the signed URL, starts a task, and polls for the result. A bundled AI-generated synthetic portrait lets judges explore the flow without using a real person's photo. Select it, review the consent notice, and start the analysis manually.
- **Live integration verified:** On 2026-10-20, the bundled synthetic portrait completed a live YouCam Skin Analysis task through Goodskin. The UI displayed the returned individual signals and overall score. The sample is framed as a close-up to meet the API's face-size requirement.
- The API key is read from server environment variables. The image is held in memory for the request and is not written to disk by this app.
- Results are shown only when returned by YouCam. There are no fabricated fallback scores. `/api/health` reports whether the API key is configured without exposing it.

## Run locally

Requires Node.js 20 or later.

```sh
cp .env.example .env
# Set YOUCAM_API_KEY in .env. Keep this file private.
npm start
```

To enable live analysis, create and verify your YouCam API account through the India portal, redeem the promotion from the email under **Account → Redeem Code**, then create an API key in the account console. Copy the **API Key** (not the separate Secret Key) into `YOUCAM_API_KEY` in your local `.env` file; never commit or paste it into Devpost. The Secret Key is only needed if you later configure webhook signature verification.

Open <http://localhost:4173>. The check-in accepts JPG, PNG, or WebP files up to 10 MB. The browser prepares an API upload with a short side of at least 480 px and a long side no greater than 2560 px. The configured API origin, `https://yce-api-01.makeupar.com`, matches the server in Perfect Corp's current API examples. Confirm the API server shown in your India account console before the first live request; use the server assigned to that account if it differs.

## Privacy and limitations

The photo is sent to YouCam for processing after the user checks the consent box. Goodskin does not persist the image, but the YouCam API's own processing and retention terms apply. Do not upload anyone else's image without permission. This prototype offers cosmetic observations, not medical advice. The routine products and prices are illustrative and do not link to a retailer or place orders.

## Hackathon submission draft

**Project name:** Goodskin  
**Tagline:** Skincare, with context.  
**Built with:** Node.js, HTML, CSS, JavaScript, YouCam AI Skin Analysis API

**License:** MIT (see `LICENSE`).

**Description:** Goodskin is a skincare shopping experience that starts with the customer's skin concerns instead of a product catalog. With clear consent, a visitor uploads a selfie for YouCam AI Skin Analysis. Goodskin presents returned cosmetic signals beside an explanation of the limits of photo-based analysis, then offers a deliberately simple three-step routine. The flow connects AI analysis to a useful retail next step without treating a cosmetic score as a diagnosis. The prototype keeps the YouCam credential server-side and does not store submitted photos.

**Submission assets:** Source, synthetic portrait, and demo outline are included. The public source repository is [github.com/praveenkumar5151/goodskin-youcam-hackathon](https://github.com/praveenkumar5151/goodskin-youcam-hackathon). A hosted app URL and publicly viewable demo video still need to be added to the Devpost draft.

### Demo outline (about 90 seconds)

1. **0:00–0:12** — Introduce the problem: skincare shoppers get too many product choices without enough context.
2. **0:12–0:28** — Open Goodskin and explain the consent-first skin check-in and photo guidance.
3. **0:28–0:48** — Select the bundled synthetic portrait, review the YouCam consent, and start the check-in.
4. **0:48–1:05** — Review the returned signals and explain the disclaimer: this is not a diagnosis and results depend on the photo.
5. **1:05–1:20** — Explore the three-step routine and add an item to the bag.
6. **1:20–1:30** — Close on the product idea: less guessing and a smaller, clearer next step.

## Judging fit

- **Implementation:** The official YouCam file and Skin Analysis task workflow is implemented in the server and has completed a live synthetic-image analysis successfully.
- **Design:** A complete, responsive customer journey from consent through result to product discovery.
- **Impact:** Gives a first-time skincare shopper a guided starting point while setting appropriate expectations for image-based analysis.
- **Idea:** Connects a skin-analysis moment to a low-friction routine rather than presenting an isolated API demo.
