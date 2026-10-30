import "./App.css"
import { NowProvider } from "react-now-hook"
import {
  createEnumParam,
  DateTimeParam,
  NumberParam,
  StringParam,
  useQueryParams,
} from "use-query-params"
import { GLCanvas } from "./GLCanvas"
import { bubbles } from "./gl_program/Bubbles"
import { dateToInstant } from "./gl_program/helper"
import { waves } from "./gl_program/Waves"
import { Logo } from "./Logo"
import { palette } from "./palette"
import { Time } from "./Time"
import { Timebar } from "./Timebar"

const App = () => {
  const [{ event, until, from, style, brightness, saturation, now }] =
    useQueryParams(
      {
        event: StringParam,
        until: DateTimeParam,
        from: DateTimeParam,
        now: DateTimeParam,
        brightness: { ...NumberParam, default: 0.3 },
        saturation: { ...NumberParam, default: 0.2 },
        style: { ...createEnumParam(["waves", "bubbles"]), default: "waves" },
      },
      {
        removeDefaultsFromUrl: true,
      },
    )
  const untilInstant = dateToInstant(until ?? null)
  const fromInstant = dateToInstant(from ?? null)
  const timeFrame =
    untilInstant && fromInstant
      ? { until: untilInstant, from: fromInstant }
      : null
  return (
    <NowProvider time={dateToInstant(now ?? null)?.epochMilliseconds}>
      <div className="screen" style={palette(brightness ?? 0, saturation ?? 0)}>
        <GLCanvas
          program={style === "waves" ? waves : bubbles}
          options={{ brightness: brightness ?? 0, saturation: saturation ?? 0 }}
        />
        <div id="top-bar">
          <Logo />
          {event ? <div id="title">{event}</div> : null}
        </div>
        {timeFrame ? (
          <Timebar id="timebar" {...timeFrame} />
        ) : (
          <Time id="now" />
        )}
      </div>
    </NowProvider>
  )
}

export default App
