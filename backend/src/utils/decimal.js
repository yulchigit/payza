const DEFAULT_SCALE = 8n;

const pow10 = (scale) => 10n ** BigInt(scale);

const normalizeDecimalInput = (value) => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Decimal value must be finite.");
    }
    return value.toFixed(Number(DEFAULT_SCALE));
  }

  const normalized = String(value ?? "").trim();
  if (!normalized) {
    throw new Error("Decimal value is required.");
  }

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid decimal value: ${normalized}`);
  }

  return normalized;
};

const decimalToUnits = (value, scale = DEFAULT_SCALE) => {
  const normalized = normalizeDecimalInput(value);
  const factorScale = BigInt(scale);
  const factor = pow10(factorScale);
  const isNegative = normalized.startsWith("-");
  const unsigned = isNegative ? normalized.slice(1) : normalized;
  const [integerPart, fractionPart = ""] = unsigned.split(".");
  const paddedFraction = fractionPart.padEnd(Number(factorScale) + 1, "0");
  const mainFraction = paddedFraction.slice(0, Number(factorScale)) || "0";
  const roundDigit = paddedFraction[Number(factorScale)] || "0";

  let units = (BigInt(integerPart || "0") * factor) + BigInt(mainFraction);
  if (roundDigit >= "5") {
    units += 1n;
  }

  return isNegative ? -units : units;
};

const unitsToDecimal = (units, scale = DEFAULT_SCALE, { trimTrailingZeros = true } = {}) => {
  const factorScale = BigInt(scale);
  const factor = pow10(factorScale);
  const value = BigInt(units);
  const isNegative = value < 0n;
  const absolute = isNegative ? -value : value;
  const integerPart = absolute / factor;
  const fractionPart = String(absolute % factor).padStart(Number(factorScale), "0");

  if (!trimTrailingZeros) {
    return `${isNegative ? "-" : ""}${integerPart}.${fractionPart}`;
  }

  const trimmedFraction = fractionPart.replace(/0+$/, "");
  if (!trimmedFraction) {
    return `${isNegative ? "-" : ""}${integerPart}`;
  }

  return `${isNegative ? "-" : ""}${integerPart}.${trimmedFraction}`;
};

const roundDivision = (numerator, denominator) => {
  const dividend = BigInt(numerator);
  const divisor = BigInt(denominator);

  if (divisor === 0n) {
    throw new Error("Division by zero.");
  }

  const quotient = dividend / divisor;
  const remainder = dividend % divisor;
  const remainderAbs = remainder < 0n ? -remainder : remainder;
  const divisorAbs = divisor < 0n ? -divisor : divisor;

  if (remainderAbs * 2n < divisorAbs) {
    return quotient;
  }

  return quotient >= 0n ? quotient + 1n : quotient - 1n;
};

const multiplyUnits = (left, right, scale = DEFAULT_SCALE) => {
  const factor = pow10(BigInt(scale));
  return roundDivision(BigInt(left) * BigInt(right), factor);
};

const divideUnits = (left, right, scale = DEFAULT_SCALE) => {
  const factor = pow10(BigInt(scale));
  return roundDivision(BigInt(left) * factor, BigInt(right));
};

const clampMinUnits = (value, minimum) => (BigInt(value) < BigInt(minimum) ? BigInt(minimum) : BigInt(value));

module.exports = {
  DEFAULT_SCALE,
  decimalToUnits,
  unitsToDecimal,
  multiplyUnits,
  divideUnits,
  clampMinUnits
};
