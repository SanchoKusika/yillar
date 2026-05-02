import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { RouterProvider, QueryProvider, SessionProvider, ThemeProvider } from "./providers";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
          <RouterProvider>
            <App />
          </RouterProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
