import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import Store, { StoreContext } from "./store.js";

const store = new Store();

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App store={store} />
  </StoreContext.Provider>,
  document.getElementById("root")
);
