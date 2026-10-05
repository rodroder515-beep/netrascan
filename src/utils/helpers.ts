/**
 * Math and animation helpers for scroll scrubbing and easing.
 */

export const clamp = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max);
};

/**
 * Standard smoothstep polynomial: 3*t^2 - 2*t^3
 */
export const smooth = (t: number): number => {
  return t * t * (3 - 2 * t);
};

/**
 * Smooth ramp between progress a and b.
 * If b <= a: returns 1 if p >= b else 0.
 * Otherwise returns smoothstep of clamped (p - a) / (b - a).
 */
export const ramp = (p: number, a: number, b: number): number => {
  if (b <= a) {
    return p >= b ? 1 : 0;
  }
  const t = clamp((p - a) / (b - a), 0, 1);
  return smooth(t);
};
