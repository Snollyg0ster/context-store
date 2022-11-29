import { StrictMode } from "react";
import * as ReactDOMClient from "react-dom/client";

import App from "./App";
import { StoreProvider } from "./store/store";

const rootElement = document.getElementById("root");
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  // <StrictMode>
  <StoreProvider>
    <App />
  </StoreProvider>
  // </StrictMode>
);

const a = <A extends any[]>(
  cb1: (first: A[number]) => any,
  cb2: (second: A[number]) => any
) => ("result" as unknown) as A[number];

const sdhj = a(
  (first: {type: 'test', data: '123'}) => {},
  (second: {type: 'memb', data: 321}) => {}
);
