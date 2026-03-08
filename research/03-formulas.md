# Formulas / Berechnungsformeln

Mathematical formulas for ice cream balance calculations, with worked examples. These are the computations the calculator app will need to implement. [deGiglio2019], [goff2013], [icecreamcalc]

---

## 1. Total Solids (TS)

### Formula

For a mix with n ingredients:

```
TS% = sum(ingredient_g × ingredient_TS%) / total_mix_g
```

Or equivalently:

```
TS% = 100% - Water%
Water% = sum(ingredient_g × ingredient_water%) / total_mix_g
```

### Worked Example

A simple Milcheis base (1000 g):
- 600 g Vollmilch (12.4% TS) → 74.4 g solids
- 100 g Sahne 35% (40% TS) → 40.0 g solids
- 150 g Saccharose (100% TS) → 150.0 g solids
- 40 g Magermilchpulver (97% TS) → 38.8 g solids
- 3 g Stabilisator (~100% TS) → 3.0 g solids
- 107 g Wasser (0% TS) → 0 g solids

**Total solids = 306.2 g → TS% = 306.2 / 1000 = 30.6%**

(This is too low — would need more SMP or sugar or less water. Target 36-40%.)

---

## 2. POD (Potere Dolcificante / Suesskraft)

### Formula

POD is the sum of all sweetness contributions, normalized by dividing by 100 (since POD coefficients use sucrose = 100 as reference). Values are calculated for a **1 kg (1000 g) batch**; for other batch sizes, scale ingredients to 1000 g first.

```
POD = sum(sugar_g_i × POD_i) / 100
```

For each sugar-containing ingredient, the contribution is:

```
POD_contribution = (grams_of_sugar_type × POD_coefficient) / 100
```

Where POD coefficients (sucrose = 100):

| Sugar | POD |
|---|---|
| Saccharose | 100 |
| Dextrose | 75 |
| Fructose | 170 |
| Invertzucker | 130 |
| Laktose | 16 |
| Glucose DE39 | 60 |
| Glucose DE60 | 50 |
| Glucose DE97 | 75 |
| Maltodextrin DE19 | 30 |
| Trehalose | 50 |
| Honig | 130 |
| Inulin | 20 |

**Note on lactose:** In the Italian/De Giglio method, lactose from dairy products is included in the POD calculation. This is different from some English-language sources that ignore lactose in sweetness calculations.

### POD from DE

There is **no reliable linear formula** for POD from DE. The relationship is non-linear:

| DE | POD (De Giglio) | POD/DE ratio |
|---|---|---|
| 19 | 30 | 1.58 |
| 39 | 60 | 1.54 |
| 60 | 50 | 0.83 |
| 97 | 75 | 0.77 |

For non-standard DE values, use the closest tabulated value or interpolate between neighbors. Do not use a simple `POD = factor × DE` formula.

### Worked Example: Vanilleeis (from De Giglio)

1000 g mix, 16% sugar, 9.25% fat. [deGiglio2019]

| Ingredient | Amount | Sugar (g) | POD calc | PAC calc |
|---|---|---|---|---|
| Vollmilch 3.8% | 550 g | — | SLNG 50 × 0.54 × 16 = 4 | SLNG 50 × 0.54 × 100 = 27 → 25 |
| Sahne 36% | 133 g | — | SLNG 8 × 0.54 × 16 = 1 | SLNG 8 × 0.54 × 100 = 4 |
| Magermilchpulver | 46 g | — | SLNG 45 × 0.54 × 16 = 4 | SLNG 45 × 0.54 × 100 = 24 → 22 |
| heller Rohrzucker | 112 g | 112 | 112 × 100 = 112 | 112 × 100 = 112 |
| Dextrose | 20.9 g | 19 | 19 × 75 = 14 | 19 × 190 = 36 |
| Trockenglukose DE39 | 13.5 g | 13 | 13 × 60 = 8 → 7 | 13 × 72 = 9 |
| Glukosesirup DE62 | 20 g | 16 | 16 × 50 = 8 | 16 × 150 = 24 |
| Eigelb | 100 g | — | 0 | 0 |
| Stabilisatoren | 2.5 g | — | 0 | 0 |

