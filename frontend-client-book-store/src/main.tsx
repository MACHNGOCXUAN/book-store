import React from "react";
import ReactDOM from "react-dom/client";

// Import CSS framework
import "antd/dist/reset.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
// React-Toastify styles + container
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
// Router + Redux
import { RouterProvider } from "react-router-dom";
import router from "./routes/RouterApp";
import { Provider } from "react-redux";
import { store } from "./store";
// Google OAuth
import { GoogleOAuthProvider } from "@react-oauth/google";

// Suppress Antd React 19 compatibility warning
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    args[0]?.includes?.("antd v5 support React is 16 ~ 18") ||
    (typeof args[0] === "string" && args[0].includes("antd v5 support React"))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <RouterProvider router={router} />
        <ToastContainer position="top-right" />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
