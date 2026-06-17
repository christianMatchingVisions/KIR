// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import { shouldNoindex } from "./src/lib/noindex.ts";

export default defineConfig({
  site: "https://kasinotilmanrekisteroitymista.com",
  output: "static",
  trailingSlash: "always",
  integrations: [
    // Offload GA4 / Google Tag (gtag/dataLayer) to a web worker so the rebuild
    // keeps its 0-main-thread-JS Core Web Vitals profile. `forward` lets the
    // worker proxy calls back to the main-thread dataLayer/gtag globals.
    partytown({
      config: {
        forward: ["dataLayer.push", "gtag"],
      },
    }),
    // Exclude noindexed (closed/stub) casino pages from sitemap-0.xml so we do
    // not advertise thin pages during penalty recovery. shouldNoindex is the
    // single source of truth (also drives the per-page robots meta in
    // BaseLayout). page is an absolute URL string here; filter on its pathname.
    sitemap({
      filter: (page) => !shouldNoindex(new URL(page).pathname),
    }),
  ],
});
