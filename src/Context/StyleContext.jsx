import { createContext, useContext, useState, useEffect } from "react";

const StyleContext = createContext();

const defaultStyle = {
  title: "Edição Nº - Restaurante: ",
  color: "black",
  logo: "", // vazio inicialmente
  backgroundType: "color",
  backgroundValue: "#40e0d0",
};

export const StyleProvider = ({ children }) => {
  const [styleConfig, setStyleConfig] = useState(() => {
    const saved = localStorage.getItem("styleConfig");
    return saved ? JSON.parse(saved) : defaultStyle;
  });

  useEffect(() => {
    localStorage.setItem("styleConfig", JSON.stringify(styleConfig));
  }, [styleConfig]);

  return (
    <StyleContext.Provider value={{ styleConfig, setStyleConfig }}>
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = () => useContext(StyleContext);
