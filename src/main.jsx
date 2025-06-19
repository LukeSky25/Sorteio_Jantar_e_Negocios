import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { StyleProvider } from "./Context/StyleProvider";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Style from "./pages/Style";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StyleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" index element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/style" element={<Style />} />
        </Routes>
      </BrowserRouter>
    </StyleProvider>
  </StrictMode>
);
