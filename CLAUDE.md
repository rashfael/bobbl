# Bobbl — Ice Cream Formulation Calculator

## Project Goal

Personal SPA tool for composing gelato/ice cream recipes from a YAML ingredient database. Users pick a type (Milcheis, Sorbet, etc.), add ingredients with gram amounts, and see computed parameters (TS%, fat%, SLNG%, POD, PAC, protein%) in real-time against target ranges. The app suggests corrections and can auto-fill a balanced recipe.

Recipes come from two sources: **Featured** (author-published, git-tracked YAML in `recipes/`, baked into the production bundle, read-only in the UI — fork to edit) and **My Recipes** (the visitor's own, saved to `localStorage`, full CRUD). The hosted/production build is fully usable: no backend, featured recipes are baked in, user recipes live in the browser.

## Tech Stack

- **Vue 3** with `<script setup>`, Pug templates, indented Sass
- **Buntpapier v3** for UI components (`bunt-button`, `bunt-input`, `bunt-select`) and CSS variables
- **Vite** with YAML plugin (`@modyfi/vite-plugin-yaml`), reactivity transform (`@vue-macros/reactivity-transform`)
- **TypeScript** (non-strict), path alias `~` → `./src/`
- **Vitest** for unit tests, **Playwright** for E2E
- See `~/.claude/CLAUDE.md` for detailed coding conventions

## Architecture

```
src/
  lib/                    # Static data + pure logic (NO mutable state)
    types.ts              # All TypeScript interfaces (incl. RecipeData, RecipeSource)
    ingredients.ts        # Typed YAML imports + lookup helpers (findIngredient, getCategory, allIngredients)
    formulas.ts           # Pure calculation functions (calcBalance, calcPod, calcPac, etc.)
    recipe.ts             # Recipe helpers: apportion, normalizeTo1000, areRecipesEqual (+ recipe.test.ts)
    ranges.ts             # Target ranges per ice cream type (from research docs)
    solver.ts             # Auto-fill engine + suggestion generator (+ solver.test.ts)
    url.ts                # Serialize/parse recipe to/from URL query (shareable links) (+ url.test.ts)
    store.ts              # createStore() factory (custom Pinia-like pattern)
    api/featured.ts       # Featured recipes: import.meta.glob bake-in (prod) / dev middleware fetch + dev-only store/delete
    api/userRecipes.ts    # User recipes: localStorage CRUD + export/import (suffix on name collision)
  stores/
    recipe.ts             # Single mutable store. State: recipe {type, ingredients[], notes}, batchFactor
                          #   (view-only; grams are canonical 1 kg basis), loadedId/loadedSource/loadedRecipe
                          # Getters: balance, displayIngredients/displayTotal, ranges, status, suggestions,
                          #   isModified, canUpdate (user always; featured only in dev)
                          # Actions: addIngredient, removeIngredient, updateGrams, setDisplayTotal,
                          #   autoFillRecipe, loadRecipe(data,id,source), markAsSaved, toRecipeData, …
  composables/
    useRecipeLists.ts     # Shared reactive featured/userRecipes lists + search filter + refresh helpers
    useRouteSync.ts       # Loads the routed recipe by source, two-way syncs recipe state ↔ URL query
  components/             # Reusable UI (class prefix: .c-{name})
    RecipeSidebar.vue     # Two lists (Featured / My Recipes) + search + Export/Import footer. New Recipe link
    RangeIndicator.vue    # Bar gauge: value vs target range with low/ok/high coloring
    BalancePanel.vue      # Grid of all 7 parameter indicators + summary stats
    IngredientRow.vue     # Table row with native inputs
    RecipeTable.vue       # Full ingredient table with header, rows, total
    IngredientPicker.vue  # Category select → ingredient select → grams → add button
    TypeSelector.vue      # Ice cream type + batch (display total) controls
  views/                  # Page-level components (class prefix: .v-{name})
    Greeter.vue           # Landing page ('/') — welcome + counts + New Recipe CTA
    Calculator.vue        # Recipe + balance two-column layout. Source-aware save bar:
                          #   Update / Fork / Save / Delete (+ dev-only "Store to Featured")
  assets/
    main.sass             # Global styles, CSS layer declaration, Buntpapier overrides
data/                     # YAML ingredient database (sugars, dairy, fats, fruits, nuts, etc.)
research/                 # Formulas, ideal ranges, glossary — authoritative reference docs
recipes/                  # Featured recipe YAML (git-tracked; baked into prod, served via dev middleware)
```

Routes ([src/routes.ts](src/routes.ts)): `/` → `home` (Greeter), `/new` → `new-recipe` (blank Calculator), `/recipes/:source/:id` → `recipe` (`source` is `featured` | `user`).

## Key Concepts (Ice Cream Science)

- **TS%** — Total Solids percentage (everything except water)
- **POD** — Sweetening power, normalized to 1000g batch. Sucrose = 100 reference
- **PAC** — Anti-freezing power, normalized to 1000g batch. Controls softness/scoopability
- **SLNG** — Milk Solids Non-Fat (proteins, lactose, minerals from dairy)
- **Max SLNG** — Lactose crystallization limit, depends on sugar content
- Formulas and target ranges are documented in `research/` — use those as the source of truth, no need for further research

## Buntpapier Usage Notes

- Needs `<div id="bunt-teleport-target"></div>` in `index.html` for select dropdowns
- `bunt-select` with object options: use `optionValue="propName"` (string prop, NOT `getOptionValue` function) for `findOptionByValue` to work on initial render. Use `getOptionLabel` (function) for nested label access
- Style via CSS vars: `--button-shape`, `--button-weight`, `--button-color`, `--input-shape`, `--button-size`
- Global overrides in `main.sass`: `--input-shape: rounded`, `--button-shape: rounded`

## Recipe storage

**Featured** (`src/lib/api/featured.ts`):
- **Prod**: baked into the bundle via `import.meta.glob('/recipes/*.yaml', { eager: true })` — no network, read-only. `bakedIds` lists them.
- **Dev**: read live from the `/api/recipes` dev middleware (a `vite.config.ts` plugin marked `apply: 'serve'`), so freshly-stored YAML shows immediately. Endpoints: `GET /api/recipes`, `GET /api/recipes/:name`, `POST /api/recipes/:name`, `DELETE /api/recipes/:name`. `storeFeatured`/`deleteFeatured` (write the git-tracked YAML) are **dev-only** — guarded with `import.meta.env.DEV` and exposed via the Calculator's dev-only "Store to Featured" button.

**My Recipes** (`src/lib/api/userRecipes.ts`): localStorage under key `bobbl:user-recipes` (`{ [name]: RecipeData }`), available in dev and prod. CRUD + `exportUserRecipes()` (JSON envelope `{ version, recipes }`) / `importUserRecipes()` (on name collision, suffix ` (n)` rather than overwrite) + `uniqueUserName()`.

Build mode is the discriminator: `import.meta.env.PROD` (true for `vite build`/`vite preview`) bakes featured in and drops every dev fetch path via dead-code elimination; `import.meta.env.DEV` enables the YAML-authoring affordances. No runtime backend in production.

## Running

```bash
npm run dev          # Vite dev server (usually port 5173/5174)
npx vitest           # Run unit tests (56 tests across formulas/solver/url/recipe/store)
npm run typecheck    # vue-tsc --noEmit
npm run build        # Type-check + production build (bakes featured recipes in)
npm run preview      # Serve the production build locally
npm run deploy        # build + rsync dist/ to rash.codes:bobbl
```

## Playwright MCP

Configured in `.mcp.json` for Claude to visually inspect the running app. Uses system Chromium at `/usr/bin/chromium` in headless mode.
