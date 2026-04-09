import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaCheck, FaXmark, FaRotateLeft } from "react-icons/fa6";
import { useStyle } from "../../Context/useStyle";
import "./style.css";
import logo from "../../assets/logo.png";

function Style() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { styleConfig, setStyleConfig } = useStyle();

  // --- ESTADO DO MODAL CUSTOMIZADO ---
  const [modal, setModal] = useState({
    isOpen: false,
    type: "", // 'confirm' ou 'success'
    message: "",
  });

  // Envia as configurações de estilo para a API (Auto-save)
  useEffect(() => {
    fetch(`${API_URL}/style`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(styleConfig),
    }).catch((err) => console.error("Erro ao salvar estilo:", err));
  }, [API_URL, styleConfig]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStyleConfig({ ...styleConfig, [name]: value });
  };

  // --- CORREÇÃO DO BUG BASE64 GIGANTE ---
  const handleBackgroundTypeChange = (e) => {
    const newType = e.target.value;
    let newValue = styleConfig.backgroundValue;

    // Se o usuário mudou para "color", mas o valor atual salvo é uma imagem (base64)
    if (newType === "color" && newValue && newValue.startsWith("data:image")) {
      newValue = "#40e0d0"; // Limpa o base64 e devolve a cor padrão
    }

    setStyleConfig({
      ...styleConfig,
      backgroundType: newType,
      backgroundValue: newValue,
    });
  };

  // --- FUNÇÕES DO MODAL DE RESET ---
  const closeModal = () => {
    setModal({ isOpen: false, type: "", message: "" });
  };

  const confirmReset = () => {
    setModal({
      isOpen: true,
      type: "confirm",
      message:
        "Tem certeza que deseja resetar? Isso apagará sua logo e cores customizadas.",
    });
  };

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

    // Transforma o modal de "Confirmação" em "Sucesso"
    setModal({
      isOpen: true,
      type: "success",
      message: "Estilo resetado para o padrão com sucesso!",
    });

    // Fecha a mensagem de sucesso automaticamente após 2 segundos
    setTimeout(() => {
      closeModal();
    }, 2000);
  };

  return (
    <>
      {/* --- RENDERIZAÇÃO DO MODAL --- */}
      {modal.isOpen && (
        <div className="style-modal-overlay">
          <div
            className={`style-modal-content ${modal.type === "confirm" ? "modal-warning" : "modal-success"}`}
          >
            <div className="style-modal-icon">
              {modal.type === "confirm" ? (
                <FaRotateLeft size={30} />
              ) : (
                <FaCheck size={30} />
              )}
            </div>
            <h3>{modal.type === "confirm" ? "Atenção!" : "Tudo Certo!"}</h3>
            <p>{modal.message}</p>

            <div className="modal-buttons">
              {modal.type === "confirm" ? (
                <>
                  <button onClick={closeModal} className="btn-cancelar">
                    Cancelar
                  </button>
                  <button onClick={handleReset} className="btn-confirmar">
                    Sim, Resetar
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="btn-confirmar"
                  style={{ width: "100%" }}
                >
                  Entendido
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="nav-bar">
        <Link to="/">
          <FaArrowLeft size={20} className="arrow-icon" />
        </Link>
        <h1 className="nav-title">Estilização do Sorteio</h1>
      </nav>

      <section
        className="container-style"
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
        <main className="style-card">
          <div className="style-header">
            <h2>Aparência da Tela</h2>
            <p>Customize as cores, título e logo do evento</p>
          </div>

          <div className="style-form">
            <div className="input-group-full">
              <label>Título do Evento</label>
              <input
                className="input-text"
                name="title"
                placeholder="Ex: 5ª Edição - Jantar & Negócios"
                value={styleConfig.title || ""}
                onChange={handleChange}
              />
            </div>

            <div className="input-group-row">
              <div className="input-box">
                <label>Cor do Título</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    name="color"
                    id="color"
                    value={styleConfig.color || "#000000"}
                    onChange={handleChange}
                  />
                  <span className="color-hex">
                    {styleConfig.color || "#000000"}
                  </span>
                </div>
              </div>

              <div className="input-box">
                <label>Tipo de Fundo</label>
                <select
                  className="input-select"
                  value={styleConfig.backgroundType}
                  onChange={
                    handleBackgroundTypeChange
                  } /* Trocamos para a nova função */
                >
                  <option value="color">Cor Sólida</option>
                  <option value="image">Imagem</option>
                </select>
              </div>
            </div>

            {/* SEÇÃO DA COR SÓLIDA */}
            {styleConfig.backgroundType === "color" && (
              <div className="input-group-full">
                <label>Cor de Fundo da Tela</label>
                <div className="color-picker-wrapper full-width">
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
                  <span className="color-hex">
                    {/* Proteção dupla: se algo vazar, avisa que é base64 em vez de explodir a tela */}
                    {styleConfig.backgroundValue?.startsWith("data:image")
                      ? "Cor não suportada"
                      : styleConfig.backgroundValue || "#40e0d0"}
                  </span>
                </div>
              </div>
            )}

            {/* SEÇÃO DE UPLOAD DA IMAGEM */}
            {styleConfig.backgroundType === "image" && (
              <div className="input-group-full">
                <label>Imagem de Fundo (Upload)</label>
                <input
                  className="input-file"
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
              </div>
            )}

            <div className="divider"></div>

            <div className="input-group-full">
              <label>Logo Central (Upload)</label>
              <input
                className="input-file"
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
                <div className="preview-box">
                  <p>Prévia da Logo:</p>
                  <img
                    src={styleConfig.logo}
                    alt="Prévia da logo"
                    className="prev_logo"
                  />
                </div>
              )}
            </div>

            <button onClick={confirmReset} className="reset-btn">
              <FaRotateLeft /> Resetar Estilo para o Padrão
            </button>
          </div>
        </main>
      </section>
    </>
  );
}

export default Style;
