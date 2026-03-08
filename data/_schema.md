# Data Schema / Datenschema

Data dictionary for all YAML files in this directory. Each file follows the same top-level structure and conventions documented here.

## General Structure

Every YAML file has:

```yaml
meta:
  category: <string>        # Kebab-case category identifier
  description: <string>     # Bilingual description (DE / EN)
  lastUpdated: <date>       # ISO date (YYYY-MM-DD)

items:
  - id: <string>            # Unique kebab-case identifier within the file
    name:
      de: <string>          # German name (primary display language)
      en: <string>          # English name
    # ... category-specific fields
    notes: <string | null>  # Optional notes (German)
    source: <string>        # Source ID referencing research/sources.md
```

## Conventions

| Convention | Rule |
|---|---|
| Indentation | 2 spaces (YAML spec forbids tabs) |
| Percentages | Numbers 0-100 (not 0.0-1.0) |
| Names | Nested `name:` object with `de` and `en` keys |
| Temperatures | Celsius |
| Weights | Grams unless stated otherwise |
| Molecular weights | g/mol |
| Null values | Use `null` for unknown or not-applicable |
| Source references | String matching an ID in `research/sources.md` |
| Range fields | Object with `min` and `max` keys |

## File Schemas

### sugars.yaml

Sugars, sweeteners, and sugar-like solids (including inulin).

| Field | Type | Unit | Description |
|---|---|---|---|
| `id` | string | — | Unique identifier |
| `name` | {de, en} | — | Names |
| `de` | number \| null | — | Dextrose Equivalent. `null` for pure sugars (sucrose, dextrose, fructose). Set for glucose syrups and maltodextrins. |
| `pod` | number | rel. | Sweetening power (sucrose = 100) |
| `pac` | number | rel. | Anti-freezing power (sucrose = 100) |
| `molecularWeight` | number \| null | g/mol | Molecular weight. `null` for polydisperse syrups. |
| `totalSolidsPercent` | number | % | Dry matter content |
| `typicalUsagePercent` | {min, max} | % | Typical range in a recipe (% of total mix) |
| `notes` | string \| null | — | Optional notes |
| `source` | string | — | Source reference |

### dairy.yaml

Dairy products and milk-based ingredients.

| Field | Type | Unit | Description |
|---|---|---|---|
| `id` | string | — | Unique identifier |
| `name` | {de, en} | — | Names |
| `fatPercent` | number | % | Fat content |
| `proteinPercent` | number | % | Protein content |
| `lactosePercent` | number | % | Lactose content |
| `slngPercent` | number | % | SLNG (Solidi del Latte Non Grassi / milk solids non-fat) |
| `totalSolidsPercent` | number | % | Total solids (fat + SLNG) |
| `waterPercent` | number | % | Water content (= 100 - totalSolids) |
| `notes` | string \| null | — | Optional notes |
| `source` | string | — | Source reference |

### fats.yaml

Pure fats and oils used in ice cream.

| Field | Type | Unit | Description |
|---|---|---|---|
| `id` | string | — | Unique identifier |
| `name` | {de, en} | — | Names |
| `fatPercent` | number | % | Fat content |
| `waterPercent` | number | % | Water content |
| `totalSolidsPercent` | number | % | Total solids |
| `meltingPointCelsius` | number \| null | C | Approximate melting point |
| `notes` | string \| null | — | Optional notes |
| `source` | string | — | Source reference |

### chocolate-cocoa.yaml

Chocolate, cocoa powder, and cocoa-derived products.

| Field | Type | Unit | Description |
|---|---|---|---|
| `id` | string | — | Unique identifier |
| `name` | {de, en} | — | Names |
| `fatPercent` | number | % | Fat content (from cocoa butter) |
| `sugarPercent` | number | % | Sugar content |
| `cocoaSolidsPercent` | number | % | Total cocoa solids (cocoa butter + cocoa mass) |
| `totalSolidsPercent` | number | % | Total solids |
| `waterPercent` | number | % | Water content |
| `pod` | number | rel. | POD contribution (from contained sugars) |
| `pac` | number | rel. | PAC contribution |
| `notes` | string \| null | — | Optional notes |
| `source` | string | — | Source reference |

### fruits.yaml

Fruits and fruit products. Brix values are catalogue reference ranges only — actual measured Brix is a transient UI input, not stored here.

| Field | Type | Unit | Description |
|---|---|---|---|
| `id` | string | — | Unique identifier |
| `name` | {de, en} | — | Names |
| `brix` | object | — | Catalogue Brix data |
| `brix.catalogueMin` | number | Brix | Lowest typical value from literature |
| `brix.catalogueMax` | number | Brix | Highest typical value from literature |
| `brix.catalogueAvg` | number | Brix | Average / commonly cited value |
| `acidityPh` | number \| null | pH | Typical pH value |
| `waterPercent` | number | % | Water content |
| `fiberPercent` | number | % | Dietary fiber content |
| `predominantSugarType` | string | — | Main sugars present (e.g. "fructose+glucose", "sucrose") |
| `totalSolidsPercent` | number | % | Total solids |
| `form` | string[] | — | Available forms: "frisch", "TK" (tiefgekuehlt/frozen), "Pueree" |
| `season` | {start, end} \| null | month | Central European season (1=Jan, 12=Dec). `null` for tropical imports. |
| `notes` | string \| null | — | Optional notes |
| `source` | string | — | Source reference |

### nuts.yaml

Nuts, nut pastes, and nut-derived products.

| Field | Type | Unit | Description |
|---|---|---|---|
| `id` | string | — | Unique identifier |
| `name` | {de, en} | — | Names |
| `fatPercent` | number | % | Fat content |
| `proteinPercent` | number | % | Protein content |
| `carbsPercent` | number | % | Total carbohydrates |
| `totalSolidsPercent` | number | % | Total solids |
| `waterPercent` | number | % | Water content |
| `isPaste` | boolean | — | Whether this entry is a paste/butter vs. whole/chopped nut |
| `notes` | string \| null | — | Optional notes |
| `source` | string | — | Source reference |

### stabilizers.yaml

Stabilizers, emulsifiers, fibers, and bulking agents. The `type` field distinguishes their primary function.

| Field | Type | Unit | Description |
|---|---|---|---|
| `id` | string | — | Unique identifier |
| `name` | {de, en} | — | Names |
| `type` | string | — | One of: "stabilizer", "emulsifier", "fiber", "bulking" |
| `eNumber` | string \| null | — | EU E-number designation (e.g. "E410"). `null` for natural ingredients like egg yolk. |
| `dosagePercent` | {min, max} | % | Recommended dosage range (% of total mix) |
| `hydrationTempCelsius` | number \| null | C | Temperature needed for full hydration. `null` if cold-soluble. |
| `function` | string | — | Primary function description (German) |
| `synergiesWith` | string[] | — | IDs of other stabilizers with synergistic effects |
| `notes` | string \| null | — | Optional notes |
| `source` | string | — | Source reference |

### alcohol.yaml

Alcoholic ingredients and spirits.

| Field | Type | Unit | Description |
|---|---|---|---|
| `id` | string | — | Unique identifier |
| `name` | {de, en} | — | Names |
| `ethanolPercent` | number | % vol | Ethanol content by volume |
| `sugarPercent` | number | % | Residual sugar content |
| `pac` | number | rel. | Anti-freezing power (very high for alcohol) |
| `waterPercent` | number | % | Water content |
| `typicalUsagePercent` | {min, max} | % | Typical recipe usage range (% of total mix) |
| `notes` | string \| null | — | Optional notes |
| `source` | string | — | Source reference |
