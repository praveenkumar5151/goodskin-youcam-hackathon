# Goodskin narrated product walkthrough

Current deliverable: `outputs/goodskin-demo-explained.mp4` — 2:29, 1080p, H.264 + AAC speech.

This is an edited walkthrough of actual current app screenshots, not a continuous screen recording. A fresh live YouCam analysis of the bundled synthetic portrait completed on 2026-10-21. No reconstructed product screen or fabricated result is used. Narration is synthetic (Kokoro voice af_sarah); captions are included.

## 0:00 — What should I explore first?

Choosing skincare online often starts with a wall of products. Goodskin starts with a simpler question: what would you like to understand about your skin before you decide what to explore?

## 0:12 — Meet Goodskin

Goodskin is a working skincare storefront prototype powered by YouCam Skin Analysis. Let's follow one shopper from a consent based check-in to a small routine, and see exactly where the AI adds value.

## 0:25 — Start with a photo

First, I choose the built-in synthetic sample. It is AI generated, so this public demo uses no real person's face. A shopper can also select their own clear, front-facing photo.

## 0:38 — Ask before sending

Before analysis, Goodskin explains that the photo will be sent to YouCam. The shopper must give consent and press Start my check-in. Goodskin does not save the photo.

## 0:49 — YouCam does the analysis

Behind that button, the Node server requests a signed upload, sends the image, starts YouCam's Skin Analysis task, and polls for completion. The API key stays on the server.

## 1:01 — Read the returned signals

Here is the actual result from this synthetic sample: an overall score of seventy-nine, with separate signals for acne, redness, moisture, texture, and pores. These cosmetic observations describe this image and can change with lighting. They are not a diagnosis.

## 1:19 — The shopper chooses the focus

Now I choose Comfort and hydration. Goodskin shows the returned moisture signal as context and highlights the sample cream. The shopper chooses this focus. A skin score does not diagnose a need or select a purchase.

## 1:34 — Keep the next step small

The routine is deliberately small: cleanser, moisturizer, and sunscreen. This connects the check-in to a manageable shopping decision, while leaving room for the shopper's preferences. Product names and prices are illustrative.

## 1:49 — Explore an item in the bag

I add Daily Comfort Cream to the bag. The subtotal updates to eight hundred and ninety-nine rupees. This demonstrates the storefront interaction. The prototype has no checkout and does not place an order.

## 2:02 — Clear the check-in

Finally, Clear check-in removes the photo preview and results from the page. The app returns to an unchecked consent step. There is no saved profile or check-in history in Goodskin.

## 2:15 — Skincare, with context.

Goodskin demonstrates a complete YouCam integration and an explainable retail journey: get consent, understand returned signals, choose a focus, and explore a simple routine. Goodskin. Skincare, with context.
