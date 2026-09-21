import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app";
import { installNoiseTexture } from "./lib/noise";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

installNoiseTexture();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