**POD = (4 + 1 + 4 + 112 + 14 + 7 + 8) / 1 = 150**
**PAC = (25 + 4 + 22 + 112 + 36 + 9 + 24) / 1 = 232**

Results: FB 36.1%, Zucker 16%, Fett 9.25%, SLNG 10.3%, **POD 150**, **PAC 232**.

**Note on dairy POD/PAC:** Dairy products contribute via their lactose content. Lactose ≈ 54% of SLNG. Calculation: SLNG_g × 0.54 × POD_lactose(16) / 100 for POD, and SLNG_g × 0.54 × PAC_lactose(100) / 100 for PAC. De Giglio does not count lactose as a separate sugar in the balance sheet; it is accounted for within the SLNG.

**Note on fruit sugars:** De Giglio treats all fruit sugars as saccharose equivalent (POD 100, PAC 100) for simplicity, since breaking them down into glucose/fructose/sucrose fractions adds complexity without meaningful precision improvement for hobby use.

---

## 3. PAC (Potere Anti-Congelante / Gefrierpunktabsenkung)

### Formula

Analogous to POD, but using PAC coefficients. Same convention: divide by 100, values for a **1 kg batch**.

```
PAC = sum(sugar_g_i × PAC_i) / 100
```

PAC coefficients (sucrose = 100):

| Sugar | PAC |
|---|---|
| Saccharose | 100 |
| Dextrose | 190 |
| Fructose | 190 |
| Invertzucker | 190 |
| Laktose | 100 |
| Glucose DE39 | 72 |
| Glucose DE60 | 150 |
| Glucose DE97 | 190 |
| Maltodextrin DE19 | 33 |
| Trehalose | 100 |
| Honig | 230 |
| Inulin | 20 |
| Ethanol (pure) | 790 |

### PAC from Molecular Weight

The PAC of a sugar can be derived from its molecular weight:

```
PAC = 100 × (MW_sucrose / MW_sugar)
PAC = 100 × (342.3 / MW_sugar)
```

This works because freezing point depression is proportional to the number of moles of solute. More moles per gram (= lower MW) means more depression.

Examples:
- Dextrose: 100 × (342.3 / 180.16) = 190
- Fructose: 100 × (342.3 / 180.16) = 190
- Trehalose: 100 × (342.3 / 342.3) = 100 (same MW as sucrose)

For glucose syrups (polydisperse mixtures), this formula doesn't directly apply — use the empirical PAC values from the database.

### PAC from DE

Like POD, there is no reliable linear formula. De Giglio's empirical values:

| DE | PAC (De Giglio) | PAC/DE ratio |
|---|---|---|
| 19 | 33 | 1.74 |
| 39 | 72 | 1.85 |
| 60 | 150 | 2.50 |
| 97 | 190 | 1.96 |

Note the non-linearity: DE60 has a disproportionately high PAC. For non-standard DE values, interpolate between neighbors rather than using a linear formula.

### Worked Example: Himbeersorbet (from De Giglio)

1000 g mix, 25% sugar, 45% Himbeerpüree. [deGiglio2019]

| Ingredient | Amount | Sugar (g) | POD calc | PAC calc |
|---|---|---|---|---|
| Himbeerpüree | 450 g | 90 | 90 × 100 = 90 | 90 × 100 = 90 |
| Zitronensaft | 50 g | 4 | 4 × 100 = 4 | 4 × 100 = 4 |
| heller Rohrzucker | 109 g | 109 | 109 × 100 = 109 | 109 × 100 = 109 |
| Dextrose | 25 g | 23 | 23 × 75 = 18 | 23 × 190 = 44 |
| Trockenglukose DE39 | 16 g | 16 | 16 × 60 = 8 | 16 × 72 = 11 |
| Maltodextrin DE19 | 8 g | 8 | 8 × 30 = 2 | 8 × 33 = 3 |
| Stabilisatoren | 2.5 g | — | 0 | 0 |
| Wasser | 338 g | — | 0 | 0 |

