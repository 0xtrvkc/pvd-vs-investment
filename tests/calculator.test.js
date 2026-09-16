"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const calculator = require("../calculator.js");

function near(actual, expected, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`
  );
}

function base(overrides = {}) {
  return {
    startAge: 30,
    endAge: 31,
    startSalary: 120000,
    salaryGrowth: 0,
    pvdEmployeeRate: 0.05,
    pvdEmployerRate: 0.05,
    pvdReturn: 0,
    investContributionRate: 0.05,
    investReturn: 0,
    employerCash: false,
    drag: 0,
    taxOn: false,
    taxRate: 0,
    existingPvd: 0,
    existingInvestment: 100000,
    inflation: 0,
    ...overrides
  };
}

test("one year uses twelve monthly contributions without an extra year", () => {
  const result = calculator.simulate(base());
  assert.equal(result.rows.length, 1);
  assert.equal(result.final.age, 31);
  near(result.final.pvdBalance, 12000);
  near(result.final.investAddBalance, 106000);
  near(result.final.investHoldBalance, 100000);
  near(result.totals.pvdEmployee, 6000);
  near(result.totals.pvdEmployer, 6000);
});

test("the no-add path compounds only its starting portfolio", () => {
  const result = calculator.simulate(base({endAge: 40, investReturn: 0.08}));
  near(result.final.investHoldBalance, 100000 * Math.pow(1.08, 10), 0.05);
  assert.ok(result.final.investAddBalance > result.final.investHoldBalance);
});

test("investment additions are independent from the PVD employee rate", () => {
  const result = calculator.simulate(base({
    pvdEmployeeRate: 0.02,
    pvdEmployerRate: 0.02,
    investContributionRate: 0.20,
    existingInvestment: 0
  }));
  near(result.totals.pvdEmployee, 2400);
  near(result.totals.investOwn, 24000);
  near(result.final.investHoldBalance, 0);
});

test("tax adjustment reduces only outside-PVD additions", () => {
  const result = calculator.simulate(base({
    taxOn: true,
    taxRate: 0.20,
    existingInvestment: 0
  }));
  near(result.totals.pvdEmployee, 6000);
  near(result.totals.investOwn, 4800);
});

test("break-even return matches equal cash flows plus fee drag", () => {
  const values = base({
    endAge: 45,
    pvdEmployerRate: 0,
    pvdReturn: 0.06,
    investReturn: 0.09,
    drag: 0.01,
    existingPvd: 100000,
    existingInvestment: 100000
  });
  const result = calculator.simulate(values);
  const rate = calculator.breakEvenRate(values, result.final.pvdBalance);
  near(rate, 0.07, 0.000001);
});

test("a zero-capital no-contribution investment can report no break-even", () => {
  const values = base({
    investContributionRate: 0,
    existingInvestment: 0,
    existingPvd: 50000
  });
  const result = calculator.simulate(values);
  assert.equal(calculator.breakEvenRate(values, result.final.pvdBalance), null);
});
