# OKTech Idle Screen

A screen to put up at OKTech events while nothing else is on: a slow animated background in the OKTech colours, the logo, the event name and the time in Japan.

## Use it

1. Download [`idle-screen.html`](https://github.com/oktechjp/idle-screen/releases/latest/download/idle-screen.html) from the latest release.
2. Open it in a current Chrome, Edge or Firefox. It needs WebGL and the Temporal API.
3. Add options after the file name in the address bar, for example `idle-screen.html?style=bubbles&event=Osaka%20FastHacks`.
4. Go full screen with F11 (Ctrl+Cmd+F on macOS).

The file has everything built in except the Lexend font, which loads from Google Fonts. Without internet the text falls back to the system font.

### Options

| Parameter | Example | What it does |
|---|---|---|
| `style` | `bubbles` | Background: `waves` (default) or `bubbles` |
| `event` | `Osaka%20FastHacks` | Event name in the top right |
| `from` and `until` | `2026-11-14T10:00%2B09:00` | With both set, the start and end time replace the clock in the bottom corners |
| `brightness` | `0.5` | Lightness of the background colours, from `0` to `1` (default `0.3`) |
| `saturation` | `0.5` | Saturation of the background colours, from `0` to `1` (default `0.2`) |

Times are always shown in Japan time. A date without a time zone, such as `2026-11-14T10:00`, is read in the time zone of the computer running the screen, so add the offset to be safe. Write the `+` as `%2B` (`2026-11-14T10:00%2B09:00`): a plain `+` in a URL means a space, and a date that cannot be read is ignored without a warning.

## Develop

You need Node 22 or newer.

```sh
npm ci
npm run dev
```

The dev server runs on http://localhost:3000 and reloads on every change. Add the options above to that URL to try them.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server |
| `npm run build` | Builds `dist/index.html`, the whole app in one file |
| `npm run preview` | Serves the build |
| `npm run check` | Lints and formats with Biome and fixes what it can |

### Where things are

| Path | What it holds |
|---|---|
| `src/App.tsx` | Reads the options from the URL and puts the screen together |
| `src/gl_program/` | The WebGL backgrounds (`Waves.ts`, `Bubbles.ts`) and their shared helpers |
| `src/GLCanvas.tsx` | Runs a background program on a full-screen canvas |
| `src/Time.tsx`, `src/Timebar.tsx` | The clock and the start and end times |
| `src/Logo.tsx` | The OKTech logo as inline SVG |
| `index.html` | The page template, including the Lexend font link |

To add a background, write a new `Program` in `src/gl_program/` next to the existing two and add its name to the `style` options in `src/App.tsx`.

## Release

Push a version tag:

```sh
git tag v1.0.0
git push origin v1.0.0
```

The Release workflow builds the app and publishes a GitHub release for the tag with `idle-screen.html` attached. The download link at the top of this file always points at the newest release.