**POD = 90 + 4 + 109 + 18 + 8 + 2 = 231**
**PAC = 90 + 4 + 109 + 44 + 11 + 3 = 261** (book rounds to 262)

Results: FB 26.2%, Zucker 25%, Wasser 73.9%, **POD 231**, **PAC 262**.

Note: Fruit sugars are treated as saccharose (POD 100, PAC 100) per De Giglio's convention. The POD/PAC values in the table are already divided by 100 (i.e., `sugar_g × coefficient / 100`).

---

## 4. Freezing Point Depression (FPD)

### Simplified Formula

The theoretical freezing point of the mix:

```
deltaT_f = K_f × m
```

Where:
- `deltaT_f` = freezing point depression below 0 C
- `K_f` = cryoscopic constant of water = 1.86 C·kg/mol
- `m` = molality = moles of solute per kg of solvent (water)

### Practical Calculation

For a mix with multiple sugar types:

```
total_moles = sum(sugar_g_i / MW_i)
kg_water = water_g / 1000
molality = total_moles / kg_water
deltaT_f = 1.86 × molality
```

**Note:** This is simplified — it ignores non-ideal solution behavior, ion effects from salts/minerals, and the complex multi-component nature of ice cream. The PAC system is a more practical proxy that accounts for these factors empirically.

### Worked Example

From the same mix:
- 140 g sucrose / 342.3 = 0.409 mol
- 27.6 g dextrose / 180.16 = 0.153 mol
- 40 g glucose syrup DE60: average MW hard to calculate — skip for simplicity, or treat as ~0.10 mol
- 48.6 g lactose / 342.3 = 0.142 mol

Total moles ≈ 0.804 mol
Water in mix ≈ 694 g = 0.694 kg
Molality = 0.804 / 0.694 = 1.158 mol/kg
deltaT_f = 1.86 × 1.158 = **2.15 C**

So the mix freezing point ≈ **-2.15 C**. Below this temperature, ice crystals begin to form. At -11 C (serving temperature), a large fraction of water will be frozen.

### Frozen Water Fraction

The fraction of water that is frozen at temperature T:

```
frozen_fraction = 1 - (deltaT_f / |T|)     (for T < -deltaT_f)
```

At T = -11 C with deltaT_f = 2.15 C:
```
frozen_fraction = 1 - (2.15 / 11) = 1 - 0.195 = 0.805 = 80.5%
```

This is higher than the ideal 65-70% — the ice cream would be quite firm. Need more PAC (more low-MW sugars or some alcohol) to soften it.

**Caveat:** This simplified model overestimates frozen fraction because it doesn't account for the increasing solute concentration as water freezes out (which further depresses the freezing point of the remaining liquid). More accurate models use iterative calculations. [goff2013]

---

## 5. Maximum SLNG

### Formula (De Giglio)

To avoid lactose crystallization, the maximum SLNG is constrained:

```
max_SLNG = (Rezeptmenge - Zucker - Fett - andere_FB) × 15%
```

This says: SLNG should be at most 15% of the remaining mix weight (water + SLNG). [deGiglio2019]

### Worked Example: Vanilleeis

From the Vanilleeis example (1000 g):
```
max_SLNG = (1000 - 160 - 93 - 5) × 0.15 = 742 × 0.15 = 111.3 g (11.13%)
```

Actual SLNG in the recipe: 103 g (10.3%) — within the limit.

### Alternative (Direct Lactose Check)

SLNG is ~54% lactose. Lactose crystallizes (sandy texture) when it exceeds ~9% of the water weight:

```
max_lactose_g = water_g × 0.09
max_SLNG_g = max_lactose_g / 0.54
```

