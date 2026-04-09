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
  const [styleConfig, setStyleConfig] = useState(defaultStyle);

  useEffect(() => {
    const fetchStyle = async () => {
      try {
        const res = await fetch(`${API_URL}/style`);
        const data = await res.json();

        // Verifica se veio um objeto válido.
        // Faz um "merge" com o defaultStyle para evitar que a tela quebre caso falte alguma propriedade no JSON
        if (data && typeof data === "object" && !data.erro) {
          setStyleConfig({ ...defaultStyle, ...data });
        } else {
          setStyleConfig(defaultStyle);
        }
      } catch (error) {
        console.error("Erro ao carregar estilo:", error);
        setStyleConfig(defaultStyle); // Fallback em caso de erro na API
      }
    };

    setStyleConfig(defaultStyle);
    fetchStyle();
  }, [API_URL]);

  return (
    <StyleContext.Provider value={{ styleConfig, setStyleConfig }}>
      {children}
    </StyleContext.Provider>
  );
};
