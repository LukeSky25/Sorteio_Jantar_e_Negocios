import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { StyleProvider } from "./Context/StyleProvider";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Style from "./pages/Style";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* O Provider fica por fora para englobar todas as rotas */}
    <BrowserRouter>
      <Routes>
        {/* --- EVENTO PADRÃO --- */}
        {/* Usamos o wrapper do StyleProvider aqui para resetar o estilo ao mudar de rota */}
        <Route
          path="/"
          element={
            <StyleProvider eventId="default">
              <Home eventId="default" />
            </StyleProvider>
          }
        />
        <Route
          path="/report"
          element={
            <StyleProvider eventId="default">
              <Report eventId="default" />
            </StyleProvider>
          }
        />
        <Route
          path="/style"
          element={
            <StyleProvider eventId="default">
              <Style eventId="default" />
            </StyleProvider>
          }
        />

        {/* --- EVENTO GOLDEN NIGHT --- */}
        <Route
          path="/golden-night"
          element={
            <StyleProvider eventId="golden-night">
              <Home eventId="golden-night" />
            </StyleProvider>
          }
        />
        <Route
          path="/golden-night/report"
          element={
            <StyleProvider eventId="golden-night">
              <Report eventId="golden-night" />
            </StyleProvider>
          }
        />
        <Route
          path="/golden-night/style"
          element={
            <StyleProvider eventId="golden-night">
              <Style eventId="golden-night" />
            </StyleProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
