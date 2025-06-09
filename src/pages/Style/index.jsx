import { Link } from "react-router-dom";

import { FaArrowLeft } from "react-icons/fa";

import "./style.css";

import { useStyle } from "../../Context/StyleContext";

import logo from "../../assets/logo.png";

function Style() {
  const { styleConfig, setStyleConfig } = useStyle();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStyleConfig({ ...styleConfig, [name]: value });
  };

  const handleReset = () => {
    const defaultStyle = {
      title: "Edição Nº - Restaurante: ",
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
                value={styleConfig.title}
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
                    value={styleConfig.backgroundValue}
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
