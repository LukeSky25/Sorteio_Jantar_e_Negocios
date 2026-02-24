import { useState, useEffect } from "react";
import { StyleContext } from "./StyleContext";

const defaultStyle = {
  title: "Edição Nº - Restaurante: ",
  color: "black",
  logo: "",
  backgroundType: "color",
  backgroundValue: "#40e0d0",
};

// Recebe eventId via props (passado no main.jsx)
export const StyleProvider = ({ children, eventId }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [styleConfig, setStyleConfig] = useState(defaultStyle);

  useEffect(() => {
    const fetchStyle = async () => {
      try {
        const res = await fetch(`${API_URL}/${eventId}/style`);
        const data = await res.json();

        // --- CORREÇÃO DE SEGURANÇA ---
        // Verifica se 'data' é um objeto válido e não está vazio.
        // Se vier null, undefined ou erro, usa o default.
        if (data && typeof data === "object" && !data.erro) {
          setStyleConfig(data);
        } else {
          setStyleConfig(defaultStyle);
        }
      } catch (error) {
        console.error("Erro ao carregar estilo:", error);
        setStyleConfig(defaultStyle); // Fallback para evitar tela branca
      }
    };

    // Reseta para o padrão antes de buscar o novo (evita piscar estilo antigo)
    setStyleConfig(defaultStyle);
    fetchStyle();
  }, [API_URL, eventId]);

  return (
    <StyleContext.Provider value={{ styleConfig, setStyleConfig, eventId }}>
      {children}
    </StyleContext.Provider>
  );
};

export default StyleProvider;
