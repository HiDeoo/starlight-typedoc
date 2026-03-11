import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        banner: z
          .object({
            content: z.string(),
          })
          .default({
            content:
              'This is a demo of the Starlight TypeDoc plugin — Back to the <a href="https://starlight-typedoc.vercel.app/">documentation</a>.',
          }),
      }),
    }),
  }),
}
