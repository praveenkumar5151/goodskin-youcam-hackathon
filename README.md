# Goodskin

**Skincare, with context.** Goodskin turns a skin check-in into a calmer shopping experience: a visitor can consent to a YouCam AI Skin Analysis, see a small set of cosmetic signals, then choose what matters to them before exploring a simple routine.

## Why it exists

Online skincare shopping often starts with a long list of products and little context. Goodskin adds a decision step between analysis and shopping: people choose their own focus, can see a matching returned signal when available, and get one illustrative item highlighted. A score never assigns a concern or decides what someone should buy. The sample routine is educational storefront content, not a medical prescription.

## Prototype status

- Responsive, accessible single-page storefront with photo selection, validation, consent, a routine shelf, and a working add-to-bag interaction. Before upload, the browser checks the minimum image dimension, scales oversized photos to YouCam's documented limit, and converts WebP to JPEG.
- Server-side YouCam AI Skin Analysis request flow uses the [v2.0 File API](https://docs.perfectcorp.com/develop/quick_start_guide) and [v2.1 Skin Analysis API](https://docs.perfectcorp.com/reference/ai_skin_analysis/v2.1). The browser sends the selected photo to this app; the server initializes YouCam's file upload, uploads directly to the signed URL, starts a task, and polls for the result. A bundled AI-generated synthetic portrait lets judges explore the flow without using a real person's photo. Select it, review the consent notice, and start the analysis manually.
- The API key is read from server environment variables. The image is held in memory for the request and is not written to disk by this app.
- Results are shown only when returned by YouCam. There are no fabricated fallback scores. `/api/health` reports whether the API key is configured without exposing it.
- The shopper chooses a temporary focus (keep it simple, comfort, texture, or sun care). When a matching API signal exists it is shown with its original value and a plain-language limit; otherwise Goodskin says none was returned. The matching illustrative routine item is highlighted by that shopper-selected focus, not by a score. The choice and result stay in the current page only.
- **Privacy control:** “Clear check-in” removes the selected photo preview and results from the current page and returns to the consent step. Goodskin stores no profile or history.

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

**Description:** Goodskin is a calmer way to move from a skin check-in to a shopping decision. With explicit consent, a visitor can use YouCam AI Skin Analysis with a real photo or a bundled AI-generated sample. Goodskin shows returned cosmetic signals with their limits, then asks the shopper what matters today. That self-chosen focus can highlight a matching item in a deliberately small routine; an AI score never diagnoses, assigns a need, or decides what to buy. A one-click clear control removes the photo and results from the page. The API key stays server-side, and Goodskin does not save photos, profiles, or check-in history. Product names and prices are illustrative; there is no checkout.

**Narrated demo:** [`outputs/goodskin-demo-explained.mp4`](outputs/goodskin-demo-explained.mp4) is the current demo (2:29, 1920×1080, H.264 video and AAC speech). It explains the shopper problem, the YouCam API workflow, the live result, the shopper-selected focus, and the illustrative routine and bag. Product screens are captured from the current app after a fresh successful India-region synthetic-sample analysis; no reconstructed product screen is used. It is an edited screen walkthrough with synthetic narration and embedded captions. The [transcript](outputs/goodskin-demo-explained-transcript.txt), [caption file](outputs/goodskin-demo-explained.srt), and [local preview page](outputs/goodskin-demo-preview.html) are included. Before final submission, upload this MP4 to YouTube, Vimeo, or Youku and add its public URL to the Devpost draft. The local app and preview are not public hosted links.

### Narrated walkthrough (2:29)

1. **0:00 — What should I explore first?**
2. **0:12 — Meet Goodskin**
3. **0:25 — Start with a photo**
4. **0:38 — Ask before sending**
5. **0:49 — YouCam does the analysis**
6. **1:01 — Read the returned signals**
7. **1:19 — The shopper chooses the focus**
8. **1:34 — Keep the next step small**
9. **1:49 — Explore an item in the bag**
10. **2:02 — Clear the check-in**
11. **2:15 — Skincare, with context.**

## Judging fit

- **Implementation:** The official YouCam file and Skin Analysis task workflow is implemented in the server; this submission should only be described as live-verified after a successful analysis run.
- **Design:** A complete, responsive customer journey from consent through result to product discovery.
- **Impact:** Gives a first-time skincare shopper a guided starting point while setting appropriate expectations for image-based analysis.
- **Idea:** Adds a shopper-controlled decision step between analysis and a small product edit; the score provides context while the shopper remains in charge.
- **Validation status:** This is a prototype and a product hypothesis. No external user study or purchase-conversion result is claimed yet. A next validation round should ask a few first-time skincare shoppers to compare the current flow with an undirected product catalog, then record whether they can explain the signal limits and choose a routine they feel comfortable exploring.
