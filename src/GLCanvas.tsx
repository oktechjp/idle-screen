import { useNowEffect } from "react-now-hook"
import type {
  Program,
  ShaderTypeType,
  ShaderContext,
  ShaderState,
} from "./types.ts"
import { useEffect, useMemo, useState } from "react"

function createShader(
  type: ShaderTypeType,
  source: string,
  context: ShaderContext,
): ShaderState {
  const { program, context: gl } = context
  const shader = gl.createShader(type)
  if (!shader) return { state: "no-shader" }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    return {
      state: "compile-error",
      log: gl.getShaderInfoLog(shader),
    }
  gl.attachShader(program, shader)
  return { state: "active", shader }
}

function useProgram<T extends {}>(
  input: Program<T>,
  canvas: HTMLCanvasElement | null,
  options: T,
) {
  const context = useMemo(
    () =>
      canvas?.getContext("webgl", { antialias: false, alpha: false }) ?? null,
    [canvas],
  )
  const [draw, setDraw] = useState<
    null | ((now: DOMHighResTimeStamp, options: T) => void)
  >(null)
  useEffect(() => {
    if (!canvas) {
      return setDraw(null)
    }
    if (!context) {
      return setDraw(null)
    }
    const program = context.createProgram()
    const glShaders = input.shaders.map(({ source, type }) =>
      createShader(type, source, { context, program }),
    )
    context.linkProgram(program)
    // biome-ignore lint/correctness/useHookAtTopLevel: gl native function
    context.useProgram(program)
    const onChange = input.setup(context, program)
    setDraw(() => (now: DOMHighResTimeStamp, options: T) => {
      // if (last !== null) elapsedMs = Math.min((now - last) / 1000, 0.1)
      // last = now
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      context.viewport(0, 0, width, height)
      onChange({
        now,
        width,
        height,
        ...options,
      })
    })
    return () => {
      for (const shader of glShaders) {
        if (shader.state === "active") {
          context.deleteShader(shader.shader)
        }
      }
      context.deleteProgram(program)
      context.clear(0)
      setDraw(null)
    }
  }, [input, context, canvas])
  useNowEffect(
    (now) => {
      if (!draw) return
      draw(now, options)
    },
    (1000 / 60) | 0,
    [draw, options],
  )
}

export function GLCanvas<T extends {}>({
  program,
  options,
}: {
  program: Program<T>
  options: T
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useProgram(program, canvas, options)
  return <canvas aria-hidden ref={setCanvas} />
}
