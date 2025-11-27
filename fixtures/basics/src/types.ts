export interface Thing {
  /**
   * This is foo.
   */
  foo: string
  /**
   * This is bar.
   * @experimental
   */
  bar: number
}

export type Things = Thing[]

export type ThingWithBazAndQuux = Thing & {
  baz: string
  /**
   * @see {@link ThingWithBazAndQuux.baz}
   */
  quux: number[]
}