Both methods give similar results. De Giglio's 15% rule is simpler to apply during recipe design.

---

## 6. Fat Balance

### From Ingredients

```
fat% = sum(ingredient_g × ingredient_fat%) / total_mix_g
```

### Fat-SLNG Relationship

As fat increases, recommended SLNG decreases:

| Fat % | Max SLNG % |
|---|---|
| 4 | 12 |
| 6 | 11 |
| 8 | 10 |
| 10 | 9 |
| 12 | 8 |

This inverse relationship prevents excessive TS and lactose crystallization. [dairyscience]

---

## 7. Practical Balancing Workflow

Step-by-step process for creating a balanced recipe:

### Step 1: Choose the ice cream type
Determine target ranges from [02-ideal-ranges-by-type.md](02-ideal-ranges-by-type.md).

### Step 2: Fix the main ingredient
The star ingredient (fruit puree, nut paste, chocolate, etc.) determines how much of the mix is "spoken for." Calculate its contribution to fat, SLNG, sugars, and water.

### Step 3: Set the fat level
Choose cream and/or butter quantity to hit the fat target. Subtract fat already contributed by main ingredient (e.g., nut paste, chocolate).

### Step 4: Set the SLNG level
Add SMP to reach target SLNG. Check max SLNG constraint (lactose). Subtract SLNG already contributed by milk and cream.

### Step 5: Balance sugars for POD and PAC
1. Start with sucrose as baseline
2. Check POD — if too sweet, replace some sucrose with lower-POD sugars (dextrose, glucose syrup)
3. Check PAC — if too hard, replace some sucrose with higher-PAC sugars (dextrose, invert sugar)
4. If PAC is fine but want more TS, add maltodextrin DE19 (low POD, low PAC, high TS)
5. Iterate until both POD and PAC are in range

### Step 6: Add stabilizer/emulsifier
Add stabilizer blend at 0.2-0.5% of total mix.

### Step 7: Calculate water
Water = whatever is needed to reach total_mix_g. Or set water first and adjust other ingredients.

### Step 8: Verify all parameters
Check: TS, POD, PAC, Fat, SLNG, Protein, Lactose limit. If anything is out of range, adjust and re-verify.

### Step 9: Scale
Scale the recipe to your desired batch size.

---

## 8. Sugar Substitution Table

Quick reference for swapping sugars to adjust POD and PAC independently:

| Swap | POD change | PAC change | Use when |
|---|---|---|---|
| Sucrose → Dextrose | ↓ (100→75) | ↑ (100→190) | Too sweet, too hard |
| Sucrose → Fructose | ↑ (100→170) | ↑ (100→190) | Not sweet enough, too hard |
| Sucrose → Trehalose | ↓ (100→50) | = (100→100) | Too sweet, hardness is fine |
| Sucrose → Maltodextrin | ↓↓ (100→30) | ↓↓ (100→33) | Way too sweet, want more body |
| Sucrose → Glucose DE60 | ↓ (100→50) | ↑↑ (100→150) | Too sweet, too hard |
| Sucrose → Invert sugar | ↑ (100→130) | ↑ (100→190) | Want softer, prevent crystallization |
| Add Maltodextrin DE19 | slight ↑ | slight ↑ | Need more TS without affecting sweetness |
| Add Inulin | slight ↑ | slight ↑ | Need body, replace some fat |

---

## 9. Alcohol PAC Calculation

Ethanol has extremely high freezing point depression. For spirits:

```
PAC_contribution = volume_ml × (ethanol% / 100) × 790 × (density_ethanol / 1000)
```

Simplified: each percentage point of ethanol in the total mix contributes approximately 7.9 PAC units. A 40% spirit at 2% of total mix = 0.8% ethanol in mix ≈ 6.3 PAC contribution.

Small amounts of alcohol dramatically soften ice cream. Use sparingly or intentionally (e.g., vodka as invisible softener).
