# pvd-vs-investment

Single-file HTML sim comparing two ways your contributions can sit: plain PVD (no growth) vs the same cash compounding in an investment account. Mobile-first, 8-bit, Gundam palette because default Bootstrap blue is depressing.

## Run it

Open `index.html`. That's it, no build step.

```
python3 -m http.server -d . 8000
```

or just double-click the file.

## What it does

- You set: start/end age, starting salary, salary growth %, PVD %, investment return %.
- Optional knobs: employer match %, delayed investment start age, existing balance, inflation.
- Salary compounds yearly. PVD contributions just stack (no growth — that's the point of the comparison). The same contribution stream, from your chosen start age, also gets dumped into an investment account that compounds at your return rate.
- Chart + year-by-year table show both tracks side by side so you can see where compounding actually starts pulling ahead.

## Model, precisely

```
salary[y] = salary[y-1] * (1 + growth)
contribution[y] = salary[y] * (employee% + employer%)
pvd[y] = pvd[y-1] + contribution[y]
invest[y] = (invest[y-1] + contribution[y]) * (1 + return%)   // from investStartAge onward
```

No fees, no taxes, no volatility — it's a straight-line compounding demo, not a Monte Carlo. Use it to build intuition, not to plan your actual retirement.

## Stack

Vanilla HTML/CSS/JS. No dependencies, no npm install. Fonts pulled from Google Fonts CDN, everything else is inline.

## License

MIT. Do whatever.
