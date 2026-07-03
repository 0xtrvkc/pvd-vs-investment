live: https://0xtrvkc.github.io/pvd-vs-investment/

# PVD vs. Self-Directed Investing — Retirement Comparison

A single-file, offline web app that answers one question: **should you stay in your employer's Provident Fund (PVD), or opt out and invest the same money yourself?**

Open `index.html` in any desktop browser (Chrome, Safari, Edge, Firefox). No install, no server, no internet connection required — everything runs client-side. Built for desktop/laptop screens (macOS-styled UI); not optimized for mobile.

---

## What it does

You enter your salary, contribution rates, and return assumptions once on the left. The app then simulates two parallel scenarios, year by year, from your current age to retirement:

- **Scenario A — Stay in PVD**: you contribute a % of salary, your employer matches it, and the combined balance grows at your PVD fund's return.
- **Scenario B — Opt out, invest yourself**: you keep your own contribution (same amount, same schedule) and invest it yourself at your own expected return — with the employer match forfeited by default, since most employers only pay it into PVD.

Every chart, KPI, and table on the page recalculates live as you move any slider or toggle.

## Key features

| Section | What it shows |
|---|---|
| Scoreboard | Final balance for both scenarios side by side, with a live "who's ahead" bar |
| KPI cards | PVD balance, self-invest balance, the gap, employer match forfeited (future value), break-even return needed, and the winning scenario's growth multiple |
| Summary insights | Plain-language takeaways that update with your inputs |
| Growth trajectory | Both balances over time, with a shaded band showing who's ahead at each age |
| Composition chart | What each final balance is made of — employee contribution, employer contribution, investment growth |
| Break-even analysis | The self-invest return rate needed to match PVD, plotted against a range of possible returns |
| Real (inflation-adjusted) chart | Both balances re-stated in today's purchasing power |
| Qualitative comparison table | Non-numeric factors: tax treatment, liquidity, control, discipline, fees, risk |
| Year-by-year table + CSV export | Full detail for every year, both scenarios, exportable |

## Inputs you control

- **Career & salary**: starting age, retirement age, starting salary, annual salary growth
- **PVD contribution rates**: your rate (2–15%, Thai legal range) and employer's rate (defaults to matching yours 1:1)
- **Scenario A assumptions**: PVD fund return (presets: 0% / conservative 2% / balanced 4%)
- **Scenario B assumptions**: investment return (presets: conservative 4% / moderate 8% / growth 12%), whether the employer pays the match as cash if you opt out, fees/tax drag on returns, and whether to account for income tax on contributions
- **Adjustments**: existing PVD balance from a prior job, inflation rate for the real-terms chart

## How the numbers are calculated

For each year from your starting age to retirement:

```
salary(t)        = salary(t-1) × (1 + salary growth)
employeeContrib   = salary(t) × employee rate
employerContrib   = salary(t) × employer rate

# Scenario A — PVD
pvdBalance(t)     = (pvdBalance(t-1) + employeeContrib + employerContrib) × (1 + PVD fund return)

# Scenario B — self-invest
selfContrib       = employeeContrib  [+ employerContrib, only if "employer pays cash" is on]
selfContrib       = selfContrib × (1 − marginal tax rate)   [only if "account for income tax" is on]
selfBalance(t)    = (selfBalance(t-1) + selfContrib) × (1 + investment return − fees/tax drag)
```

**Break-even return** is solved numerically (binary search): the investment return Scenario B would need — holding your contribution, tax, and fee settings fixed — for its final balance to equal Scenario A's.

**Employer match forfeited** is shown as a future value: what those forgone employer contributions would have grown to by retirement, compounded at the PVD fund return rate — not just their nominal sum.

## What was fixed from the original spreadsheet

The source `Book1.xlsx` had two issues this app corrects:

1. **Wrong basis for the investment column.** The formula referenced the cumulative PVD *total* balance instead of your own annual contribution, so it wasn't actually modeling "invest the same money yourself" — it was compounding an unrelated number.
2. **No investment growth assumed for PVD.** The PVD columns were a running sum of contributions only (implicitly 0% return), which understates how real PVD funds perform since they are invested per a member-selected policy, not held as cash.

You can reproduce the original spreadsheet's exact numbers by setting the PVD fund return preset to **0% (No growth)** — this was verified to match the source file's totals precisely.

## Assumptions & limitations

- Contributions and salary growth are modeled as simple annual compounding, not monthly.
- Thai PVD contribution limits (2–15% per side) are enforced only as slider bounds, not validated against your specific fund's rules.
- Tax treatment is simplified to a single marginal rate applied uniformly; real Thai personal income tax is progressive and PVD deduction limits are capped (currently 15% of salary, up to ฿500,000/year, combined with certain other retirement vehicles).
- Investment return, PVD fund return, and inflation are constant assumptions — real markets and inflation are not constant year to year.
- **This tool is for illustration and planning discussion only — it is not financial or tax advice.** Speak with your PVD's registered advisor or a licensed financial planner before making retirement decisions.

## Files

- `index.html` — the complete app (HTML, CSS, and JavaScript in one file, no external dependencies)
- `Book1.xlsx` — original source data (for reference; no longer needed to run the app)
