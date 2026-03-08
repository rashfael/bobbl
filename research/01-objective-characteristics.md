# Objective Characteristics / Objektive Kennzahlen

These are the measurable parameters that determine whether an ice cream or gelato will have the right texture, scoopability, sweetness, and shelf stability. A well-balanced recipe keeps all of these within their target ranges simultaneously. [deGiglio2019], [goff2013]

---

## Total Solids (TS) / Trockensubstanz

**Definition:** Everything in the mix that is not water. TS% = 100% - Water%.

**Composition:** TS is the sum of:
- Fat (from cream, butter, egg yolk, nuts, chocolate)
- SLNG (protein + lactose + minerals from milk)
- Sugars (all sweeteners)
- Other solids (stabilizers, cocoa solids, nut solids, fiber)

**Why it matters:**
- Higher TS → less free water → fewer and smaller ice crystals → smoother texture
- Higher TS → more "body" and slower melting
- Too high TS → gummy, heavy, overly dense texture
- Too low TS → icy, thin, watery

**Target ranges:**

| Type | TS % |
|---|---|
| Gelato (cream/milk) | 36-42 |
| Fruchtsorbet | 28-34 |
| Schokoladeneis | 38-44 |
| Nusseis | 40-46 |

**Measurement:** Calculated from ingredient composition. No single instrument measures TS directly in the mix (refractometer measures soluble solids only, not fats or insoluble fiber).

---

## POD (Potere Dolcificante) / Suesskraft

**Definition:** The perceived sweetness of the mix, expressed as a weighted index relative to sucrose (= 100). Not a direct physical measurement — it's a calculated proxy for taste.

**How it works:**
- Each sugar type has its own POD coefficient (see `data/sugars.yaml`)
- Sucrose = 100 (reference)
- Dextrose = 70 (less sweet)
- Fructose = 170 (much sweeter)
- Lactose from dairy also contributes (~POD 16)

**Calculation:** See [03-formulas.md](03-formulas.md) for the full formula.

**Why it matters:**
- POD and PAC can be controlled independently by choosing different sugar types
- Too high POD → cloying, masks other flavors
- Too low POD → bland, flavors don't "pop"
- Fruit sorbets need higher POD than cream-based to compensate for missing dairy richness

**Target ranges:**

| Type | POD |
|---|---|
| Cremeeis / Milcheis | 160-200 |
| Fruchtsorbet | 220-280 |
| Schokoladeneis | 160-200 |
| Nusseis | 160-180 |

**Important nuance:** POD is about *perceived* sweetness, which is also influenced by fat content (fat dulls sweetness perception), temperature (cold dulls sweetness), and acidity (acid increases perceived sweetness). The POD calculation gives a baseline, but the actual recipe may need tasting-based adjustment.

---

## PAC (Potere Anti-Congelante) / Gefrierpunktabsenkung

**Definition:** The relative ability of dissolved solutes (primarily sugars) to depress the freezing point of water, compared to sucrose (= 100). This is the single most important parameter for scoopability and serving temperature.

**The physics:** Freezing point depression is a colligative property — it depends on the *number* of solute particles in solution, not their identity. Smaller molecules (lower molecular weight) produce more particles per gram and therefore depress the freezing point more.

- Sucrose (MW 342): PAC = 100
- Dextrose (MW 180): PAC ≈ 190 (roughly double, because ~2x more molecules per gram)
- Fructose (MW 180): PAC ≈ 190
- Glucose syrup DE60: PAC ≈ 110 (mixture of chain lengths)

**Why it matters:**
- PAC determines what fraction of water is frozen at a given temperature
- At serving temperature (-11 to -14 C for gelato), ideally 65-70% of water should be frozen
- Too high PAC → too soft at serving temp, melts too fast
- Too low PAC → too hard, can't scoop, feels icy on the tongue
- Rule of thumb: PAC / 2.5 ≈ ideal serving temperature in negative Celsius

**Target ranges:**

| Type | PAC | Serving temp |
|---|---|---|
| Cremeeis / Milcheis | 240-280 | -11 to -13 C |
| Fruchtsorbet | 280-340 | -12 to -14 C |
| Schokoladeneis | 230-270 | -11 to -13 C |
| Nusseis | 240-270 | -11 to -13 C |

