import { Link } from "react-router-dom";
import { useEffect } from "react";

import { FaArrowLeft } from "react-icons/fa";

import { useStyle } from "../../Context/StyleContext";

import "./style.css";

import logo from "../../assets/logo.png";

function Style() {
  const API_URL = import.meta.env.VITE_API_URL;

  const { styleConfig, setStyleConfig } = useStyle();

  useEffect(() => {
    fetch(`${API_URL}/style`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(styleConfig),
    });
  }, [API_URL, styleConfig]);

  // Muda o valor das propriedades do Estilo

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStyleConfig({ ...styleConfig, [name]: value });
  };

  // Reseta as informações de estilização

  const handleReset = () => {
    const defaultStyle = {
      title: "Edição Nº - Restaurante: ",
      color: "#000000",
      logo: logo,
      backgroundType: "color",
      backgroundValue: "#40e0d0",
    };

    localStorage.removeItem("styleConfig");
    setStyleConfig(defaultStyle);
  };

  return (
    <>
      <nav className="nav-bar">
        <Link to={"/"}>
          <FaArrowLeft size={20} className="arrow-icon" />
        </Link>
        <h1 className="nav-title">Estilização do Sorteio</h1>
      </nav>
      <section
        className="container2"
        style={{
          background:
            styleConfig.backgroundType === "color"
              ? styleConfig.backgroundValue
              : `${
                  styleConfig.backgroundValue
                    ? `url(${styleConfig.backgroundValue})`
                    : "none"
                }, #40e0d0`,
        }}
      >
        <main>
          <div className="stylization">
            <h1>Estilização</h1>

            <div className="form">
              <label>Titulo</label>
              <input
                className="title"
                name="title"
                style={{ color: styleConfig.color }}
                value={styleConfig.title || ""}
                onChange={handleChange}
              />
              <input
                type="color"
                name="color"
                id="color"
                value={styleConfig.color || "#000000"}
                onChange={handleChange}
              />

              <label className="logo_l">
                Logo (arraste ou selecione uma imagem):
              </label>
              <input
                className="logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setStyleConfig({ ...styleConfig, logo: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              {styleConfig.logo && (
                <img
                  src={styleConfig.logo}
                  alt="Prévia da logo"
                  style={{ maxHeight: "100px", marginTop: "10px" }}
                />
              )}

              <label>Tipo de fundo:</label>
              <select
                value={styleConfig.backgroundType}
                onChange={(e) =>
                  setStyleConfig({
                    ...styleConfig,
                    backgroundType: e.target.value,
                  })
                }
              >
                <option value="color">Cor</option>
                <option value="image">Imagem</option>
              </select>

              {styleConfig.backgroundType === "color" && (
                <>
                  <label>Cor de fundo:</label>
                  <input
                    type="color"
                    value={styleConfig.backgroundValue || "#40e0d0"}
                    onChange={(e) =>
                      setStyleConfig({
                        ...styleConfig,
                        backgroundValue: e.target.value,
                      })
                    }
                  />
                </>
              )}

              {styleConfig.backgroundType === "image" && (
                <>
                  <label>Imagem de fundo (upload):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setStyleConfig({
                            ...styleConfig,
                            backgroundValue: reader.result,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </>
              )}

              <button onClick={handleReset} className="reset_b">
                Resetar Estilo para o Padrão
              </button>
            </div>
          </div>
        </main>
      </section>
    </>
  );
}

export default Style;
