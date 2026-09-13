/**
 * cx — Conditional ClassName Joiner
 * ----------------------------------
 * Tiny `clsx`-style utility for combining CSS Module class references with
 * the shared global `.pixel-*` design-system classes (see `src/global.css`)
 * and any conditional variant classes.
 *
 * Accepts strings, falsy values (ignored), and `[condition, className]`
 * tuples so call sites read as a flat, declarative list instead of nested
 * ternaries embedded inside a template literal.
 *
 * @example
 * cx(styles.card, "pixel-card", [isDone, styles.cardDone])
 */
type ClassValue = string | false | null | undefined | [condition: unknown, className: string];

export function cx(...values: ClassValue[]): string {
  const classes: string[] = [];

  for (const value of values) {
    if (!value) continue;

    if (Array.isArray(value)) {
      const [condition, className] = value;
      if (condition && className) classes.push(className);
      continue;
    }

    classes.push(value);
  }

  return classes.join(" ");
}
