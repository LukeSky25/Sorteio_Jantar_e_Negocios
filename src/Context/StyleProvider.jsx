import { useState, useEffect } from "react";
import { StyleContext } from "./StyleContext";

const defaultStyle = {
  title: "Edição Nº - Restaurante: ",
  color: "black",
  logo: "",
  backgroundType: "color",
  backgroundValue: "#40e0d0", // Cor verde água padrão
};

export const StyleProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [styleConfig, setStyleConfig] = useState(() => {
    const estiloSalvo = localStorage.getItem("estiloEvento");
    if (estiloSalvo) {
      try {
        return { ...defaultStyle, ...JSON.parse(estiloSalvo) };
      } catch {
        return defaultStyle;
      }
    }
    return defaultStyle;
  });

  useEffect(() => {
    const fetchStyle = async () => {
      try {
        const res = await fetch(`${API_URL}/style`);
        const data = await res.json();

        if (data && typeof data === "object" && !data.erro) {
          const novoEstilo = { ...defaultStyle, ...data };
          setStyleConfig(novoEstilo);
          localStorage.setItem("estiloEvento", JSON.stringify(novoEstilo));
        } else {
          setStyleConfig(defaultStyle);
          localStorage.removeItem("estiloEvento");
        }
      } catch (error) {
        console.error("Erro ao carregar estilo:", error);
      }
    };

    fetchStyle();
  }, [API_URL]);

  return (
    <StyleContext.Provider value={{ styleConfig, setStyleConfig }}>
      {children}
    </StyleContext.Provider>
  );
};
