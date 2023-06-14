/**
 * This is a Bar class.
 */
export class Bar {
  /**
   * The bar property.
   * @default 'bar'
   */
  readonly bar = 'bar'

  /**
   * This does something.
   */
  doSomething() {
    this.#doSomethingElse()

    return 'something'
  }

  #doSomethingElse() {
    return 'something else'
  }
}
