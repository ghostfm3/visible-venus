// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import remarkYoutubeEmbed from "./src/lib/remark-youtube-embed.mjs";
import remarkExternalLink from "./src/lib/remark-external-link.mjs";
import remarkPanoramaEmbed from "./src/lib/remark-panorama-embed.mjs";

// https://astro.build/config
// export default defineConfig({});

export default defineConfig({
  markdown: {
    processor: unified({ remarkPlugins: [remarkYoutubeEmbed, remarkExternalLink, remarkPanoramaEmbed] }),
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});
