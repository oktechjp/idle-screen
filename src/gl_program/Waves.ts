import { ShaderType, type Program } from "../types"
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

  mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  vec3 brand(float i) {
    float k = mod(i, 3.0);
    if (k < 0.5) return RED;
    if (k < 1.5) return GREEN;
    return BLUE;
  }

  void main() {
    vec2 q = rot(0.6) * centered(vUv) * 2.0;
    float t = u_time * 0.6;
    float pixel = 2.0 / max(u_resolution.y, 1.0);

    vec3 color = mix(BASE * 1.5, BASE * 0.5, clamp(length(centered(vUv)) * 1.3, 0.0, 1.0));

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float bend = mod(fi, 2.0) * 2.0 - 1.0;
      float crease = (fi - 2.5) * 0.4
                    + 0.26 * sin(q.x * (1.05 + 0.12 * fi) + fi * 1.9 + t * (0.25 + 0.05 * fi))
                    + 0.1 * bend * q.x * q.x;
      float s = q.y - crease;
      float pane = smoothstep(-pixel, pixel, s);
      float back = max(s, 0.0);

      float body = exp(-back * 1.7);
      float fresnel = exp(-back * 8.0);
      float rim = exp(-back * 80.0);
      float inner = exp(-pow((back - 0.045) / 0.014, 2.0));
      float bloom = exp(-abs(s) * 20.0);

      vec3 tint = brand(fi);
      vec3 edge = mix(tint, vec3(1.0), 0.5);
      vec3 light = tint * pane * (body * 0.2 + fresnel * 0.3)
                  + edge * (pane * (rim * 0.6 + inner * 0.12) + bloom * 0.1);

      color += light * (1.0 - color);
    }

    float grain = fract(sin(dot(vUv * 200.0 + u_time * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
    color *= 0.952 + grain * 0.048;
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`

export const waves: Program<{ brightness?: number, saturation?: number }> = {
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
      // TODO: these brand colors are hand-copied from the CSS :root tokens; pass them in as uniforms if they ever need to change in one place.
      loc.RED.setHex(adjust(0xfd4d69, { l, s }))
      loc.GREEN.setHex(adjust(0x49d773, { l, s }))
      loc.BLUE.setHex(adjust(0x459bc9, { l, s }))
      loc.u_time.set(endlessBackandForth(now, 200_000) * 50)
      loc.u_resolution.set(width, height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
  },
}
