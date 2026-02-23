import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "contexts/AuthContext";
import ErrorBoundary from "components/ErrorBoundary";
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);
