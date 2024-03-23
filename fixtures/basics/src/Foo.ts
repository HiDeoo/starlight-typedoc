import { Bar } from './Bar'
import type { Thing } from './types'

/**
 * This is a Foo class.
 */
export class Foo extends Bar {
  /**
   * The foo property.
   * @default 'foo'
   */
  readonly foo = 'foo'

  /**
   * Parse a thing.
   * @see {@link Thing}
   */
  parseThing(thing: Thing) {
    return thing
  }
}
