import "./App.css"
import { GLCanvas } from "./GLCanvas"
import { bubbles } from "./gl_program/Bubbles"
import { waves } from "./gl_program/Waves"
import { Logo } from "./Logo"
import { Time } from "./Time"
import { dateToInstant } from "./gl_program/helper"
import {
  useQueryParams,
  DateTimeParam,
  StringParam,
  createEnumParam,
} from "use-query-params"
import { Timebar } from "./TimeBar"

const App = () => {
  const [{ event, until, from, style }] = useQueryParams({
    event: StringParam,
    until: DateTimeParam,
    from: DateTimeParam,
    style: createEnumParam(["waves", "bubbles"]),
  })
  const untilInstant = dateToInstant(until ?? null)
  const fromInstant = dateToInstant(from ?? null)
  const timeFrame =
    untilInstant && fromInstant
      ? { until: untilInstant, from: fromInstant }
      : null
  return (
    <>
      <GLCanvas
        program={style === "waves" ? waves : bubbles}
        options={{ brightness: 0.3, saturation: 0.2 }}
      />
      <div id="top-bar">
        <Logo />
        {event ? <div id="title">{event}</div> : null}
      </div>
      {timeFrame ? <Timebar id="timebar" {...timeFrame} /> : <Time id="now" />}
    </>
  )
}

export default App
