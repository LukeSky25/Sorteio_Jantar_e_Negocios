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
  // Configurador de estilo das páginas
  const [styleConfig, setStyleConfig] = useState(defaultStyle);

  // Controle para evitar a gravação prematura no localStorage

  const [loading, setLoading] = useState(true);

  // Pega a estilização salva no localStorage e busca a estilização na API e a salva no localStorage

  useEffect(() => {
    // Aqui busca no localstorage
    const saved = localStorage.getItem("styleConfig");
    if (saved) {
      setStyleConfig(JSON.parse(saved));
      setLoading(false);
    } else {
      // Aqui busca do backend
      fetch(import.meta.env.VITE_API_URL + "/style")
        .then((res) => res.json())
        .then((data) => {
          setStyleConfig(data);
          localStorage.setItem("styleConfig", JSON.stringify(data));
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao carregar estilo do backend:", error);
          setLoading(false);
        });
    }
  }, []);

  // Salva no localStorage quando o carregamento inicial já acabou

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("styleConfig", JSON.stringify(styleConfig));
    }
  }, [styleConfig, loading]);

  return (
    <StyleContext.Provider value={{ styleConfig, setStyleConfig }}>
      {children}
    </StyleContext.Provider>
  );
};

export default StyleProvider;
