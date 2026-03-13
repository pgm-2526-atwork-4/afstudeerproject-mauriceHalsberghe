export function formatQuantity(value: number) {
  const whole = Math.floor(value);
  const fraction = value - whole;

  const fractions: Record<number, string> = {
    0.25: "¼",
    0.5: "½",
    0.75: "¾",
  };

  const roundedFraction = Math.round(fraction * 100) / 100;

  if (fractions[roundedFraction]) {
    if (whole === 0) return fractions[roundedFraction];
    return `${whole} ${fractions[roundedFraction]}`;
  }

  return value.toString();
}