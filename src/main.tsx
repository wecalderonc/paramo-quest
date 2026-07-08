import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initSimulatedDateFromUrl } from "./lib/simulatedDate";
import "./index.css";
import App from "./App.tsx";

initSimulatedDateFromUrl();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
