/**
 * A function that does a thing.
 */
export function doThingA() {
  return 'thingA'
}

/**
 * A function that does another thing.
 * @deprecated
 */
export function doThingB() {
  return 'thingB'
}

/**
 * A function that does another thing.
 * @deprecated Use the new {@link doThingFaster} function instead.
 */
export function doThingC() {
  return 'thingC'
}

/**
 * A function that does another thing but faster.
 */
export function doThingFaster() {
  return 'thingB'
}
