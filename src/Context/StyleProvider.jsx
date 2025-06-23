import { useState, useEffect } from "react";
import { StyleContext } from "./StyleContext";

// Variável de estilização padrão

const defaultStyle = {
  title: "Edição Nº - Restaurante: ",
  color: "black",
  logo: "", // vazio inicialmente
  backgroundType: "color",
  backgroundValue: "#40e0d0",
};

export const StyleProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  // Configurador de estilo das páginas

  const [styleConfig, setStyleConfig] = useState(defaultStyle);

  // Busca a estilização na API e a salva no back-end

  useEffect(() => {
    // Aqui busca do backend

    const fetchStyle = async () => {
      try {
        const res = await fetch(`${API_URL}/style`);
        const data = await res.json();
        setStyleConfig(data);
      } catch (error) {
        console.error("Erro ao carregar estilo do backend:", error);
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

export default StyleProvider;
