# Goodskin demo video script

Target length: about 90 seconds. Capture the app in a browser at desktop width. Use only the bundled AI-generated synthetic portrait. The live result was verified on 2026-10-20; read only values visible in the current result screen.

## 0:00–0:12 — The idea

**On screen:** Open Goodskin at the hero, then scroll to the check-in.

**Voiceover:** “Skincare shopping can start with too many products and too little context. Goodskin starts with a simple check-in, then gives the shopper one calm next step.”

## 0:12–0:28 — Photo choice and consent

**On screen:** Choose “Try a synthetic sample.” Point out the AI-generated label and the unchecked consent box. Check the consent box only after the disclosure is visible.

**Voiceover:** “For this demo I’m using a synthetic portrait, not a real person’s photo. Goodskin explains that the photo is sent to YouCam for analysis and asks for consent before the check-in starts.”

## 0:28–0:58 — YouCam result and integration

**On screen:** Start the check-in and wait for the live YouCam result. Briefly show an overlay or caption with the flow: `YouCam File API → signed image upload → Skin Analysis task → status polling`. Show the returned score and signals without editing or inventing values.

**Voiceover:** “The browser sends the photo to Goodskin’s server after consent. The server requests an upload from YouCam’s File API, sends the image to the signed upload URL, starts a Skin Analysis task, and polls for the result. The API key stays on the server. Here are the signals YouCam returned: [name only visible results]. They are cosmetic observations, not a diagnosis, and lighting or photo choice can affect them.”

## 0:58–1:16 — A useful next step

**On screen:** Scroll to the three-step routine and add one item to the bag. Open the bag to show the illustrative subtotal and no-checkout note.

**Voiceover:** “The result leads to a short, illustrative routine rather than an endless catalog. The bag is only a prototype interaction—there is no checkout or purchase.”

## 1:16–1:30 — Close

**On screen:** Return to the Goodskin wordmark or routine shelf.

**Voiceover:** “Goodskin connects a consent-first skin check-in to a simpler shopping experience, while keeping the limits of photo-based analysis clear.”

## Upload checklist

- Replace bracketed narration with the values visible in the successful live YouCam response.
- Keep the video public and playable without sign-in when adding it to Devpost.
- Do not include API keys, account screens, or private credentials in the recording.
