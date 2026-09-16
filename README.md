# PVD vs. Investment — Three-Path Retirement Simulator

Live app: https://0xtrvkc.github.io/pvd-vs-investment/

An offline-first web calculator for comparing three retirement account paths:

1. **Stay in PVD** — add an employee percentage of salary and receive an employer contribution.
2. **Investment + add** — start from an existing investment portfolio and add any chosen 0–100% of salary.
3. **Investment + no add** — start from the same investment portfolio but add no new money.

The app is intentionally a scenario lab, not a trading platform. Its dashboard and explicit scenario boundaries borrow the useful product ideas from [QuantDinger](https://github.com/OpenByteInc/QuantDinger)—clear inputs, auditable assumptions, comparison views, monitoring-style KPIs, and local-first operation—without importing its broker, execution, AI, or backend infrastructure.

## What changed in v2

- Added the third **investment + no additions** baseline.
- Decoupled the investment addition rate from the PVD employee rate.
- Expanded investment additions to any value from 0–100% of salary, in 0.1% steps.
- Added independent starting balances for PVD and the investment portfolio.
- Replaced annual lump-sum math with monthly contributions and monthly-equivalent compounding.
- Added negative-return ranges for stress testing.
- Added a comparison guardrail that flags unequal personal savings rates and can match them with one click.
- Updated every KPI, chart, insight, table, and CSV export to include all three paths.
- Added saved local settings, keyboard-accessible switches, and a pure calculation module with automated tests.

## Model

For each month:

```text
monthly salary = annual salary for that career year / 12

PVD balance = prior balance × (1 + monthly PVD return)
            + salary × employee PVD rate
            + salary × employer PVD rate

Investment + add = prior balance × (1 + monthly net investment return)
                 + salary × independent investment addition rate
                 + optional employer cash

Investment + no add = prior balance × (1 + monthly net investment return)
```

Effective annual returns are converted to equivalent monthly rates:

```text
monthly rate = (1 + annual rate)^(1/12) - 1
```

The break-even solver finds the gross investment return at which **investment + add** finishes equal to PVD while holding starting balances, contributions, tax, and fee drag fixed.

## Files

- `index.html` — responsive interface, charts, local state, CSV export, and PWA shell.
- `calculator.js` — dependency-free monthly calculation engine usable in the browser and Node.js.
- `tests/calculator.test.js` — deterministic model tests using Node's built-in test runner.
- `manifest.json` and `icons/` — installable PWA metadata and icons.

## Run

Open `index.html` directly or serve the directory with any static server. No build step or internet connection is required.

Run the calculation tests with Node.js 20 or newer:

```bash
npm test
```

## Important assumptions

- Salary changes once per career year; contributions and compounding occur monthly.
- PVD return is entered net of fund fees. Investment return is entered gross, with optional fee/tax drag subtracted.
- The tax toggle is a simplified marginal-rate adjustment to outside-PVD additions, not a Thai tax return calculator.
- PVD rules, vesting, withdrawal tax, product taxes, and employer policies vary. Confirm the actual terms before making a decision.
- Different starting balances intentionally produce a personal account projection, not an equal-start experiment.

Official references: [Thai SEC — Provident Fund Act (codified PDF)](https://www.sec.or.th/TH/Documents/ActandRoyalEnactment/Act/act-pvd2530-codified.pdf) and [Thai Revenue Department — Personal Income Tax](https://www.rd.go.th/english/6045.html).

This project is educational and does not provide financial, investment, or tax advice.
