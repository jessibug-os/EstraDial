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
