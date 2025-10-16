import React from "react";
import ReactDOM from "react-dom/client";

// Import CSS framework
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
// Router + Redux
import { RouterProvider } from "react-router-dom";
import router from "./routes/RouterApp";
import { Provider } from "react-redux";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