**Independent control:** The key insight is that POD and PAC can be tuned independently. For example:
- Replace some sucrose (POD 100, PAC 100) with dextrose (POD 70, PAC 190): PAC goes up, POD goes down
- Replace some sucrose with maltodextrin DE19 (POD 15, PAC 40): both go down, but adds TS
- This is the core of the balancing game

---

## Fat / Fett

**Definition:** Total fat content from all sources (cream, butter, egg yolk, chocolate, nuts, coconut).

**Why it matters:**
- Fat coats the tongue, creating a creamy, rich mouthfeel
- Fat lubricates, masking the texture of ice crystals
- Fat globules partially coalesce during churning, creating a network that stabilizes air cells
- Fat slows melting (fat crystal network acts as scaffolding)
- Too much fat → greasy, heavy, dulls flavor perception
- Too little fat → thin, icy, poor air stability

**Target ranges:**

| Type | Fat % |
|---|---|
| Cremeeis | 7-10 |
| Milcheis | 4-6 |
| Fruchtsorbet | 0-2 |
| Schokoladeneis | 6-10 |
| Nusseis | 8-12 |

**Interaction with SLNG:** Fat and SLNG are inversely related — as fat goes up, SLNG should come down to maintain proper total solids. High-fat recipes need less SLNG to avoid excessive density.

