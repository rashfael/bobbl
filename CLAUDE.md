# Bobbl — Ice Cream Formulation Calculator

## Project Goal

Personal SPA tool for composing gelato/ice cream recipes from a YAML ingredient database. Users pick a type (Milcheis, Sorbet, etc.), add ingredients with gram amounts, and see computed parameters (TS%, fat%, SLNG%, POD, PAC, protein%) in real-time against target ranges. The app suggests corrections and can auto-fill a balanced recipe. Recipes are saved as git-tracked YAML preset files.

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
    types.ts              # All TypeScript interfaces
    ingredients.ts        # Typed YAML imports + lookup helpers (findIngredient, getCategory, allIngredients)
    formulas.ts           # Pure calculation functions (calcBalance, calcPod, calcPac, etc.)
    formulas.test.ts      # 10 tests against De Giglio worked examples
    ranges.ts             # Target ranges per ice cream type (from research docs)
    solver.ts             # Auto-fill engine + suggestion generator
    solver.test.ts        # 9 solver tests
    store.ts              # createStore() factory (custom Pinia-like pattern)
    api/presets.ts        # Raw fetch wrappers for preset CRUD endpoints
  stores/
    recipe.ts             # Single mutable store: type, batchSize, ingredients[], notes
                          # Getters: balance, ranges, status, suggestions
                          # Actions: addIngredient, removeIngredient, updateGrams, autoFillRecipe, etc.
  components/             # Reusable UI (class prefix: .c-{name})
    RangeIndicator.vue    # Bar gauge: value vs target range with low/ok/high coloring
    BalancePanel.vue      # Grid of all 7 parameter indicators + summary stats
    IngredientRow.vue     # Table row with native inputs (intentionally minimal, will be redesigned)
    RecipeTable.vue       # Full ingredient table with header, rows, total
    IngredientPicker.vue  # Category select → ingredient select → grams → add button
    TypeSelector.vue      # Ice cream type + batch size controls
    PresetSelector.vue    # Load/save/delete presets via API
  views/                  # Page-level components (class prefix: .v-{name})
    Calculator.vue        # (currently inlined in App.vue) Two-column layout: recipe + balance
  assets/
    main.sass             # Global styles, CSS layer declaration, Buntpapier overrides
data/                     # YAML ingredient database (sugars, dairy, fats, fruits, nuts, etc.)
research/                 # Formulas, ideal ranges, glossary — authoritative reference docs
presets/                  # Git-tracked recipe YAML files (served via Vite dev middleware)
```

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

## Preset API (Dev Only)

Vite dev middleware plugin in `vite.config.ts`:
- `GET /api/presets` — list preset names
- `GET /api/presets/:name` — load preset as JSON
- `POST /api/presets/:name` — save preset (JSON body → YAML file)
- `DELETE /api/presets/:name` — delete preset file

## Running

```bash
npm run dev          # Vite dev server (usually port 5173/5174)
npx vitest           # Run unit tests (19 tests: 10 formula + 9 solver)
npx vite build       # Production build
```

## Playwright MCP

Configured in `.mcp.json` for Claude to visually inspect the running app. Uses system Chromium at `/usr/bin/chromium` in headless mode.
