import React, { createContext, useState, useContext, useEffect } from "react";

import logo from "../assets/logo.png";

const StyleContext = createContext();

export const useStyle = () => useContext(StyleContext);

const defaultStyleConfig = {
  logo: logo,
  title: "Edição Nº - Restaurante: ",
  backgroundType: "color", // 'color' ou 'image'
  backgroundValue: "#40e0d0",
};

export function StyleProvider({ children }) {
  const [styleConfig, setStyleConfig] = useState(() => {
    const saved = localStorage.getItem("styleConfig");
    return saved ? JSON.parse(saved) : defaultStyleConfig;
  });

  useEffect(() => {
    localStorage.setItem("styleConfig", JSON.stringify(styleConfig));
  }, [styleConfig]);

  return (
    <StyleContext.Provider value={{ styleConfig, setStyleConfig }}>
      {children}
    </StyleContext.Provider>
  );
}
