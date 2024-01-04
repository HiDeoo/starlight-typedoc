export { doThingA as doThingARef } from './functions'

/**
 * This is a string variable.
 */
export const aString = 'the_string_value'

// eslint-disable-next-line import/no-mutable-exports
export let anUndefinedString: string

/**
 * This is an object variable.
 */
export const anObject = {
  /**
   * This is foo.
   */
  foo: 'Foo',
  bar: {
    /**
     * This is baz.
     * @beta
     */
    baz: ['Baz'],
  },
}

export const anObjectAsConst = {
  foo: 'Foo',
  bar: {
    baz: ['Baz'],
  },
} as const

export enum ANumericEnum {
  Foo,
  Bar,
}

export enum AStringEnum {
  Foo = 'foo',
  Bar = 'bar',
}
