(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PVDCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MONTHS_PER_YEAR = 12;
  const MIN_ANNUAL_RATE = -0.999;

  function finite(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalize(raw) {
    const startAge = Math.round(clamp(finite(raw.startAge, 28), 18, 69));
    const endAge = Math.round(clamp(finite(raw.endAge, 60), startAge + 1, 70));

    return {
      startAge,
      endAge,
      startSalary: Math.max(0, finite(raw.startSalary, 600000)),
      salaryGrowth: clamp(finite(raw.salaryGrowth, 0.03), -0.99, 2),
      pvdEmployeeRate: clamp(finite(raw.pvdEmployeeRate, 0.05), 0, 1),
      pvdEmployerRate: clamp(finite(raw.pvdEmployerRate, 0.05), 0, 1),
      pvdReturn: Math.max(MIN_ANNUAL_RATE, finite(raw.pvdReturn, 0.04)),
      investContributionRate: clamp(finite(raw.investContributionRate, 0.05), 0, 1),
      investReturn: Math.max(MIN_ANNUAL_RATE, finite(raw.investReturn, 0.08)),
      employerCash: Boolean(raw.employerCash),
      drag: Math.max(0, finite(raw.drag, 0)),
      taxOn: Boolean(raw.taxOn),
      taxRate: clamp(finite(raw.taxRate, 0), 0, 1),
      existingPvd: Math.max(0, finite(raw.existingPvd, 0)),
      existingInvestment: Math.max(0, finite(raw.existingInvestment, 0)),
      inflation: Math.max(MIN_ANNUAL_RATE, finite(raw.inflation, 0.025))
    };
  }

  function annualToMonthly(rate) {
    return Math.pow(1 + Math.max(MIN_ANNUAL_RATE, rate), 1 / MONTHS_PER_YEAR) - 1;
  }

  function contributionAfterTax(amount, values) {
    return values.taxOn ? amount * (1 - values.taxRate) : amount;
  }

  function simulate(rawValues) {
    const values = normalize(rawValues);
    const totalMonths = (values.endAge - values.startAge) * MONTHS_PER_YEAR;
    const pvdMonthlyReturn = annualToMonthly(values.pvdReturn);
    const investNetAnnualReturn = Math.max(MIN_ANNUAL_RATE, values.investReturn - values.drag);
    const investMonthlyReturn = annualToMonthly(investNetAnnualReturn);

    let pvdBalance = values.existingPvd;
    let investAddBalance = values.existingInvestment;
    let investHoldBalance = values.existingInvestment;
    let employerForfeitFutureValue = 0;

    let pvdEmployeeTotal = 0;
    let pvdEmployerTotal = 0;
    let investOwnTotal = 0;
    let investEmployerCashTotal = 0;
    const rows = [];

    let yearlyPvdEmployee = 0;
    let yearlyPvdEmployer = 0;
    let yearlyInvestOwn = 0;
    let yearlyInvestEmployerCash = 0;

    for (let month = 1; month <= totalMonths; month += 1) {
      const salaryYear = Math.floor((month - 1) / MONTHS_PER_YEAR);
      const annualSalary = values.startSalary * Math.pow(1 + values.salaryGrowth, salaryYear);
      const monthlySalary = annualSalary / MONTHS_PER_YEAR;
      const pvdEmployee = monthlySalary * values.pvdEmployeeRate;
      const pvdEmployer = monthlySalary * values.pvdEmployerRate;
      const investOwnGross = monthlySalary * values.investContributionRate;
      const investEmployerCashGross = values.employerCash ? pvdEmployer : 0;
      const investOwn = contributionAfterTax(investOwnGross, values);
      const investEmployerCash = contributionAfterTax(investEmployerCashGross, values);

      pvdBalance = pvdBalance * (1 + pvdMonthlyReturn) + pvdEmployee + pvdEmployer;
      investAddBalance = investAddBalance * (1 + investMonthlyReturn) + investOwn + investEmployerCash;
      investHoldBalance *= 1 + investMonthlyReturn;
      employerForfeitFutureValue = values.employerCash
        ? 0
        : employerForfeitFutureValue * (1 + pvdMonthlyReturn) + pvdEmployer;

      pvdEmployeeTotal += pvdEmployee;
      pvdEmployerTotal += pvdEmployer;
      investOwnTotal += investOwn;
      investEmployerCashTotal += investEmployerCash;
      yearlyPvdEmployee += pvdEmployee;
      yearlyPvdEmployer += pvdEmployer;
      yearlyInvestOwn += investOwn;
      yearlyInvestEmployerCash += investEmployerCash;

      if (month % MONTHS_PER_YEAR === 0) {
        rows.push({
          age: values.startAge + month / MONTHS_PER_YEAR,
          year: month / MONTHS_PER_YEAR,
          salary: annualSalary,
          pvdEmployee: yearlyPvdEmployee,
          pvdEmployer: yearlyPvdEmployer,
          pvdBalance,
          pvdPrincipal: values.existingPvd + pvdEmployeeTotal + pvdEmployerTotal,
          pvdGrowth: pvdBalance - values.existingPvd - pvdEmployeeTotal - pvdEmployerTotal,
          investOwn: yearlyInvestOwn,
          investEmployerCash: yearlyInvestEmployerCash,
          investContribution: yearlyInvestOwn + yearlyInvestEmployerCash,
          investAddBalance,
          investAddPrincipal: values.existingInvestment + investOwnTotal + investEmployerCashTotal,
          investAddGrowth: investAddBalance - values.existingInvestment - investOwnTotal - investEmployerCashTotal,
          investHoldBalance,
          investHoldGrowth: investHoldBalance - values.existingInvestment,
          addVsPvdGap: investAddBalance - pvdBalance,
          holdVsPvdGap: investHoldBalance - pvdBalance,
          employerForfeitFutureValue
        });

        yearlyPvdEmployee = 0;
        yearlyPvdEmployer = 0;
        yearlyInvestOwn = 0;
        yearlyInvestEmployerCash = 0;
      }
    }

    const final = rows[rows.length - 1];
    return {
      values,
      rows,
      totals: {
        pvdEmployee: pvdEmployeeTotal,
        pvdEmployer: pvdEmployerTotal,
        investOwn: investOwnTotal,
        investEmployerCash: investEmployerCashTotal,
        employerForfeitFutureValue
      },
      final
    };
  }

  function investmentFinalAtRate(rawValues, grossAnnualRate) {
    const values = normalize({ ...rawValues, investReturn: grossAnnualRate });
    const totalMonths = (values.endAge - values.startAge) * MONTHS_PER_YEAR;
    const netAnnualRate = Math.max(MIN_ANNUAL_RATE, grossAnnualRate - values.drag);
    const monthlyReturn = annualToMonthly(netAnnualRate);
    let balance = values.existingInvestment;

    for (let month = 1; month <= totalMonths; month += 1) {
      const salaryYear = Math.floor((month - 1) / MONTHS_PER_YEAR);
      const annualSalary = values.startSalary * Math.pow(1 + values.salaryGrowth, salaryYear);
      const monthlySalary = annualSalary / MONTHS_PER_YEAR;
      const ownGross = monthlySalary * values.investContributionRate;
      const employerGross = values.employerCash
        ? monthlySalary * values.pvdEmployerRate
        : 0;
      const contribution = contributionAfterTax(ownGross + employerGross, values);
      balance = balance * (1 + monthlyReturn) + contribution;
    }

    return balance;
  }

  function breakEvenRate(rawValues, pvdFinal) {
    const values = normalize(rawValues);
    const target = Math.max(0, finite(pvdFinal, 0));
    let low = MIN_ANNUAL_RATE + values.drag;
    let high = Math.max(0.25, values.pvdReturn + values.drag + 0.1);
    const lowValue = investmentFinalAtRate(values, low);

    if (lowValue >= target) return low;
    while (high < 10 && investmentFinalAtRate(values, high) < target) high *= 2;
    if (investmentFinalAtRate(values, high) < target) return null;

    for (let index = 0; index < 80; index += 1) {
      const middle = (low + high) / 2;
      if (investmentFinalAtRate(values, middle) < target) low = middle;
      else high = middle;
    }
    return (low + high) / 2;
  }

  return {
    MONTHS_PER_YEAR,
    normalize,
    annualToMonthly,
    simulate,
    investmentFinalAtRate,
    breakEvenRate
  };
});
