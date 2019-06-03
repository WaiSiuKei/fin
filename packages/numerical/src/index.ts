/**
 * A very small absolute value used to check if a value is very close to
 * zero. The value should be large enough to offset any floating point
 * noise, but small enough to be meaningful in computation in a nominal
 * range (see MACHINE_EPSILON).
 *
 * http://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
 * http://www.cs.berkeley.edu/~wkahan/Math128/Cubic.pdf
 */
export const EPSILON = 1e-12;
/**
 * The machine epsilon for a double precision (Javascript Number) is
 * 2.220446049250313e-16. (try this in the js console:
 *     (function(){ for (var e = 1; 1 < 1+e/2;) e/=2; return e }())
 *
 * The constant MACHINE_EPSILON here refers to the constants δ and ε
 * such that, the error introduced by addition, multiplication on a
 * 64bit float (js Number) will be less than δ and ε. That is to say,
 * for all X and Y representable by a js Number object, S and P be their
 * 'exact' sum and product respectively, then
 * |S - (x+y)| <= δ|S|, and |P - (x*y)| <= ε|P|.
 * This amounts to about half of the actual machine epsilon.
 */
export const MACHINE_EPSILON = 1.12e-16;

/**
 * The epsilon to be used when handling curve-time parameters. This
 * cannot be smaller, because errors add up to around 2e-7 in the bezier
 * fat-line clipping code as a result of recursive sub-division.
 */
export const CURVETIME_EPSILON = 1e-8;
/**
 * The epsilon to be used when performing "geometric" checks, such as
 * distances between points and lines.
 */
export const GEOMETRIC_EPSILON = 1e-7;
/**
 * The epsilon to be used when performing "trigonometric" checks, such
 * as examining cross products to check for collinearity.
 */
export const TRIGONOMETRIC_EPSILON = 1e-8;
/**
 * Kappa is the value which which to scale the curve handles when
 * drawing a circle with bezier curves.
 *
 * http://whizkidtech.redprince.net/bezier/circle/kappa/
 */

/**
 * Returns a number whose value is clamped by the given range.
 *
 * @param {Number} value the value to be clamped
 * @param {Number} min the lower boundary of the range
 * @param {Number} max the upper boundary of the range
 * @return {Number} a number in the range of [min, max]
 */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function approximately(a: number, b: number, precision = EPSILON): boolean {
  return Math.abs(a - b) <= precision;
}

/**
 * Checks if the value is 0, within a tolerance defined by
 * Numerical.EPSILON.
 */
export function isZero(val) {
  return val >= -EPSILON && val <= EPSILON;
}

export const PI2 = Math.PI * 2;
