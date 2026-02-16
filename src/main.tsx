import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { AuthProvider } from "./auth/auth0";
import App from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
