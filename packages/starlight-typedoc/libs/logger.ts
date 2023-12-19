import { bold, cyan, dim, red, reset, yellow } from 'kleur/colors'
import { LogLevel, Logger } from 'typedoc'

// https://github.com/withastro/astro/blob/1c7b6359563f5e83325121efb2e61915d818a35a/packages/astro/src/core/logger/node.ts
export class StarlightTypeDocLogger extends Logger {
  #dateTimeFormat = new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  #type = '[typedoc]'

  override log(message: string, level: LogLevel): void {
    super.log(message, level)

    if (level < this.level) {
      return
    }

    const destination = level < LogLevel.Error ? process.stdout : process.stderr

    destination.write(this.#getPrefix(level))
    destination.write(message)
    destination.write('\n')
  }

  #getPrefix(level: LogLevel) {
    const dateTime = dim(`${this.#dateTimeFormat.format(new Date())} `)
    let type = bold(this.#type)

    switch (level) {
      case LogLevel.Info: {
        type = bold(cyan(this.#type))
        break
      }
      case LogLevel.Warn: {
        type = bold(yellow(this.#type))
        break
      }
      case LogLevel.Error: {
        type = bold(red(this.#type))
        break
      }
    }

    return reset(`${dateTime}${type} `)
  }
}
