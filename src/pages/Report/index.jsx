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

  // Carrega dados iniciais
  useEffect(() => {
    // 1. Participantes
    axios
      .get(`${API_URL}/arquivo/nomes.json`)
      .then((res) => setNames(res.data))
      .catch((err) => console.log(err));

    // 2. Sorteados (Lê o arquivo de texto bruto para mostrar o histórico completo)
    axios
      .get(`${API_URL}/relatorio`)
      .then((res) => setDrawnList(res.data))
      .catch((err) => console.log(err));

    // 3. Staffs
    axios
      .get(`${API_URL}/staffs`)
      .then((res) => setStaffCount(res.data.quantidade))
      .catch((err) => console.log("Erro ao ler staffs", err));
  }, [API_URL]);

  // Salva staffs no backend
  const handleSaveStaffs = async () => {
    try {
      setIsSavingStaff(true);
      await axios.post(`${API_URL}/staffs`, { quantidade: staffCount });
      setIsSavingStaff(false);
      alert("Número de Staffs atualizado!");
    } catch (error) {
      console.error(error);
      setIsSavingStaff(false);
    }
  };

  const downloading = () => {
    if (drawnList.length === 0) return alert("Nenhum nome sorteado ainda.");
    window.location.href = `${API_URL}/relatorio/download`;
  };

  // Filtra apenas as linhas que são ganhadores (ignorando títulos de rodada para contagem)
  const totalGanhadoresReais = drawnList.filter(
    (l) => !l.includes("--- RODADA"),
  ).length;

  return (
    <>
      <nav className="nav-bar">
        <Link to={"/"}>
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

          {/* --- DASHBOARD DE ESTATÍSTICAS --- */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="icon-box blue">
                <FaUsers />
              </div>
              <div>
                <h3>{names.length}</h3>
                <p>Convidados</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="icon-box green">
                <FaGift />
              </div>
              <div>
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

          {/* --- LISTA DE GANHADORES COM ROLAGEM --- */}
          <div className="list-section">
            <h3>Histórico de Sorteio</h3>
            <div className="scroll-box">
              {drawnList.length === 0 ? (
                <p className="empty-msg">Nenhum sorteio realizado ainda.</p>
              ) : (
                <ul>
                  {drawnList.map((linha, i) => {
                    // Renderização condicional para Títulos de Rodada vs Nomes
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
