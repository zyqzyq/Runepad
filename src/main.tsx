import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { prefetchEditorPanel } from "@/lib/prefetchEditorPanel";
import { startupMark, startupMeasure } from "@/lib/startupPerf";

startupMark("start");
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

startupMark("react-render-scheduled");
requestAnimationFrame(() => {
  startupMark("first-frame");
  startupMeasure("to-first-frame", "start");
  prefetchEditorPanel();
});
