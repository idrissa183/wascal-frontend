import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { LanguageProvider } from "./contexts/LanguageContext";

// Initialize the React app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root container not found");
}
