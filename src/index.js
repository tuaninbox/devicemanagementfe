import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TimezoneProvider } from "./context/TimezoneContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <TimezoneProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TimezoneProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
