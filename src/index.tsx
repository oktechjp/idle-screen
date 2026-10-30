import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryParamProvider } from "use-query-params"
import { WindowHistoryAdapter } from "use-query-params/adapters/window"
import App from "./App"

// biome-ignore lint/style/noNonNullAssertion: Node is in html
const root = createRoot(document.getElementById("root")!)
root.render(
  <StrictMode>
    <QueryParamProvider adapter={WindowHistoryAdapter}>
      <App />
    </QueryParamProvider>
  </StrictMode>,
)
