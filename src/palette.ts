import type { CSSProperties } from "react"
import { adjust } from "./gl_program/helper"

// TODO: these are the same brand colors as the :root tokens in App.css and the constants in Bubbles.ts and Waves.ts; make this the only copy by importing it there.
const brand = { red: 0xfd4d69, green: 0x49d773, blue: 0x459bc9 }

const css = (hex: number) => `#${hex.toString(16).padStart(6, "0")}`

/** CSS brand colors for the logo, toned by the same brightness and saturation as the background. */
export function palette(brightness: number, saturation: number) {
  const tone = { l: brightness, s: saturation }
  return {
    "--red": css(adjust(brand.red, tone)),
    "--green": css(adjust(brand.green, tone)),
    "--blue": css(adjust(brand.blue, tone)),
  } as CSSProperties
}
