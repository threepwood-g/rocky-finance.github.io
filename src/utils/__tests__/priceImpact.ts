import { calculatePriceImpact, isHighPriceImpact } from "../priceImpact"

import { BigNumber } from "@ethersproject/bignumber"
import { parseUnits } from "@ethersproject/units"

describe("calculatePriceImpact", () => {
  it("correctly calculates value for 0 input", () => {
    expect(
      calculatePriceImpact(
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(10).pow(18),
      ),
    ).toEqual(BigNumber.from(0))
  })

  it("correctly calculates value for imbalanced / low liquidity pool", () => {
    expect(
      calculatePriceImpact(
        parseUnits("4", 18), // deposit 4 tokens
        parseUnits("2", 18), // receieve 2 back
        parseUnits("1", 18),
      ),
    ).toEqual(parseUnits("-0.5", 18)) // 4/2 == -.5 slippage
  })

  it("correctly calculates value for balanced pool", () => {
    expect(
      calculatePriceImpact(
        parseUnits("4", 18), // deposit 4 tokens
        parseUnits("3.89", 18), // recieve 3.89 back
        parseUnits("1.03", 18),
      ),
    ).toEqual(parseUnits("0.001675", 18))
  })
})

describe("isHighPriceImpact", () => {
  it("returns true for impact >= 1%", () => {
    const negOnePct = BigNumber.from(10)
      .pow(18 - 2)
      .mul(-1)
    const negTwoPct = BigNumber.from(10)
      .pow(18 - 2)
      .mul(-2)
    expect(isHighPriceImpact(negOnePct)).toBe(true)
    expect(isHighPriceImpact(negTwoPct)).toBe(true)
  })

  it("returns false for impact < 1%", () => {
    const posOnePct = BigNumber.from(10).pow(18 - 2)
    expect(isHighPriceImpact(posOnePct)).toBe(false)
    expect(isHighPriceImpact(BigNumber.from(0))).toBe(false)
  })
})
