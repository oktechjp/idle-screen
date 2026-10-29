import { useInstant } from "react-now-hook"
import type { Style } from "./types"
import "./Time.css"

export type TimeOpts = Style<HTMLDivElement> & {
  instant?: Temporal.Instant
}

export function Time({ instant, ...opts }: TimeOpts) {
  // biome-ignore lint/style/noNonNullAssertion: we assume temporal is available
  const now = useInstant()!
  const time = (instant ?? now).toZonedDateTimeISO("Asia/Tokyo")
  return (
    <div className="time" {...opts}>
      {time.hour}:{time.minute.toString().padStart(2, "0")}
    </div>
  )
}
