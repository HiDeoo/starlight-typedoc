import { type DeclarationReflection, PageEvent, type Renderer } from 'typedoc'
import { MarkdownTheme } from 'typedoc-plugin-markdown'

export class StarlightTypedocTheme extends MarkdownTheme {
  static identifier = 'starlight-typedoc-theme'

  constructor(renderer: Renderer) {
    super(renderer)

    this.listenTo(renderer, {
      [PageEvent.END]: this.#onPageEnd,
    })
  }

  #onPageEnd(event: PageEvent<DeclarationReflection>) {
    if (!event.contents) {
      return
    }

    event.contents = `---
title: ${event.model.name}
---

${event.contents}`
  }
}
