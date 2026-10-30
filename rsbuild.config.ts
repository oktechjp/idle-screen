// @ts-check
import { readFileSync } from "node:fs"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

const favicon = readFileSync(new URL("./src/favicon.png", import.meta.url))

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: "./index.html",
    inject: "body",
    tags: [
      {
        tag: "link",
        attrs: {
          rel: "icon",
          href: `data:image/png;base64,${favicon.toString("base64")}`,
        },
      },
    ],
  },
  output: {
    inlineScripts: true,
    inlineStyles: true,
    legalComments: "inline",
  },
  splitChunks: false,
})