**Fat crystallization:** The type of fat matters, not just the amount. Milk fat crystallizes into beta-prime (β') crystals that give smooth texture. Cocoa butter and coconut oil have different crystallization behavior. [clarke2015]

---

## SLNG (Solidi del Latte Non Grassi) / Magermilchtrockenmasse

**Definition:** The non-fat dry matter from milk and dairy: protein (casein + whey), lactose, and minerals (ash). English equivalent: MSNF (Milk Solids Non-Fat).

**Sources:**
- Whole milk 3.5%: ~8.9% SLNG
- Skim milk powder: ~96% SLNG (the primary SLNG booster)
- Cream 35%: ~5% SLNG (lower because of high fat)

**Why it matters:**
- Protein (from SLNG) stabilizes fat globules and air cells during churning → better texture
- Protein binds water → reduces free water → fewer ice crystals
- Lactose contributes to sweetness (POD ~16) and body
- Gives the "milky" flavor backbone
- Too much SLNG → lactose crystallization ("sandy" texture), see Lactose section below
- Too little SLNG → poor body, weak emulsion, coarse texture

**Target ranges:**

| Type | SLNG % |
|---|---|
| Cremeeis | 7-9 |
| Milcheis | 9-12 |
| Fruchtsorbet | 0 |
| Schokoladeneis | 7-10 |
| Nusseis | 7-9 |

**Maximum SLNG:** There's an upper limit determined by lactose solubility. The "SLNG factor" method [dairyscience]:
- Max SLNG = (100 - sum of other solids) / 7
- This ensures lactose stays below its crystallization threshold

---

## Lactose / Laktose

Not an independent parameter to tune, but a critical constraint within SLNG.

**The problem:** Lactose has limited solubility (~180 g/L at room temperature, less when cold). In ice cream, water freezes out and concentrates the remaining solutes. If lactose exceeds ~9% of the *water weight* in the unfrozen phase, it crystallizes into large, gritty crystals — the dreaded "sandy" or "grainy" texture.

**How to avoid it:**
- Keep total lactose below ~9% of water weight in the mix
- Use skim milk powder judiciously — it's 51% lactose
- Stabilizers (especially LBG, guar) inhibit lactose crystal nucleation
- In long-stored ice cream (weeks in freezer), crystallization risk increases

**Where lactose comes from:**
- Whole milk (4.7% lactose)
- Cream (3.0% lactose)
- Skim milk powder (51% lactose)
- Condensed milk (10-12% lactose)

---

## Overrun / Aufschlag

**Definition:** The percentage increase in volume due to air incorporation during churning.

**Formula:** Overrun% = ((Volume of ice cream - Volume of mix) / Volume of mix) x 100

**Or by weight:** Overrun% = ((Weight of mix - Weight of same volume of ice cream) / Weight of same volume of ice cream) x 100

**Why it matters:**
- Air makes ice cream lighter and less dense
- Air insulates the tongue from cold, making the texture seem smoother
- Too much air → too light, insubstantial, melts too fast, "airy" rather than creamy
- Too little air → dense, heavy, hard to scoop, feels very cold on the tongue
- Gelato's lower overrun is why it tastes more intense than American ice cream

**Target ranges:**

| Type | Overrun % |
|---|---|
| Artisan gelato | 25-40 |
| Industrial ice cream | 50-100 |
| Fruchtsorbet | 15-30 |
| Soft serve | 40-60 |

**What affects overrun:**
- Fat content: more fat → more partial coalescence → more stable air cells → higher potential overrun
- Protein: stabilizes air cell walls
- Stabilizers: increase viscosity, trapping air
- Churning speed and temperature
- Home machines: typically produce lower overrun (20-40%) than commercial equipment

---

## Protein / Eiweiss

Not always tracked as a separate target, but critical for structure.

**Functions:**
- Emulsification: casein and whey proteins coat fat globules, keeping them dispersed
- Air cell stabilization: proteins form films around air cells during churning
- Water binding: proteins hold water, reducing free water for ice crystal formation
- Maillard reaction: contributes to cooked/caramel flavors in heated mixes

**Sources:**
- SLNG is the primary source (~36% protein in SMP)
- Egg yolk: ~16% protein
- Nut pastes: 13-26% protein depending on nut type

**Typical range:** 3-5% protein in a balanced mix. Rarely needs to be boosted explicitly if SLNG is adequate.

---

## Dextrose Equivalent (DE) / Dextrose-Aequivalent

**Definition:** A measure of how far starch has been broken down (hydrolyzed) into shorter sugar chains. DE 0 = intact starch, DE 100 = pure dextrose (glucose). Products below DE 20 are classified as maltodextrins; above DE 20 as glucose syrups.

**Why it matters for ice cream:**
- DE directly determines the POD and PAC of a glucose syrup or maltodextrin
- Higher DE → shorter chains → higher POD and PAC (more like dextrose)
- Lower DE → longer chains → lower POD and PAC (more like starch — adds body without sweetness or softening)

**Common DE values and their properties:**

| Product | DE | POD (approx.) | PAC (approx.) | Character |
|---|---|---|---|---|
| Maltodextrin | 19 | 15 | 40 | Barely sweet. Body builder. TS booster. |
| Glucose syrup | 39 | 30 | 70 | Mild sweetness, good body. |
| Glucose syrup | 60 | 45 | 110 | Balanced. Moderate sweetness and PAC. |
| Glucose powder | 97 | 65 | 180 | Near-dextrose. Strong PAC. |
| Dextrose | 100 | 70 | 190 | Pure glucose. Maximum PAC for its sweetness. |

**Usage strategy:**
- Low DE (maltodextrin DE19): Use to boost TS without adding sweetness or softness. Excellent for fruit sorbets that are already sweet enough.
- Mid DE (syrup DE60): Balanced choice for most recipes. Adds body, moderate sweetness, moderate PAC.
- High DE (powder DE97, dextrose): Use to increase PAC (softer at serving temp) while managing sweetness.

**The DE spectrum is your main tuning knob** for independently adjusting POD and PAC. Combined with sucrose as the baseline sweetener, glucose products at various DE values give you fine-grained control over the balance.

---

## Parameter Interactions

These parameters don't exist in isolation — changing one affects others:

| Change | Effect on TS | Effect on POD | Effect on PAC | Effect on Texture |
|---|---|---|---|---|
| More sugar | ↑ | ↑ | ↑ | Softer, sweeter |
| More SMP | ↑ | slight ↑ (lactose) | slight ↑ | More body, risk of sandy |
| More cream | ↑ (fat) | — | — | Creamier, richer |
| More water | ↓ | ↓ | ↓ | Icier, thinner |
| Sucrose → Dextrose | = | ↓ | ↑ | Less sweet, softer |
| Sucrose → Maltodextrin | = | ↓↓ | ↓ | Much less sweet, firmer |
| More stabilizer | slight ↑ | — | — | Smoother, more body |

The art of balancing is adjusting multiple ingredients simultaneously to keep all parameters in range. This is why a calculator is invaluable — manual calculation across 8-12 ingredients with 6+ parameters is tedious and error-prone.
