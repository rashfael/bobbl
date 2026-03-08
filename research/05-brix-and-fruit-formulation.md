# Brix & Fruit Formulation / Brix & Fruchtrezeptur

How to use Brix measurement for fruit-based ice cream and sorbet formulation. [deGiglio2019], [fruitsmart], [icecreamcalc]

---

## What is Brix?

**Brix (Bx)** measures the percentage of soluble solids in a solution by weight. One degree Brix means 1 gram of sucrose equivalent per 100 grams of solution.

In fruit, "soluble solids" is mostly sugar, but also includes:
- Organic acids (citric, malic, tartaric)
- Amino acids
- Minerals
- Other dissolved compounds

So **Brix ≈ sugar content** but is slightly higher than the actual sugar content, especially in acidic fruits.

---

## Measuring Brix with a Refractometer

### How It Works

A refractometer measures the refractive index of a liquid — how much light bends when passing through it. More dissolved solids = higher refractive index = higher Brix reading.

### Types

| Type | Accuracy | Price | Best for |
|---|---|---|---|
| Analog hand-held | ±0.5 Bx | 15-40 EUR | Quick checks, good enough for ice cream |
| Digital hand-held | ±0.2 Bx | 50-200 EUR | More consistent, temperature-compensated |
| Inline process | ±0.1 Bx | 500+ EUR | Commercial production (overkill for hobby) |

### How to Measure

1. **Calibrate:** Place 2-3 drops of distilled water on the prism. Should read 0.0 Bx. Adjust if needed.
2. **Prepare sample:** If using whole fruit, blend or juice it first. Filter out seeds/pulp for clearest reading (optional — most refractometers handle pulp fine).
3. **Apply sample:** Place 2-3 drops on the prism. Close the cover plate.
4. **Read:** Look through the eyepiece (analog) or read the display (digital). The line between light and dark areas gives the Brix value.
5. **Clean:** Wipe prism with damp cloth. Dry.

### Temperature Correction

Refractometers are calibrated at 20 C. If your sample is warmer or cooler, the reading needs correction:

**Approximate correction:**

| Sample Temp | Correction |
|---|---|
| 10 C | Subtract ~0.5 Bx |
| 15 C | Subtract ~0.2 Bx |
| 20 C | No correction |
| 25 C | Add ~0.2 Bx |
| 30 C | Add ~0.5 Bx |

Many digital refractometers have automatic temperature compensation (ATC). If yours does, no manual correction needed.

**Best practice:** Let the sample equilibrate to room temperature before measuring. Takes 1-2 minutes for a few drops on the prism.

---

## Catalogue vs. Measured Brix

### Why They Differ

Catalogue Brix values (in `data/fruits.yaml`) are averages from literature. Actual Brix varies enormously based on:

- **Cultivar/variety:** A Mara des Bois strawberry has higher Brix than a Senga Sengana
- **Ripeness:** Ripe fruit has higher Brix. Under-ripe = more acid, less sugar.
- **Season:** Mid-season fruit is often sweeter than early/late season
- **Weather:** More sun exposure = higher Brix (photosynthesis → sugar)
- **Soil and irrigation:** Well-managed orchards produce sweeter fruit
- **Fresh vs. frozen:** Freezing and thawing can concentrate sugars slightly (cell rupture releases liquid)
- **Puree vs. whole:** Processing may change the reading

**Bottom line:** Always measure your actual fruit. Catalogue values are a starting point for recipe design; measured values are what you use for the final calculation.

### Using Measured Brix in Calculations

The Brix of your fruit tells you how much sugar it's bringing to the mix. This directly affects POD and PAC:

```
fruit_sugar_g = fruit_g × (measured_brix / 100)
```

Then calculate POD and PAC contributions from this sugar. For most fruits, the sugar mix is roughly:
- **Fructose + glucose dominant:** berries, stone fruits → average POD ≈ 120, PAC ≈ 190
- **Sucrose dominant:** apricot, banana, pineapple → average POD ≈ 100, PAC ≈ 100

The `predominantSugarType` field in `fruits.yaml` helps estimate this. For precise work, lab analysis would be needed — for hobby use, the approximation is fine.

---

## Acidity Correction

### The Problem

Acidic fruits (raspberries, citrus, passion fruit) have organic acids that:
1. Increase the refractometer reading (acids refract light too)
2. Increase perceived sweetness (acid amplifies sweetness on the tongue)

So a raspberry reading 10 Brix might have only ~8.5 Brix of actual sugar.

### Correction Rule of Thumb

For high-acid fruits (titratable acidity > 1.0%):
```
corrected_brix ≈ measured_brix - (0.5 to 1.0)
```

| Fruit | Typical TA | Correction |
|---|---|---|
| Zitrone | 5-6% | -1.5 to -2.0 Bx |
| Himbeere | 1.5-2.6% | -0.5 to -1.0 Bx |
| Schwarze Johannisbeere | 2.5-3.5% | -1.0 to -1.5 Bx |
| Passionsfrucht | 2.5-4.0% | -1.0 to -1.5 Bx |
| Erdbeere | 0.5-1.0% | 0 to -0.3 Bx |
| Banane | 0.2-0.4% | None needed |

For the calculator, a pragmatic approach: apply the correction when the fruit is known to be high-acid, and note it in the UI.

### Acidity and Perceived Sweetness

Counterintuitively, acid makes ice cream taste sweeter. A lemon sorbet with 30 Brix tastes more "sweet-sour" than a banana sorbet at 30 Brix, which tastes purely sweet. This means:
- Acidic fruit sorbets can use slightly less sugar (lower target Brix) without tasting bland
- Very acidic sorbets (lemon, passion fruit) need careful balancing to avoid being cloying

