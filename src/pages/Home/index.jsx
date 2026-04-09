import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaGift,
  FaXmark,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";
import Spinner from "../../Components/Spinner";
import { useStyle } from "../../Context/useStyle";
import { supabase } from "../../supabaseClient";
import ReactConfetti from "react-confetti";
import "./style.css";

// Imagens Patrocinadores
import logoBradesco from "../../assets/bradesco.jpg";
import logoBraspress from "../../assets/braspress.jpeg";
import logoMondial from "../../assets/mondial.jpg";
import logoAiwa from "../../assets/aiwa.jpg";
import logoSolumar from "../../assets/solumar.jpeg";
import logoDaTerrinha from "../../assets/daterrinha.jpeg";
import logoCgtech from "../../assets/cgtech.jpeg";
import logoLaSerenissima from "../../assets/la_serenissima.jpeg";
import logoRevistaViva from "../../assets/revistaviva.jpg";
import logoClaroTv from "../../assets/claro_tv.jpg";
import logoAlphaChannel from "../../assets/alpha_channel.jpg";
import logoLed10 from "../../assets/led10.png";

function Home() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [names, setNames] = useState([]);
  const [drawer_n, setDrawer_n] = useState([]);
  const [quant, setQuant] = useState(1);
  const [loading, setLoading] = useState(false);
  const [participantesUltimoEvento, setParticipantesUltimoEvento] = useState(
    [],
  );
  const [rodada, setRodada] = useState(0);
  const [listaBrindes, setListaBrindes] = useState([]);
  const [textoBrindes, setTextoBrindes] = useState("");
  const [isVisibleNames, setIsVisibleNames] = useState(false);
  const [isVisiblePrizes, setIsVisiblePrizes] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recycleConfetti, setRecycleConfetti] = useState(true);
  const saveBrindesTimeout = useRef(null);

  // Controle de qual index está sendo ressorteado no momento (Gatilho Secreto)
  const [redrawingIndex, setRedrawingIndex] = useState(null);

  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [fixedWinners, setFixedWinners] = useState([]);
  const [newFixedRound, setNewFixedRound] = useState("");
  const [newFixedName, setNewFixedName] = useState("");
  const [newFixedPrize, setNewFixedPrize] = useState("");

  const textAreaRef = useRef(null);
  const { styleConfig } = useStyle();

  const sponsorConfig = useMemo(() => {
    return {
      master: [logoBradesco, logoBraspress, logoMondial, logoAiwa],
      minor: [logoSolumar, logoDaTerrinha, logoCgtech, logoLaSerenissima],
      supporters: [logoRevistaViva, logoClaroTv, logoAlphaChannel, logoLed10],
    };
  }, []);

  const currentSponsors = useMemo(() => {
    if (rodada === 0) return sponsorConfig.master;
    const ciclo = (rodada - 1) % 4;
    if (ciclo < 2) return sponsorConfig.master;
    if (ciclo === 2) return sponsorConfig.minor;
    return sponsorConfig.supporters;
  }, [rodada, sponsorConfig]);

  const detectSize = () => {
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", detectSize);
    return () => window.removeEventListener("resize", detectSize);
  }, []);

  const fetchFixedWinners = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/vencedores-fixos`);
      if (Array.isArray(res.data)) setFixedWinners(res.data);
    } catch (error) {
      console.error("Erro ao buscar vencedores fixos:", error);
    }
  }, [API_URL]);

  const saveFixedWinners = async (novaLista) => {
    try {
      novaLista.sort((a, b) => a.rodada - b.rodada);
      await axios.post(`${API_URL}/vencedores-fixos`, novaLista);
      setFixedWinners(novaLista);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configuração");
    }
  };

  const handleAddFixedWinner = () => {
    if (!newFixedRound || !newFixedName || !newFixedPrize)
      return alert("Preencha todos os campos!");

    const newItem = {
      rodada: parseInt(newFixedRound),
      nome: newFixedName,
      premio: newFixedPrize,
    };

    const novaLista = [...fixedWinners, newItem];
    saveFixedWinners(novaLista);

    setNewFixedRound("");
    setNewFixedName("");
    setNewFixedPrize("");
  };

  const handleRemoveFixedWinner = (index) => {
    const novaLista = fixedWinners.filter((_, i) => i !== index);
    saveFixedWinners(novaLista);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "m") {
        e.preventDefault();
        setShowConfigModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getBrindes = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/lista-brindes`);
      if (Array.isArray(res.data)) {
        setListaBrindes(res.data);
        setTextoBrindes(res.data.join("\n"));
      }
    } catch (error) {
      console.error("Erro brindes:", error);
    }
  }, [API_URL]);

  const getNames = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/arquivo/nomes.json`);
      if (Array.isArray(res.data)) setNames(res.data);
    } catch (error) {
      console.error("Erro nomes:", error);
    }
  }, [API_URL]);

  const reset = async () => {
    try {
      setRodada(0);
      setDrawer_n([]);
      setShowConfetti(false);
      await axios.get(`${API_URL}/reset`);
      getNames();
      getBrindes();
    } catch (error) {
      console.error(error);
    }
  };

  const name_drawer = async () => {
    try {
      setLoading(true);
      setShowConfetti(false);
      setRecycleConfetti(true);

      const novaRodada = rodada + 1;

      const res = await axios.get(`${API_URL}/sortear/${quant}`);
      const sorteadosFormatados = res.data.sorteados;

      setDrawer_n(sorteadosFormatados);

      const novosNomes = await axios.get(`${API_URL}/arquivo/nomes.json`);
      setNames(novosNomes.data);

      await axios.post(`${API_URL}/relatorio/escrever`, {
        nomes: sorteadosFormatados,
        rodada: novaRodada,
      });

      setRodada(novaRodada);
      setLoading(false);
      setShowConfetti(true);
      setRecycleConfetti(true);

      setTimeout(() => setRecycleConfetti(false), 2000);
      setTimeout(() => setShowConfetti(false), 10000);
    } catch (error) {
      const msg =
        error.response?.data?.mensagem ||
        "Sorteio Finalizado ou Erro de conexão!";
      alert(msg);
      setLoading(false);
    }
  };

  // --- NOVA FUNÇÃO RESSORTEAR INVISÍVEL (DOUBLE CLICK) ---
  const handleRedrawSecret = async (index, textoAntigo) => {
    try {
      setRedrawingIndex(index); // Ativa animação de "Ressorteando..." no cartão

      const res = await axios.post(`${API_URL}/ressortear`, {
        textoAntigo: textoAntigo,
      });

      // Atualiza apenas este cartão específico
      const novosSorteados = [...drawer_n];
      novosSorteados[index] = res.data.novoTexto;
      setDrawer_n(novosSorteados);

      // Atualiza a lista geral de nomes
      const novosNomes = await axios.get(`${API_URL}/arquivo/nomes.json`);
      setNames(novosNomes.data);

      setRedrawingIndex(null); // Finaliza animação
    } catch (error) {
      alert(error.response?.data?.mensagem || "Erro ao ressortear.");
      setRedrawingIndex(null);
    }
  };

  const getList = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/lista`);
      if (textAreaRef.current)
        textAreaRef.current.value = Array.isArray(res.data)
          ? res.data.join("\n")
          : res.data;
    } catch (error) {
      console.error(error);
    }
  }, [API_URL]);

  const handleBrindesChange = (e) => {
    const texto = e.target.value;
    setTextoBrindes(texto);
    const lista = texto.split("\n").filter((item) => item.trim() !== "");
    setListaBrindes(lista);

    if (saveBrindesTimeout.current) clearTimeout(saveBrindesTimeout.current);
    saveBrindesTimeout.current = setTimeout(async () => {
      try {
        await axios.post(`${API_URL}/escrever-brindes`, lista);
      } catch (error) {
        console.error("Erro ao salvar brindes:", error);
      }
    }, 500);
  };

  const fetchParticipantesUltimoEvento = useCallback(async () => {
    try {
      const { data: ultimoEvento, error: eventoError } = await supabase
        .from("Evento")
        .select("id")
        .order("data_evento", { ascending: false })
        .limit(1)
        .single();
      if (eventoError || !ultimoEvento) {
        setParticipantesUltimoEvento([]);
        return;
      }
      const { data: participacoes, error: participacaoError } = await supabase
        .from("Participacao_Evento")
        .select("id_participante")
        .eq("id_evento", ultimoEvento.id);
      if (participacaoError || !Array.isArray(participacoes)) {
        setParticipantesUltimoEvento([]);
        return;
      }
      const idsParticipantes = Array.from(
        new Set(
          participacoes
            .map((p) => p.id_participante)
            .filter((id) => id != null),
        ),
      );
      if (idsParticipantes.length === 0) {
        setParticipantesUltimoEvento([]);
        return;
      }
      const { data: participantes, error: participantesError } = await supabase
        .from("Participante")
        .select("id, nome, email, empresa")
        .in("id", idsParticipantes);
      if (participantesError || !Array.isArray(participantes)) {
        setParticipantesUltimoEvento([]);
        return;
      }
      setParticipantesUltimoEvento(participantes);
    } catch (error) {
      console.error(error);
      setParticipantesUltimoEvento([]);
    }
  }, []);

  useEffect(() => {
    getNames();
    getList();
    getBrindes();
    fetchParticipantesUltimoEvento();
    fetchFixedWinners();
  }, [
    getNames,
    getList,
    getBrindes,
    fetchParticipantesUltimoEvento,
    fetchFixedWinners,
  ]);

  const writeList = async (e) => {
    try {
      if (e.key === "Enter") {
        const textArea = document.querySelector("#list");
        const lines = textArea.value.split("\n").filter(Boolean);
        const res = await axios.post(`${API_URL}/escrever/lista.txt`, lines);
        reset();
        return res;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* MODAL CONFIGURAÇÃO FIXOS (SOMENTE VISÍVEL COM CTRL+M) */}
      {showConfigModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Configurar Vencedores Fixos</h2>
              <FaXmark
                className="close-icon"
                onClick={() => setShowConfigModal(false)}
              />
            </div>

            <div className="modal-body">
              <div className="add-form">
                <input
                  type="number"
                  placeholder="Rodada"
                  value={newFixedRound}
                  onChange={(e) => setNewFixedRound(e.target.value)}
                  style={{ width: "80px" }}
                  title="Número da Rodada"
                />
                <input
                  list="sugestoes-nomes"
                  type="text"
                  placeholder="Nome do Vencedor"
                  value={newFixedName}
                  onChange={(e) => setNewFixedName(e.target.value)}
                />
                <datalist id="sugestoes-nomes">
                  {names.map((n, i) => (
                    <option key={i} value={n.nome} />
                  ))}
                </datalist>

                <input
                  list="sugestoes-premios"
                  type="text"
                  placeholder="Prêmio"
                  value={newFixedPrize}
                  onChange={(e) => setNewFixedPrize(e.target.value)}
                />
                <datalist id="sugestoes-premios">
                  {listaBrindes.map((b, i) => (
                    <option key={i} value={b} />
                  ))}
                </datalist>

                <button onClick={handleAddFixedWinner} className="add-btn">
                  <FaPlus />
                </button>
              </div>

              <div className="list-container">
                <ul className="fixed-list">
                  {fixedWinners.map((item, index) => (
                    <li key={index}>
                      <span className="fixed-info">
                        <strong>Rodada {item.rodada}:</strong> {item.nome}
                      </span>
                      <span className="fixed-prize">🏆 {item.premio}</span>
                      <button
                        onClick={() => handleRemoveFixedWinner(index)}
                        className="trash-btn"
                      >
                        <FaTrash />
                      </button>
                    </li>
                  ))}
                  {fixedWinners.length === 0 && (
                    <p
                      style={{
                        color: "#999",
                        textAlign: "center",
                        marginTop: "20px",
                      }}
                    >
                      Nenhum vencedor fixo configurado.
                    </p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfetti && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <ReactConfetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={recycleConfetti}
            numberOfPieces={500}
            gravity={0.15}
          />
        </div>
      )}

      <section
        className="full-background"
        style={{
          background:
            styleConfig.backgroundType === "color"
              ? styleConfig.backgroundValue
              : `url(${styleConfig.backgroundValue})`,
        }}
      >
        <main className="container">
          <div className="top_bar">
            <div className="sponsors-col left">
              <div className="sponsor-box">
                <img
                  src={currentSponsors[0]}
                  className="sponsor-mini"
                  alt="Patrocinador"
                />
              </div>
              <div className="sponsor-box">
                <img
                  src={currentSponsors[1]}
                  className="sponsor-mini"
                  alt="Patrocinador"
                />
              </div>
            </div>

            <div className="header">
              {styleConfig.logo && (
                <img
                  src={`${styleConfig.logo}`}
                  alt="Logo Principal"
                  onClick={reset}
                />
              )}
            </div>

            <div className="sponsors-col right">
              <div className="sponsor-box">
                <img
                  src={currentSponsors[2]}
                  className="sponsor-mini"
                  alt="Patrocinador"
                />
              </div>
              <div className="sponsor-box">
                <img
                  src={currentSponsors[3]}
                  className="sponsor-mini"
                  alt="Patrocinador"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : drawer_n.length > 0 ? (
            <div className="random-container">
              <div className="random">
                <ul className={drawer_n.length % 2 !== 0 ? "odd-items" : ""}>
                  {drawer_n.map((itemTexto, i) => {
                    const partes = itemTexto.split(" - ");
                    const nomeCompleto = partes[0];
                    const premio = partes[1] || "Sem prêmio";
                    const nomeResumido = nomeCompleto
                      .split(" ")
                      .slice(0, 3)
                      .join(" ");
                    return (
                      <div key={i} className="winner-wrapper">
                        <div className="badge-rodada">{rodada}</div>
                        <div className="prize-label">{premio}</div>

                        {/* CARTÃO COM GATILHO DE DUPLO CLIQUE SECRETAMENTE INVISÍVEL */}
                        <li
                          className={`winner-card clickable-card ${redrawingIndex === i ? "redrawing-anim" : ""}`}
                          onDoubleClick={() => handleRedrawSecret(i, itemTexto)}
                          title="Duplo clique rápido para ressortear"
                        >
                          {redrawingIndex === i ? (
                            <span className="winner-name-text redrawing-text">
                              Ressorteando...
                            </span>
                          ) : (
                            <span className="winner-name-text">
                              {nomeResumido}
                            </span>
                          )}
                        </li>
                      </div>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : null}

          <div className="info">
            <h1 className="edition" style={{ color: styleConfig.color }}>
              {styleConfig.title}
            </h1>
            <div className="form">
              <input
                id="qtd"
                type="number"
                min={1}
                max={names.length}
                value={quant}
                onChange={(e) => setQuant(Number(e.target.value))}
              />
              <button
                className="play_button2"
                onClick={name_drawer}
                disabled={loading}
              >
                Sortear Nomes{" "}
                <span>
                  <FaPlay color="red" size={13} style={{ marginLeft: 5 }} />
                </span>
              </button>
            </div>
          </div>

          <div className="form_areas_container">
            <div className="input-group">
              <div className="input-controls">
                <button
                  onClick={() => setIsVisibleNames(!isVisibleNames)}
                  title="Lista de Nomes"
                >
                  {isVisibleNames ? (
                    <FaRegEye size={20} />
                  ) : (
                    <FaRegEyeSlash size={20} />
                  )}
                  <span style={{ marginLeft: 5, fontSize: 12 }}>
                    Nomes ({names.length})
                  </span>
                </button>
              </div>
              <textarea
                ref={textAreaRef}
                className={`names_area ${isVisibleNames ? "visible" : "invisible"}`}
                id="list"
                placeholder="Cole a lista de NOMES aqui e aperte Enter..."
                onLoad={getList}
                onKeyDown={writeList}
              />
            </div>

            <div className="input-group">
              <div className="input-controls">
                <button
                  onClick={() => setIsVisiblePrizes(!isVisiblePrizes)}
                  title="Lista de Brindes"
                >
                  <FaGift
                    size={20}
                    color={isVisiblePrizes ? "#ffd700" : "white"}
                  />
                  <span style={{ marginLeft: 5, fontSize: 12 }}>
                    Brindes ({listaBrindes.length})
                  </span>
                </button>
              </div>
              <textarea
                className={`names_area ${isVisiblePrizes ? "visible" : "invisible"}`}
                value={textoBrindes}
                onChange={handleBrindesChange}
                placeholder="Cole a lista de BRINDES aqui... (salva automaticamente)"
                style={{ borderColor: "#ffd700" }}
              />
            </div>
          </div>

          <div className="buttons">
            <button id="report_b">
              <Link to="/report">Relatório</Link>
            </button>
            <button id="style_b">
              <Link to="/style">Estilo</Link>
            </button>
          </div>

          {participantesUltimoEvento.length > 0 && (
            <div className="participacoes">
              <h3>
                Participantes: {participantesUltimoEvento.length} participantes
              </h3>
              <br />
              <ul>
                {participantesUltimoEvento.map((p) => (
                  <li key={p.id}>
                    {p.nome ? p.nome.toUpperCase() : "(sem nome)"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </section>
    </>
  );
}
export default Home;
