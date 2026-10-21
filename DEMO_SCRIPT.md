# Goodskin competition demo

Current deliverable: `outputs/goodskin-competition-demo.mp4` — 2:41, 1080p, actual captured app interactions with synthetic narration.

GOODSKIN — COMPETITION DEMO

Actual browser capture of the upgraded app, 21 October 2026.
Captured at approximately 5 fps using supported tab screenshots; encoded at 24 fps. Idle endings trimmed; observed final states held for narration. No reconstructed app screens.
Synthetic face; fresh real YouCam India API result. Synthetic narration: Kokoro-82M / af_sarah, model Apache 2.0; kokoro-onnx runtime MIT.
No human validation or conversion claim.

00:00:00,000 — The decision: what do I actually need to buy?
A shopper has fifteen hundred rupees and already owns cleanser. What should they buy next? Goodskin combines a You Cam skin check-in with a routine planner that starts with what they already own.

00:00:11,946 — 1 / A synthetic sample. Explicit consent.
Here is the actual working app. I select the built-in synthetic face, then explicitly consent before starting analysis. This public demonstration uses no real person's face. Goodskin sends the image to You Cam and does not save a photo or profile.

00:00:28,917 — 2 / A real YouCam API response
The server requests a signed upload, uploads the image, starts the Skin Analysis task, and polls for completion. The credential stays on the server. This fresh response returns an overall score of seventy-nine and five cosmetic signals. These are observations about one image, not a diagnosis.

00:00:48,917 — 3 / The shopper chooses the focus
I choose Comfort and hydration. The returned moisture score of seventy-two is shown as context. The shopper stays in control: this score does not decide which product to buy. Their preferences and budget do.

00:01:02,911 — 4 / Keep cleanser. Fit the missing steps.
Now I mark cleanser as already owned and choose a lightweight texture. With the fragrance-free filter on, the planner compares matching combinations in our seven-item sample catalog. Gel and sunscreen total eleven hundred and forty-eight rupees. That leaves three hundred and fifty-two rupees, with no duplicate cleanser to buy.

00:01:23,774 — 5 / A smaller budget reveals the gap
What if the budget is only eleven hundred rupees? The app shows a forty-eight rupee gap and disables Add. It explains that this is the cheapest matching combination, so the shopper can change preferences or reconsider the missing steps.

00:01:39,102 — 6 / Add only what is missing
I restore the budget and add only the missing steps. The bag contains gel and sunscreen for eleven hundred and forty-eight rupees. The cleanser stays out. This is a working prototype bag, with no checkout or orders.

00:01:53,823 — 7 / Remove, reconsider, and re-add safely
Removing the gel brings the subtotal to six hundred and ninety-nine rupees. Adding the missing steps again restores the gel without duplicating the sunscreen already in the bag. The interaction keeps the purchase decision reversible.

00:02:09,044 — 8 / Explain the choice
Each item explains its price and preference match. A downloadable decision card is available, without the photo or credential. All product names, prices, and attributes here are illustrative; this is a catalog sandbox.

00:02:24,388 — Goodskin / Check in. Reuse. Choose within budget.
Our proposal for skincare retail is simple: understand the context, reuse what you have, and make the cost of the next step explicit. The integration works; the planner has eight passing tests. Real shopper feedback is our next validation step.

