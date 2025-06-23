import { Link } from "react-router-dom";

import { FaArrowLeft } from "react-icons/fa";

import { useStyle } from "../../Context/useStyle";

import "./style.css";

import logo from "../../assets/logo.png";

function Style() {
  const API_URL = import.meta.env.VITE_API_URL;

  // Configurador de estilo da página

  const { styleConfig, setStyleConfig } = useStyle();

  // Envia as configurações de estilo para a API

  const saveStyleBackend = () => {
    fetch(`${API_URL}/style`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(styleConfig),
    })
      .then(() => alert("Estilo salvo com sucesso"))
      .catch((error) => console.log("Erro ao salvar Estilo: ", error));
  };

  // Envia as imagens para a API

  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      const fullUrl = `${API_URL}${data.filePath}`;

      setStyleConfig({
        ...styleConfig,
        [type]: fullUrl,
      });
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
    }
  };

  // Muda o valor das propriedades do estilo

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
              : `url(${styleConfig.backgroundValue}) no-repeat center center / cover`,
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
                onChange={(e) => handleFileUpload(e.target.files[0], "logo")}
              />

              {/* Carrega uma prévia da logo */}

              {styleConfig.logo && (
                <img
                  src={styleConfig.logo}
                  alt="Prévia da logo"
                  className="prev_logo"
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

              {/* Caso a opção "color" seja selecionada, exibirá as opções de estilização da cor de fundo */}

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

              {/* Caso a opção "image" seja selecionada, exibirá as opções de estilização da imagem de fundo */}

              {styleConfig.backgroundType === "image" && (
                <>
                  <label>Imagem de fundo (upload):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e.target.files[0], "backgroundValue")
                    }
                  />
                </>
              )}

              <div className="buttons2">
                <button onClick={handleReset} className="reset_b">
                  Resetar Estilo para o Padrão
                </button>

                <button onClick={saveStyleBackend} className="send_b">
                  Salvar Estilo
                </button>
              </div>
            </div>
          </div>
        </main>
      </section>
    </>
  );
}

export default Style;
