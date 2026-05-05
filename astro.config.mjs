// @ts-check
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [icon(), react()],
});