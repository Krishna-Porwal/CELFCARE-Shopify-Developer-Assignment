# CELFCARE — Shopify Developer Assignment

Starter implementation for the Serum Duo landing page, Ingredient Glossary, and Skin
Consultation quiz, built on Dawn (Online Store 2.0).

> **Note on how this was built:** this repo is a strong starting skeleton — real Liquid
> sections, vanilla JS, JSON templates and a proposed data model — written to match the
> brief's architecture requirements. Before submitting, you still need to: create the
> actual dev store, install Dawn, wire these files in through `shopify theme dev`, create
> the products/variants/metaobjects listed in `docs/data-model.md`, and test everything
> end-to-end (cart edge cases, Lighthouse, keyboard nav). Treat this as the code half of
> the assignment — the setup, testing and Figma file are still yours to do.

## 1. Setup

```bash
# 1. Install Shopify CLI if you don't have it
npm install -g @shopify/cli @shopify/theme

# 2. Auth + create/connect a dev store via your Partner account
shopify auth login
shopify theme dev --store your-dev-store.myshopify.com

# 3. Pull Dawn as your base theme (from Shopify's GitHub, or "Add theme" in Admin)
git clone https://github.com/Shopify/dawn.git celfcare-dawn
cd celfcare-dawn

# 4. Copy this repo's sections/, snippets/, assets/, templates/ into the matching
#    Dawn folders (they don't overwrite Dawn's own files — these are net-new).

# 5. Run locally with hot reload
shopify theme dev
```

Then in Admin:
1. Create the products/variants and set up metafields/metaobjects — see `docs/data-model.md`.
2. Create a page for the glossary (`/pages/ingredient-glossary`) and assign template `page.glossary`.
3. Create a page for the quiz (`/pages/skin-quiz`) and assign template `page.quiz`.
4. On the Serum Duo product, assign template `product.serum-duo`.
5. In the Theme Editor, fill in each section's settings (product pickers, IDs, copy).
6. Include `{% render 'cart-drawer' %}` once in `theme.liquid`, right before `</body>`.

## 2. File structure

```
sections/
  serum-hero.liquid       Page 1 hero: gallery, variant/bundle selector, buy-box upsell, sticky ATC
  clinical-proof.liquid   Page 1: 3 stat cards, driven by custom.clinical_stats metafield
  ingredient-cards.liquid Page 1: 4 ingredient cards from custom.key_ingredients metafield
  how-to-use.liquid       Page 1: reorderable AM/PM routine steps (theme blocks)
  faq-accordion.liquid    Page 1: accessible accordion (5 Q&A blocks)
  glossary-list.liquid    Page 2: full ingredient list + client-side search/filter
  quiz.liquid             Page 3: 4-step quiz with progress bar + result/recommendation
snippets/
  cart-drawer.liquid      Shared slide-out cart, free-shipping progress bar
assets/
  serum-duo.js / .css     Gallery, variant switching, bundle add-to-cart, sticky bar
  cart-drawer.js          /cart.js, /cart/change.js, focus trap, Esc to close
  faq-accordion.js        Accessible expand/collapse + arrow-key navigation
  glossary.js / .css      Search + function filter, deep-link anchors
  quiz.js / .css          Step logic, recommendation engine, cart-attribute save
templates/
  product.serum-duo.json
  page.glossary.json
  page.quiz.json
docs/
  data-model.md           Metafield + metaobject definitions to create in Admin
```

## 3. Data model (summary — full detail in docs/data-model.md)

- **`ingredient` metaobject**: name, INCI name, function, description, image, `used_in` (product references). Powers both the glossary and the product-page ingredient cards from one source of truth.
- **`custom.clinical_stats`** (product metafield, list of a small `clinical_stat` metaobject): value/label/source — so clinical claims are editable by a merchant, not hard-coded in Liquid.
- **`custom.key_ingredients`** (product metafield, list of metaobject references): which 4 ingredients show on Page 1, linking to their glossary anchor.

## 4. Backend / API notes

- Quiz answers are saved via `POST /cart/update.js` with `attributes` (age, concern, skin
  type, routine) — no reload, and they carry through to the order automatically. This
  satisfies the "logged-out" path in the brief.
- **Bonus not yet implemented**: for the "logged-in" path (tag/note/metafield on the
  customer), the correct approach is a **Shopify app proxy** — a small serverless endpoint
  (Cloudflare Worker / Vercel function) registered at e.g. `/apps/quiz-result`, that the
  quiz JS calls after submit. That endpoint uses the **Admin API** (with a private app
  access token, never exposed client-side) to write a customer metafield or tag. I did not
  wire this up here since it needs its own auth/hosting outside the theme repo — flagging
  it explicitly per the brief's instruction to explain any server code rather than skip it
  silently.

## 5. UX rationale (5–8 bullets — expand/edit in your own words before submitting)

- **Price + Add to Cart above the fold on mobile**: hero grid puts gallery first, buy-box
  immediately after, so a 375px viewport sees product, price and CTA without scrolling.
- **Variant pills over a dropdown**: bundle vs. single-product choice is the single most
  important decision on the page — pills make all three options simultaneously visible
  and comparable, a dropdown would hide two of three choices.
- **Sticky ATC bar appears only after the primary button scrolls away** (via
  IntersectionObserver, not a scroll-position hack) — avoids a persistent bar competing
  with the real one on first screen.
- **Clinical stats and ingredients from metafields, not hard-coded** — mirrors the brief's
  "science journal, not beauty influencer" tone: a merchant can update a clinical claim
  without a developer, which also makes claims easier to keep accurate/compliant.
- **One accent color, one serif + one sans** — restrained palette keeps it feeling clinical
  rather than "beauty ad," per the brief's visual direction.
- **Quiz as one question per screen with a progress bar**, not a single long form — lowers
  perceived effort and works better on mobile; the Back button avoids the classic "start
  over" quiz frustration.
- **Cart attributes over a customer account requirement for the quiz** — most first-time
  visitors are not logged in; gating personalization behind login would break the funnel
  for the majority of shoppers.

**What I'd A/B test first:** whether the bundle upsell checkbox converts better as a
checkbox in the buy-box (current) vs. a post-add-to-cart interstitial ("add this for
₹999?") — the interstitial usually lifts attach rate but adds a step.

## 6. What I'd improve with more time

- Real product image galleries with zoom-on-tap, not just swipeable slides.
- Server-rendered structured data validation (test Product JSON-LD in Google's Rich
  Results Test once real product data is in).
- A proper Shopify Function for the bundle discount logic instead of just bundling two
  line items (so the Duo + refill shows as a clean single discounted line at checkout).
- Automated Lighthouse CI run per commit instead of a single manual screenshot.
- Unit-ish tests for `quiz.js`'s recommendation logic (currently just a small pure
  function, `recommend()` — easy to test but not yet covered).

## 7. AI tools used

Drafted the initial section/JS/CSS scaffolding with Claude, then reviewed and adjusted
against the brief's specific requirements (Ajax Cart API usage, ARIA patterns, metafield
naming). Data model and UX rationale were written to match Dawn's actual conventions;
verify field names/IDs match what you actually create in Admin before final submission.
