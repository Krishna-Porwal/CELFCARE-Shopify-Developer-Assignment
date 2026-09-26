# Data model — metafields & metaobjects

Create these in **Shopify Admin → Settings → Custom data** before wiring up the templates.

## 1. Metaobject: `ingredient`

Settings → Custom data → Metaobjects → Add definition.

| Field key       | Type                  | Notes                                             |
|-----------------|-----------------------|----------------------------------------------------|
| `name`          | Single line text      | e.g. "Matrixyl 3000"                              |
| `inci_name`     | Single line text      | e.g. "Palmitoyl Tripeptide-1"                     |
| `function`      | Single line text      | One of: Firming / Hydrating / Barrier support / Antioxidant (use a list.single_line_text_field with validation, or a dropdown-style metafield in a later version) |
| `description`   | Multi line text       | 1–2 sentence explanation                          |
| `image`         | File reference        | Square product-style shot                         |
| `used_in`       | List of product references | Links back to Page 1 product(s)              |

Add 8–10 entries here (Matrixyl 3000, Hyaluronic Acid, Niacinamide, Centella Asiatica, Peptide Complex, Vitamin C, Ceramide NP, Green Tea Extract...).

Each entry's handle should match `name | handleize` so `glossary-list.liquid`'s anchor IDs and `ingredient-cards.liquid`'s deep links line up automatically (e.g. "Matrixyl 3000" → `#matrixyl-3000`).

## 2. Product metafield: `custom.clinical_stats`

Settings → Custom data → Products → Add definition.

- **Type:** List of metaobjects (or JSON, if you don't want a second metaobject type)
- **Recommended approach:** a small `clinical_stat` metaobject with fields:
  - `value` (single line text) — e.g. "Non-irritant"
  - `label` (single line text) — e.g. "Patch tested per IS 4011:2018"
  - `source` (single line text, optional) — e.g. "In-house consumer study, n=42"

Attach 3 entries to the Serum Duo product. `clinical-proof.liquid` reads this list directly — no hard-coded copy.

## 3. Product metafield: `custom.key_ingredients`

- **Type:** List of metaobject references, pointing at the `ingredient` metaobject above.
- Pick the 4 ingredients you want featured on Page 1's ingredient cards. `ingredient-cards.liquid` reads this list and links each card to its glossary anchor.

## 4. Variants (create these products/variants in Admin)

| Product        | Variant     | Price  |
|----------------|-------------|--------|
| Serum Duo      | Duo         | ₹2,499 |
|                | InstaFirm only | ₹1,399 |
|                | InstaLift only | ₹1,399 |
| Refill pack    | 30-day refill | ₹999 |

Grab each variant's numeric ID (Admin → Product → Variant URL, or via the `product.variants` Liquid object) and paste them into the `quiz` section settings (`duo_variant_id`, `instafirm_variant_id`, `instalift_variant_id`) so the quiz result screen can recommend + add the right one.

## Why this shape

- Metaobjects keep ingredient content structured and reusable across Page 1 (cards) and Page 2 (glossary) without duplicating copy.
- Clinical stats as a metafield (not hard-coded Liquid) means a merchant can update patch-test claims without a code deploy — the brief explicitly calls this out.
- `used_in` as a reverse reference on the ingredient object avoids maintaining two separate "which ingredient is in which product" lists by hand.
