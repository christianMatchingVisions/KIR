import { defineCollection, z } from "astro:content";
import { contentEngineLoader } from "./lib/content-engine-loader";

export const collections = {
  articles: defineCollection({
    loader: contentEngineLoader({
      apiUrl: import.meta.env.CE_API_URL,
      apiKey: import.meta.env.CE_API_KEY,
    }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      language: z.string(),
      publishedAt: z.string().nullable(),
      // ISO last-modified date — powers the "Päivitetty" freshness line.
      // Optional so older synced entries (pre-field) still validate.
      updatedAt: z.string().nullable().optional(),
      heroImage: z.string().nullable(),
      // Alt text for the hero image when the engine supplies it.
      heroImageAlt: z.string().nullable().optional(),
    }),
  }),
};
