import { Time } from "./Time";
import type { Style } from "./types";
import './Timebar.css'

export type TimebarProps = Style<HTMLDivElement> & { until: Temporal.Instant, from: Temporal.Instant }

export function Timebar({ until, from, ...opts }: TimebarProps) {
    return <div className="timebar" {...opts}>
        <Time className="time from" instant={from} />
        <Time className="time from" instant={until} />
    </div>
}