import "./bootstrap";
import "../sass/app.scss";

import React from "react";
import ReactDOM from "react-dom";
import Login from "./components/Login";
import AppWrapper from "./components/App";

const rootElement = document.getElementById("app");
if (rootElement) {
    // render SPA app wrapper which provides sidebar and routes
    ReactDOM.render(<AppWrapper />, rootElement);
}

const loginEl = document.getElementById("login-app");
if (loginEl) {
    ReactDOM.render(<Login />, loginEl);
}
