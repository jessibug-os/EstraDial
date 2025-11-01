# EstraDial

**[Try it here →](https://jessibug-os.github.io/estradial)**

A visual calculator for tracking estradiol levels from injections. Click days to add doses, pick your ester, see what your levels do over time.

## Features

Tired of guessing what's happening between injection days? This thing models it for you:

- Click-to-add calendar for scheduling injections
- Mix and match esters (valerate, cypionate, enanthate, you name it)
- Live graph showing your projected levels
- Reference line comparing to cis women's natural cycle
- Repeat mode to see what steady-state looks like

## Running it yourself

```bash
npm install
npm start
```

Then open http://localhost:3000

## How it works

Uses a three-compartment pharmacokinetic model. Each ester has its own parameters (D, k1, k2, k3) that describe how it releases and metabolizes. The math:

```
c(t) = (dose × D / 5) × k1 × k2 × [exponential terms]
```

This is why valerate and enanthate feel so different - they literally have different decay curves.

## Reference data

The orange reference line comes from [this study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8042396/) tracking estradiol levels in 23 cis women across their cycles. Converted from pmol/L to pg/mL so you can compare directly:

Typical levels throughout the month:
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

## Important

This is a model, not a blood test. Everyone metabolizes differently based on injection site, technique, body composition, etc. Use this for planning and education, but get actual bloodwork to know your real levels. Talk to your healthcare provider about dosing.

## Built with

React + TypeScript + Recharts, deployed on GitHub Pages.

## License

MIT - use it however you want

---

Made by [jessibug-os](https://github.com/jessibug-os)
