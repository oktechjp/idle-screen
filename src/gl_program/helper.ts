export interface ColorAdjust {
  h?: number
  s?: number
  l?: number
  hMul?: number
  sMul?: number
  lMul?: number
}

export function getTodayInstant(
  timeZone: string,
  opts: Temporal.PlainTimeLike,
) {
  const instant = Temporal.Now.instant()
  return instant
    .toZonedDateTimeISO(timeZone)
    .toPlainDate()
    .toPlainDateTime(opts)
    .toZonedDateTime(timeZone)
    .toInstant()
}

export function dateToInstant(date: Date | null) {
  if (!date) return null
  return Temporal.Instant.fromEpochMilliseconds(date.getTime())
}

export function adjust(hex: number, opts: ColorAdjust) {
  return hexToHsl(hex).adjust(opts).toHex()
}

export class HSL {
  h: number
  s: number
  l: number

  constructor(h: number, s: number, l: number) {
    this.h = h
    this.s = s
    this.l = l
  }

  adjust(opts: ColorAdjust) {
    const { h, s, l, hMul, sMul, lMul } = opts

    if (h !== undefined) this.h = h
    if (s !== undefined) this.s = s
    if (l !== undefined) this.l = l
    if (hMul !== undefined) this.h *= hMul
    if (sMul !== undefined) this.s *= sMul
    if (lMul !== undefined) this.l *= lMul
    return this
  }

  toHex() {
    const { h, s, l } = this
    let c = (1 - Math.abs(2 * l - 1)) * s
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    let m = l - c / 2
    c = ((c + m) * 0xff) & 0xff
    x = ((x + m) * 0xff) & 0xff
    m = (m * 0xff) & 0xff

    let r: number, g: number, b: number

    if (h < 60) [r, g, b] = [c, x, m]
    else if (h < 120) [r, g, b] = [x, c, m]
    else if (h < 180) [r, g, b] = [m, c, x]
    else if (h < 240) [r, g, b] = [m, x, c]
    else if (h < 300) [r, g, b] = [x, m, c]
    else [r, g, b] = [c, m, x]

    return (r << 16) | (g << 8) | b
  }
}

export function hexToHsl(hex: number): HSL {
  const r = ((hex & 0xff0000) >> 16) / 0xff
  const g = ((hex & 0xff00) >> 8) / 0xff
  const b = (hex & 0xff) / 0xff

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))

    switch (max) {
      case r:
        h = 60 * (((g - b) / delta) % 6)
        break
      case g:
        h = 60 * ((b - r) / delta + 2)
        break
      case b:
        h = 60 * ((r - g) / delta + 4)
        break
    }

    if (h < 0) h += 360
  }

  return new HSL(h, s, l)
}

export class AccessUniform {
  public readonly name: string
  protected readonly gl: WebGLRenderingContext
  protected readonly location: WebGLUniformLocation | null
  constructor(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
    this.gl = gl
    this.name = name
    this.location = gl.getUniformLocation(program, name)
  }
}

export class AccessUniform1f extends AccessUniform {
  public set(value: number) {
    this.gl.uniform1f(this.location, value)
  }
}

export class AccessUniform2f extends AccessUniform {
  public set(a: number, b: number) {
    this.gl.uniform2f(this.location, a, b)
  }
}

export class AccessUniform3f extends AccessUniform {
  public set(a: number, b: number, c: number) {
    this.gl.uniform3f(this.location, a, b, c)
  }

  public setHex(hex: number) {
    const rHex = (hex & 0xff0000) >> 16
    const gHex = (hex & 0xff00) >> 8
    const bHex = hex & 0xff
    this.set(rHex / 0xff, gHex / 0xff, bHex / 0xff)
  }
}

const accessors = {
  "1f": AccessUniform1f,
  "2f": AccessUniform2f,
  "3f": AccessUniform3f,
} satisfies { [key: string]: AccessUniform["constructor"] }

export function endlessBackandForth(now: number, duration: number) {
  let normal = (now % duration) / duration - 0.5
  const mul = normal > 0 ? 1 : -1
  normal *= mul
  normal = normal * mul + 0.5
  if (normal > 0.5) {
    normal = 1 - normal
  }
  return normal * 2
}

export function getLocations<
  T extends { [key: string]: keyof typeof accessors },
>(gl: WebGLRenderingContext, program: WebGLProgram, locations: T) {
  const result: { [key: string]: AccessUniform } = {}
  for (const [key, value] of Object.entries(locations)) {
    result[key] = new accessors[value](gl, program, key)
  }
  return result as {
    [key in keyof T]: (typeof accessors)[T[key]] extends {
      // biome-ignore lint/suspicious/noExplicitAny: the method args are not relevant
      new (...args: any[]): infer T
    }
      ? T
      : never
  }
}