---

## Sorbet Formulation Step-by-Step

### Target: 28-32 Brix in the Finished Mix

This is the golden range for sorbets. Below 28 Brix = too icy. Above 32 Brix = too soft and overly sweet.

### Step 1: Determine Fruit Content

Typical fruit percentages:
- Strong-flavored fruit (passion fruit, lemon, raspberry): 25-35%
- Medium-flavored fruit (strawberry, mango, peach): 35-45%
- Mild-flavored fruit (melon, pear, apple): 40-50%

### Step 2: Measure or Estimate Brix of the Fruit

Use your refractometer on the actual fruit/puree. If not available, use catalogue values from `data/fruits.yaml`.

### Step 3: Calculate Sugar from Fruit

```
sugar_from_fruit_g = fruit_g × (brix / 100)
```

### Step 4: Calculate Additional Sugar Needed

```
target_sugar_total = total_mix_g × (target_brix / 100)
additional_sugar = target_sugar_total - sugar_from_fruit
```

### Step 5: Choose Sugar Mix

Don't use only sucrose — the PAC will be too low (sorbet will be too hard). Typical split:
- 60-70% Saccharose (baseline sweetener)
- 15-25% Dextrose or Glucose DE97 (raises PAC, keeps sweet enough)
- 10-15% Glukosesirup DE60 (adds body, moderate PAC)
- 0-5% Maltodextrin DE19 (TS boost without sweetness, if needed)

### Step 6: Add Water

```
water = total_mix - fruit - sugars - stabilizer - fiber
```

### Step 7: Add Stabilizer + Fiber

- Xanthan 0.1-0.15% + Citrusfaser 0.5-1.0%
- Or LBG/Guar blend 0.2-0.3%
- Or Gummi arabicum 0.5-1.0%

### Step 8: Check PAC

Calculate PAC. Target 280-340 for sorbet. If too low (too hard), increase dextrose/glucose ratio. If too high (too soft), increase sucrose ratio or add maltodextrin.

### Step 9: Verify with Refractometer

Measure the finished mix with a refractometer. Should read 28-32 Brix. Adjust sugar/water if needed.

---

## Worked Example: Erdbeersorbet (Strawberry Sorbet)

**Target:** 1000 g batch, 28-30 Brix, fruit-forward

### Inputs
- Strawberry puree: 400 g, measured Brix: 8.0
- Target total Brix: 29

### Calculations

Sugar from strawberries: 400 × 0.08 = **32 g sugar**

Target total sugar equivalent: 1000 × 0.29 = **290 g sugar equivalent**

Additional sugar needed: 290 - 32 = **258 g from added sweeteners**

Sugar mix (of the 258 g solids needed):
- Saccharose: 165 g (64%)
- Dextrose: 50 g × 0.92 TS = 46 g solids (18%)
- Glukosesirup DE60: 55 g × 0.80 TS = 44 g solids (17%)
- Maltodextrin DE19: 3 g (1%)

Stabilizer: 1 g Xanthan + 5 g Citrusfaser = 6 g

Water: 1000 - 400 - 165 - 50 - 55 - 3 - 6 = **321 g**

### Verification

POD (using De Giglio coefficients, fruit sugar as saccharose):
- 165 g Saccharose: 165 × 100 / 100 = 165
- 46 g Dextrose: 46 × 75 / 100 = 34.5
- 44 g Glucose DE60: 44 × 50 / 100 = 22
- 32 g fruit sugar (as saccharose): 32 × 100 / 100 = 32
- 3 g Maltodextrin DE19: 3 × 30 / 100 = 0.9
- **POD = 254** (target 220-280: in range)

PAC:
- 165 g Saccharose: 165 × 100 / 100 = 165
- 46 g Dextrose: 46 × 190 / 100 = 87
- 44 g Glucose DE60: 44 × 150 / 100 = 66
- 32 g fruit sugar (as saccharose): 32 × 100 / 100 = 32
- 3 g Maltodextrin DE19: 3 × 33 / 100 = 1
- **PAC = 351** (target 280-340: slightly above range — could reduce dextrose ratio)

TS: (165 + 46 + 44 + 3 + 36 + 6) = 300 g → **30%** (target 28-34: in range)

---

## Common Fruit Issues

### Fruits with Proteases

**Ananas (Bromelain) and Kiwi (Actinidin):** These enzymes break down milk proteins. In dairy-based ice cream:
- Heat the fruit to 80 C for 2 minutes before adding to the mix, or
- Use only in sorbets (no dairy to attack)

### Oxidation (Browning)

**Banane, Apfel, Birne, Pfirsich:** These fruits brown quickly.
- Add 0.5-1% lemon juice to the puree immediately after processing
- Process quickly, chill immediately
- Ascorbic acid (Vitamin C) also works: 0.1-0.2%

### Fruits That Don't Freeze Well Whole

Some fruits (strawberry, raspberry) become mushy when frozen and thawed. For inclusions:
- Toss cut fruit in sugar (10-20% of fruit weight) — osmotic dehydration prevents ice crystal damage
- Or use IQF (individually quick frozen) fruit added at the end of churning

### Adjusting for Frozen Puree

Frozen (TK) purees may have slightly different Brix than fresh fruit:
- Cell rupture during freezing releases intracellular sugars → slightly higher effective Brix
- Some brands add sugar or citric acid to purees — check ingredients
- Measure the thawed puree directly with your refractometer
