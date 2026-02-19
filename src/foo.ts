/**
 * The kind of thing you could foo.
 */
export type FooTarget = string | undefined;

/**
 * Foos your bar!
 *
 * @param target - The target to foo.
 * @returns Your fooed bar.
 *
 * @remarks
 * This function is documented according to the TSDoc spec. Linting support is
 * built into this template. TSDoc is similar to JSDoc, but is way less verbose
 * as it can take advantage of TypeScript's type system. It also has better
 * support for documenting generics and other TypeScript-specific features.
 *
 * @see {@link https://tsdoc.org/ | TSDoc} for more info!
 */
export const foo = (target: FooTarget) => {
  console.debug(`fooing '${target ?? 'nothing'}'!`);

  return `foo ${target ?? 'nothing'}`;
};
