import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaUsers,
  FaUserTie,
  FaGift,
  FaDownload,
  FaFloppyDisk,
  FaCheck,
  FaXmark,
} from "react-icons/fa6";
import { useStyle } from "../../Context/useStyle";
import "./style.css";

function Report() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { styleConfig } = useStyle();

  const [names, setNames] = useState([]);
  const [drawnList, setDrawnList] = useState([]);
  const [staffCount, setStaffCount] = useState("0");
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  // --- ESTADO DO MODAL CUSTOMIZADO ---
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    isError: false,
  });

  const closeModal = () => {
    setModal({ isOpen: false, message: "", isError: false });
  };

  useEffect(() => {
    // 1. Participantes
    axios
      .get(`${API_URL}/arquivo/nomes.json`)
      .then((res) => {
        setNames(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.log(err));

    // 2. Sorteados
    axios
      .get(`${API_URL}/relatorio`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDrawnList(res.data);
        } else {
          setDrawnList([]);
        }
      })
      .catch((err) => {
        console.log("Erro ao carregar relatório:", err);
        setDrawnList([]);
      });

    // 3. Staffs
    axios
      .get(`${API_URL}/staffs`)
      .then((res) => setStaffCount(res.data.quantidade))
      .catch((err) => console.log("Erro ao ler staffs", err));
  }, [API_URL]);

  const handleSaveStaffs = async () => {
    try {
      setIsSavingStaff(true);
      await axios.post(`${API_URL}/staffs`, {
        quantidade: staffCount,
      });
      setIsSavingStaff(false);
      // Substituindo o alert antigo:
      setModal({
        isOpen: true,
        message: "Número de Staffs atualizado com sucesso!",
        isError: false,
      });
    } catch (error) {
      console.error(error);
      setIsSavingStaff(false);
      setModal({
        isOpen: true,
        message: "Erro ao salvar staffs. Verifique a conexão.",
        isError: true,
      });
    }
  };

  const downloading = () => {
    if (!Array.isArray(drawnList) || drawnList.length === 0) {
      // Substituindo o alert antigo:
      return setModal({
        isOpen: true,
        message: "Nenhum nome foi sorteado ainda para gerar o relatório.",
        isError: true,
      });
    }
    window.location.href = `${API_URL}/relatorio/download`;
  };

  const totalGanhadoresReais = Array.isArray(drawnList)
    ? drawnList.filter(
        (l) => typeof l === "string" && !l.includes("--- RODADA"),
      ).length
    : 0;

  return (
    <>
      {/* --- RENDERIZAÇÃO DO MODAL --- */}
      {modal.isOpen && (
        <div className="report-modal-overlay">
          <div
            className={`report-modal-content ${modal.isError ? "modal-error" : "modal-success"}`}
          >
            <div className="report-modal-icon">
              {modal.isError ? <FaXmark size={30} /> : <FaCheck size={30} />}
            </div>
            <h3>{modal.isError ? "Ops, Atenção!" : "Tudo Certo!"}</h3>
            <p>{modal.message}</p>
            <button onClick={closeModal} className="report-modal-btn">
              Entendido
            </button>
          </div>
        </div>
      )}

      <nav className="nav-bar">
        <Link to="/">
          <FaArrowLeft size={20} className="arrow-icon" />
        </Link>
        <h1 className="nav-title">Relatório Geral</h1>
      </nav>

      <section
        className="container-report"
        style={{
          background:
            styleConfig.backgroundType === "color"
              ? styleConfig.backgroundValue
              : `url(${styleConfig.backgroundValue})`,
        }}
      >
        <main className="report-card">
          <div className="report-header">
            <h2>{styleConfig.title || "Resumo do Evento"}</h2>
            <p>Painel de controle e exportação</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="icon-box blue">
                <FaUsers />
              </div>
              <div className="stat-info">
                <h3>{names.length}</h3>
                <p>Convidados</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="icon-box green">
                <FaGift />
              </div>
              <div className="stat-info">
                <h3>{totalGanhadoresReais}</h3>
                <p>Sorteados</p>
              </div>
            </div>

            <div className="stat-card input-card">
              <div className="icon-box purple">
                <FaUserTie />
              </div>
              <div className="staff-input-wrapper">
                <label>Staffs</label>
                <div className="input-row">
                  <input
                    type="number"
                    value={staffCount}
                    onChange={(e) => setStaffCount(e.target.value)}
                  />
                  <button onClick={handleSaveStaffs} title="Salvar Staffs">
                    {isSavingStaff ? "..." : <FaFloppyDisk />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="list-section">
            <h3>Histórico de Sorteio</h3>
            <div className="scroll-box">
              {!Array.isArray(drawnList) || drawnList.length === 0 ? (
                <p className="empty-msg">Nenhum sorteio realizado ainda.</p>
              ) : (
                <ul>
                  {drawnList.map((linha, i) => {
                    if (typeof linha !== "string") return null;

                    if (linha.includes("--- RODADA")) {
                      return (
                        <li key={i} className="rodada-header">
                          {linha.replace(/---/g, "")}
                        </li>
                      );
                    }
                    return (
                      <li key={i} className="winner-item">
                        {linha}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="footer-actions">
            <button className="download-btn" onClick={downloading}>
              <FaDownload /> Baixar PDF Completo
            </button>
          </div>
        </main>
      </section>
    </>
  );
}

export default Report;
