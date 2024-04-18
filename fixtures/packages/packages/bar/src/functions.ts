/**
 * A function that does a bar thing.
 */
export function doBar() {
  return 'doBar'
}

/**
 * A function that does another bar thing but better.
 *
 * This is a better alternative to {@link doBar}.
 */
export function doBarBetter(options: DoBarBetterOptions) {
  return options.name
}

/**
 * Options for {@link doBarBetter}
 */
export interface DoBarBetterOptions {
  name: string
  number: number
}
