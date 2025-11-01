# EstraDial

A tool for visualizing estradiol ester concentrations over time based on your injection schedule.

**[Live demo](https://jessibug-os.github.io/EstraDial)**

## What does this do?

If you're doing estradiol injections, you've probably wondered what your levels look like between doses. This calculator uses pharmacokinetic models to show you exactly that. You can:

- Add injections by clicking on a calendar
- Pick different esters for each dose (valerate, cypionate, enanthate, etc.)
- See a graph of your levels over time
- Compare against a reference menstrual cycle
- Repeat your schedule to visualize steady-state levels

## Running locally

```bash
npm install
npm start
```

Then open http://localhost:3000

## How it works

The calculator uses a three-compartment pharmacokinetic model with parameters specific to each ester type. Basically it takes the dose, ester type, and time since injection, runs it through some exponential decay math, and gives you an estimated concentration.

The formula is:
```
c(t) = (dose × D / 5) × k1 × k2 × [exponential terms]
```

Where D, k1, k2, and k3 are different for each ester. For example, valerate has completely different parameters than enanthate, which is why they feel so different.

## Reference cycle data

The "Cis Women Cycle" reference line shown on the graph represents median estradiol levels throughout a natural menstrual cycle. This data comes from:

**"Extensive monitoring of the natural menstrual cycle using the serum biomarkers estradiol, luteinizing hormone and progesterone"** ([PMC8042396](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8042396/))

The study tracked 23 naturally cycling women and provided median estradiol values across cycle phases. Values were standardized to a 29-day cycle with ovulation at day 15, and converted from pmol/L to pg/mL for display in this calculator.

Key reference points:
- Early follicular: ~34 pg/mL
- Mid follicular: ~47 pg/mL
- Late follicular: ~126 pg/mL
- Ovulation peak: ~223 pg/mL
- Mid luteal: ~138 pg/mL

## Supported esters

- Estradiol Benzoate
- Estradiol Valerate
- Estradiol Cypionate
- Estradiol Cypionate Suspension
- Estradiol Enanthate
- Estradiol Undecylate
- Polyestradiol Phosphate

## Credits

This tool builds on work from:
- [Transfeminine Science - Injectable E2 Simulator](https://transfemscience.org/misc/injectable-e2-simulator-advanced/)
- [ESIM Calculator by Gray Oasis](https://grayoasis.com/esim/)
- [Desmos E2 Calculator](https://www.desmos.com/calculator/yrznshtg3k)

## Disclaimer

This is just a model. Real pharmacokinetics vary person to person based on injection site, technique, metabolism, etc. Use this for education and planning, but check actual levels with bloodwork. Always work with your healthcare provider.

## Tech stack

React, TypeScript, Recharts for graphs, deployed on GitHub Pages.

## License

MIT - use it however you want

---

Made by [jessibug-os](https://github.com/jessibug-os)
