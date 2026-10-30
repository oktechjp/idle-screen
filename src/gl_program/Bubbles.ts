import { type Program, ShaderType } from "../types"
import { adjust, endlessBackandForth, getLocations } from "./helper"

const vertex = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragment = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  uniform vec3 BASE;
  uniform vec3 RED;
  uniform vec3 GREEN;
  uniform vec3 BLUE;

  vec2 centered(vec2 uv) {
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / max(u_resolution.y, 1.0);
    return p;
  }

  vec3 brand(float i) {
    float k = mod(i, 3.0);
    if (k < 0.5) return RED;
    if (k < 1.5) return GREEN;
    return BLUE;
  }

  float hash(float n) {
    return fract(sin(n * 91.345) * 47453.5453);
  }

  float bubble(vec2 p, float radius, float seed, float t) {
    float a = atan(p.y, p.x);
    float wobble = 0.15 * sin(2.0 * a + seed * 6.28 + t * 0.8)
                  + 0.09 * sin(3.0 * a - seed * 4.1 - t * 0.6)
                  + 0.04 * sin(5.0 * a + seed * 2.3 + t * 1.05);
    return length(p) - radius * (1.0 + wobble);
  }

  void main() {
    vec2 p = centered(vUv);
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    float t = u_time;
    float pixel = 1.5 / max(u_resolution.y, 1.0);

    vec3 color = mix(BASE * 1.5, BASE * 0.5, clamp(length(p) * 1.3, 0.0, 1.0));

    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float seed = hash(fi + 1.0);
      float radius = 0.08 + 0.13 * hash(fi + 7.0);
      vec2 center = vec2(
        sin(t * (0.07 + 0.04 * seed) + fi * 2.4) * aspect * 0.45,
        cos(t * (0.06 + 0.05 * hash(fi + 3.0)) + fi * 1.7) * 0.42
      );

      float d = bubble(p - center, radius, seed, t);
      float inside = 1.0 - smoothstep(-pixel, pixel, d);
      float depth = max(-d, 0.0);

      float body = exp(-depth * 9.0);
      float rim = exp(-depth * 140.0);
      float inner = exp(-pow((depth - 0.02) / 0.008, 2.0));
      float bloom = exp(-abs(d) * 30.0);

      vec3 tint = brand(fi);
      vec3 edge = mix(tint, vec3(1.0), 0.5);
      vec3 light = tint * inside * (0.08 + body * 0.3)
                  + edge * (inside * (rim * 0.6 + inner * 0.1) + bloom * 0.08);

      color += light * (1.0 - color);
    }

    float grain = fract(sin(dot(vUv * 200.0 + u_time * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
    color *= 0.952 + grain * 0.048;
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`

export const bubbles: Program<{ brightness?: number; saturation?: number }> = {
  shaders: [
    { type: ShaderType.FRAGMENT, source: fragment },
    { type: ShaderType.VERTEX, source: vertex },
  ],
  setup(gl, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const position = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const loc = getLocations(gl, program, {
      u_time: "1f",
      u_resolution: "2f",
      BASE: "3f",
      RED: "3f",
      GREEN: "3f",
      BLUE: "3f",
    })
    return ({ now, width, height, brightness: l, saturation: s }) => {
      loc.BASE.setHex(0x141414)
      // TODO: these brand colors are hand-copied from the CSS :root tokens; pass them in as uniforms if they ever need to change in one place.
      loc.RED.setHex(adjust(0xfd4d69, { l, s }))
      loc.GREEN.setHex(adjust(0x49d773, { l, s }))
      loc.BLUE.setHex(adjust(0x459bc9, { l, s }))
      loc.u_time.set(endlessBackandForth(now, 200_000) * 10)
      loc.u_resolution.set(width, height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
  },
}
