# Evaluating Goodskin

Goodskin explores a specific purchase decision: a skincare shopper in India already owns part of a routine and has a limited budget for missing steps. YouCam cosmetic observations provide context; the shopper's preferences, existing products, and prices determine the edit.

## Two evaluation paths

- **Public explorer (`docs/`):** A static app with a clearly labeled recorded example. Values are normalized transcriptions from the live synthetic-sample run shown in the competition video on 21 October 2026. It accepts no personal photos, has no upload endpoint, and makes no live YouCam request. The budget, ownership, filtering, comparisons, bag, and decision card run in the visitor's browser.
- **Live integration (`npm start`):** The Node build performs new YouCam analysis after consent. Set the API key privately in the server environment. The public 2:41 video demonstrates a fresh successful API run and the upgraded shopping workflow.

The explorer is a reliable way to inspect the shopping interaction, not a claim that GitHub Pages runs the server or provides fresh AI analysis.

## A three-minute walkthrough

1. Load the synthetic sample; acknowledge the recorded-example notice; view the recorded check-in. Expect overall 79, acne 82, redness 99, moisture 72, texture 79, and pore 65.
2. Choose **Comfort & hydration**. The moisture value appears as context; no score-to-product recommendation rule is applied.
3. With **₹1,500**, **Cleanser already owned**, **Lightweight**, and **Fragrance-free** checked, expect Light Comfort Gel ₹449 + Everyday SPF 30 ₹699 = **₹1,148**, with **₹352** remaining.
4. Change budget to **₹1,100**. Expect **₹48** shortfall and disabled Add. The app does not silently exceed the budget. Restore ₹1,500.
5. Add only missing steps. Expect two bag products and ₹1,148 subtotal. Remove the gel: ₹699. Close the bag and re-add the missing step: ₹1,148, without duplicate sunscreen.
6. Download the decision card. Clear the recorded check-in. The planner still works without image observations.

## How the live integration works

```mermaid
sequenceDiagram
    actor Shopper
    participant Browser
    participant Goodskin as Goodskin Node server
    participant YouCam
    Shopper->>Browser: Choose photo and consent
    Browser->>Goodskin: Photo, maximum 10 MB
    Goodskin->>YouCam: Initialize File API upload
    YouCam-->>Goodskin: Signed upload request
    Goodskin->>YouCam: Upload image bytes
    Goodskin->>YouCam: Create Skin Analysis task
    loop Until completion or timeout
        Goodskin->>YouCam: Poll task
        YouCam-->>Goodskin: Task state / returned result
    end
    Goodskin-->>Browser: Returned cosmetic observations
    Shopper->>Browser: Choose focus, budget, owned steps, preferences
    Browser->>Browser: Compare eligible sample prices; build edit
```

The credential stays on the Node server. This app does not write the image to disk. YouCam's own processing terms apply. Replacing or removing a photo invalidates previous displayed results and consent; a request already sent to YouCam can still finish there.

## Evidence and limits

- The current video shows a fresh response and actual captured browser interactions, with synthetic narration and captions. The source includes eight planner tests; their documented previous run passed. No new user-study evidence is claimed.
- Selecting the minimum price per missing step is sufficient for this catalog because eligibility constraints are independent between steps and prices are additive. It is an inspectable exact selection for this small sample catalog, not a trained recommender or a large optimization breakthrough.
- The case demonstrates a ₹349 smaller new-item sample total when the shopper retains the ₹349 cleanser step: ₹1,497 becomes ₹1,148. This is an arithmetic illustration, not evidence of real-world savings, conversion lift, or clinical benefit.
- Seven product names, prices, and attributes are illustrative. There is no retailer connection, checkout, or order placement.
- Independent shopper validation and a hosted server for new analysis are still pending. The recorded explorer, live Node source, and integration video have distinct roles.
