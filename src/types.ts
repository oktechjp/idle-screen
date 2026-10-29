import type { HTMLAttributes, StyleHTMLAttributes } from "react"

export interface Shader {
  type: ShaderTypeType
  source: string
}
export interface DefaultDrawOptions {
  now: number
  width: number
  height: number
}
export interface Style<T extends HTMLElement> {
  id?: string
  className?: string
  style?: HTMLAttributes<T>['style']
}
// biome-ignore lint/complexity/noBannedTypes: Its optional
export interface Program<T extends {} = {}> {
  shaders: Shader[]
  setup(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
  ): (options: DefaultDrawOptions & T) => void
}
export const ShaderType = {
  VERTEX: 0x8b31,
  FRAGMENT: 0x8b30,
} as const

export type ShaderTypeType = (typeof ShaderType)[keyof typeof ShaderType]
export type ShaderState =
  | { state: "no-shader" }
  | { state: "compile-error"; log: string | null }
  | { state: "active"; shader: WebGLShader }

export interface ShaderContext {
  context: WebGLRenderingContext
  program: WebGLProgram
}
