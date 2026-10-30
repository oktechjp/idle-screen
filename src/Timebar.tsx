import { Time } from "./Time"
import type { Style } from "./types"
import "./Timebar.css"
import { useInstant } from "react-now-hook"
import { easing } from "ts-easing"

export type TimebarProps = Style<HTMLDivElement> & {
  until: Temporal.Instant
  from: Temporal.Instant
}

export function Timebar({ until, from, ...opts }: TimebarProps) {
  // biome-ignore lint/style/noNonNullAssertion: assuming temporal exists
  const now = useInstant()!
  const offset = Math.min(
    1,
    Math.max(
      0,
      (now.epochMilliseconds - from.epochMilliseconds) /
        (until.epochMilliseconds - from.epochMilliseconds),
    ),
  )
  const cutOff = 0.05
  let opacity = 1.0
  if (offset < cutOff) {
    opacity = easing.inSine(offset / cutOff)
  }
  if (offset > 1.0 - cutOff) {
    opacity = easing.outSine((1.0 - offset) / cutOff)
  }
  const baseOpacity = 0.3
  const addOpacity = 0.7
  const startOpacity =
    baseOpacity + easing.outSine(Math.max(0, 1 - offset / cutOff) * addOpacity)
  const endOpacity =
    baseOpacity +
    easing.inSine(Math.max(0, 1 - (1.0 - offset) / cutOff)) * addOpacity
  return (
    <div className="timebar" {...opts}>
      <Time
        className="time from"
        instant={from}
        style={{ opacity: startOpacity }}
      />
      <div className="timebar--center">
        <div className="timebar--spacer" style={{ flexGrow: offset }}></div>
        <Time style={{ opacity }} />
      </div>
      <Time
        className="time from"
        instant={until}
        style={{ opacity: endOpacity }}
      />
    </div>
  )
}
