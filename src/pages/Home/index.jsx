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
import logoBradesco from "../../assets/bradesco.png";
import logoBraspress from "../../assets/braspress.png";
import logoMondial from "../../assets/mondial.png";
import logoAiwa from "../../assets/aiwa.png";
import logoSolumar from "../../assets/solumar.png";
import logoDaTerrinha from "../../assets/da_terrinha.png";
import logoCgtech from "../../assets/cgtech.png";
import logoLaSerenissima from "../../assets/la_serenissima.png";
import logoRevistaViva from "../../assets/revista_viva.png";
import logoClaroTv from "../../assets/claro_tv.png";
import logoAlphaChannel from "../../assets/alpha_channel.png";
import logoLed10 from "../../assets/led10.png";
import logoOba from "../../assets/oba.png";
import logoArea from "../../assets/area.png";
import logoCompet from "../../assets/compet.png";
import logoEcoville from "../../assets/ecoville.png";

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
  const [premiosPorRodada, setPremiosPorRodada] = useState({});

  const [isVisibleNames, setIsVisibleNames] = useState(false);
  const [isVisiblePrizes, setIsVisiblePrizes] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recycleConfetti, setRecycleConfetti] = useState(true);

  const [spinners, setSpinners] = useState([]);
  const saveBrindesTimeout = useRef(null);
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

  const [isPrizeDropdownOpen, setIsPrizeDropdownOpen] = useState(false);
  const [rodadasDisponiveis, setRodadasDisponiveis] = useState([]);

  const textAreaRef = useRef(null);
  const { styleConfig } = useStyle();

  const sponsorConfig = useMemo(() => {
    return {
      master: [logoBradesco, logoBraspress, logoMondial, logoAiwa],
      minor: [logoLaSerenissima, logoDaTerrinha, logoCgtech, logoEcoville],
      supporters: [logoRevistaViva, logoClaroTv, logoAlphaChannel, logoLed10],
      novosPatrocinadores: [logoSolumar, logoOba, logoArea, logoCompet],
    };
  }, []);

  const currentSponsors = useMemo(() => {
    if (rodada === 0) return sponsorConfig.master;

    // 2. MUDAMOS O MÓDULO DE 4 PARA 5 (Para incluir o novo grupo no ciclo)
    const ciclo = (rodada - 1) % 5;

    if (ciclo < 2) return sponsorConfig.master; // Rodadas 1 e 2 -> Master
    if (ciclo === 2) return sponsorConfig.minor; // Rodada 3 -> Minor
    if (ciclo === 3) return sponsorConfig.supporters; // Rodada 4 -> Supporters
    return sponsorConfig.novosPatrocinadores; // Rodada 5 -> Nova Leva (e depois recomeça)
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
      rodada: parseInt(newFixedRound, 10),
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
      if (e.ctrlKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setShowConfigModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const linhas = textoBrindes
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "");

    const obj = {};
    let currentRound = 0;

    linhas.forEach((linha) => {
      if (linha.startsWith("-") || linha.startsWith("=")) {
        const match = linha.match(/\d+/);
        if (match) {
          currentRound = parseInt(match[0], 10);
        } else {
          currentRound++;
        }
      } else {
        if (currentRound === 0) currentRound = 1;
        if (!obj[currentRound]) {
          obj[currentRound] = [];
        }
        obj[currentRound].push(linha);
      }
    });

    setPremiosPorRodada(obj);

    const disponiveis = Object.keys(obj)
      .map(Number)
      .sort((a, b) => a - b);
    setRodadasDisponiveis(disponiveis);
  }, [textoBrindes]);

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

  // Animação de Roleta dos Nomes
  useEffect(() => {
    let interval;
    if (loading && names.length > 0) {
      interval = setInterval(() => {
        const randomNames = Array.from({ length: quant }).map(() => {
          const randomIndex = Math.floor(Math.random() * names.length);
          const nomeSorteio = names[randomIndex]?.nome || "Sorteando...";
          return nomeSorteio.split(" ").slice(0, 2).join(" ");
        });
        setSpinners(randomNames);
      }, 70);
    }
    return () => clearInterval(interval);
  }, [loading, names, quant]);

  const name_drawer = async () => {
    try {
      if (quant > names.length && names.length > 0) {
        alert("A quantidade solicitada é maior que o número de nomes!");
        return;
      }

      setLoading(true);
      setShowConfetti(false);
      setRecycleConfetti(true);
      setDrawer_n([]);
      setSpinners(Array(quant).fill("Preparando..."));

      const novaRodada = rodada + 1;
      const res = await axios.get(`${API_URL}/sortear/${quant}`);
      const sorteadosFormatados = res.data.sorteados;

      setTimeout(async () => {
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

        setTimeout(() => setRecycleConfetti(false), 2000);
        setTimeout(() => setShowConfetti(false), 10000);
      }, 2500);
    } catch (error) {
      const msg =
        error.response?.data?.mensagem ||
        "Sorteio Finalizado ou Erro de conexão!";
      alert(msg);
      setLoading(false);
    }
  };

  const handleRedrawSecret = async (index, textoAntigo) => {
    try {
      setRedrawingIndex(index);
      const res = await axios.post(`${API_URL}/ressortear`, { textoAntigo });

      setTimeout(async () => {
        const novosSorteados = [...drawer_n];
        novosSorteados[index] = res.data.novoTexto;
        setDrawer_n(novosSorteados);

        const novosNomes = await axios.get(`${API_URL}/arquivo/nomes.json`);
        setNames(novosNomes.data);

        setRedrawingIndex(null);
      }, 1500);
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
        await axios.post(`${API_URL}/escrever/lista.txt`, lines);
        reset();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // LÓGICA DE BUSCA RESTRITA À RODADA SELECIONADA
  const getSortedPrizes = () => {
    if (!newFixedRound) return [];

    const premiosBase = premiosPorRodada[Number(newFixedRound)] || [];
    const search = newFixedPrize.toLowerCase().trim();

    if (!search) return premiosBase;

    const matches = premiosBase.filter((p) => p.toLowerCase().includes(search));

    return matches.sort((a, b) => {
      const aLow = a.toLowerCase();
      const bLow = b.toLowerCase();
      const aStarts = aLow.startsWith(search);
      const bStarts = bLow.startsWith(search);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
  };

  const sortedPrizes = getSortedPrizes();

  const winnersListFiltered = fixedWinners.filter(
    (f) => !newFixedRound || f.rodada === Number(newFixedRound),
  );

  return (
    <>
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
                <select
                  value={newFixedRound}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewFixedRound(val);
                    if (val !== "") {
                      const prs = premiosPorRodada[Number(val)];
                      setNewFixedPrize(prs && prs.length > 0 ? prs[0] : "");
                    } else {
                      setNewFixedPrize("");
                    }
                  }}
                  className="select-rodada"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">Rodada...</option>
                  {rodadasDisponiveis.map((r) => (
                    <option key={r} value={r}>
                      Rodada {r}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Nome do Vencedor"
                  list="sugestoes-nomes"
                  value={newFixedName}
                  onChange={(e) => setNewFixedName(e.target.value)}
                />
                <datalist id="sugestoes-nomes">
                  {names.map((n, i) => (
                    <option key={i} value={n.nome} />
                  ))}
                </datalist>

                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="text"
                    placeholder={
                      newFixedRound
                        ? "Escolha o prêmio..."
                        : "Selecione a rodada primeiro"
                    }
                    value={newFixedPrize}
                    onChange={(e) => {
                      setNewFixedPrize(e.target.value);
                      setIsPrizeDropdownOpen(true);
                    }}
                    onFocus={() => setIsPrizeDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setIsPrizeDropdownOpen(false), 200)
                    }
                    disabled={!newFixedRound}
                    style={{ width: "100%" }}
                  />
                  {isPrizeDropdownOpen && sortedPrizes.length > 0 && (
                    <ul
                      className="gn-custom-dropdown"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#fff",
                        border: "1px solid #ccc",
                        maxHeight: "150px",
                        overflowY: "auto",
                        zIndex: 10,
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        color: "#333",
                        textAlign: "left",
                      }}
                    >
                      {sortedPrizes.map((premio, idx) => (
                        <li
                          key={idx}
                          onMouseDown={() => {
                            setNewFixedPrize(premio);
                            setIsPrizeDropdownOpen(false);
                          }}
                          style={{
                            padding: "8px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f0f0f0")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          {premio}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button onClick={handleAddFixedWinner} className="add-btn">
                  <FaPlus />
                </button>
              </div>

              <div className="list-container">
                <ul className="fixed-list">
                  {winnersListFiltered.map((item) => {
                    // Acha o index real no array principal para deletar o item certo
                    const realIndex = fixedWinners.indexOf(item);
                    return (
                      <li key={realIndex}>
                        <span className="fixed-info">
                          <strong>Rodada {item.rodada}:</strong> {item.nome}
                        </span>
                        <span className="fixed-prize">🏆 {item.premio}</span>
                        <button
                          onClick={() => handleRemoveFixedWinner(realIndex)}
                          className="trash-btn"
                        >
                          <FaTrash />
                        </button>
                      </li>
                    );
                  })}
                  {winnersListFiltered.length === 0 && (
                    <p
                      style={{
                        color: "#999",
                        textAlign: "center",
                        marginTop: "20px",
                      }}
                    >
                      Nenhum vencedor nesta rodada.
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
            zIndex: 1,
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
          {/* TELA INTELIGENTE DO PROJETOR: Ocupa 100vh e centraliza os cards no espaço vazio */}
          <div className="projection-view">
            {/* CABEÇALHO */}
            <div className="header-unified-wrapper">
              <div className="sponsors-and-logo-row">
                <img
                  src={currentSponsors[0]}
                  alt="Patrocinador"
                  className="gn-sponsor-img"
                />
                <img
                  src={currentSponsors[1]}
                  alt="Patrocinador"
                  className="gn-sponsor-img"
                />

                {styleConfig.logo && (
                  <img
                    src={styleConfig.logo}
                    alt="Logo Principal"
                    className="gn-main-logo"
                    onClick={reset}
                  />
                )}

                <img
                  src={currentSponsors[2]}
                  alt="Patrocinador"
                  className="gn-sponsor-img"
                />
                <img
                  src={currentSponsors[3]}
                  alt="Patrocinador"
                  className="gn-sponsor-img"
                />
              </div>
            </div>

            {/* TÍTULO */}
            <div className="edition-title-container">
              <h2
                className="edition-title-full"
                style={{ color: styleConfig.color || "#ff5722" }}
              >
                {styleConfig.title}
              </h2>
            </div>

            {/* ÁREA DOS GANHADORES: Flexível, se ajusta no meio do espaço disponível */}
            <div className="gn-random-container">
              <ul className="gn-winners-grid">
                {loading
                  ? spinners.map((spinName, i) => {
                      // Pega os prêmios específicos da rodada atual
                      const premiosDestaRodada =
                        premiosPorRodada[rodada + 1] || [];
                      const premioVisivel =
                        premiosDestaRodada[i] || "Sorteando...";

                      return (
                        <div
                          key={`spin-${i}`}
                          className="gn-winner-card spinning-card"
                        >
                          <div className="floating-ribbon-gala">
                            <div className="round-part-gala">
                              Nº {rodada + 1}
                            </div>
                            <div className="prize-part-gala">
                              {premioVisivel}
                            </div>
                          </div>
                          <h2 className="gn-winner-name blurred">{spinName}</h2>
                        </div>
                      );
                    })
                  : drawer_n.length > 0
                    ? drawer_n.map((itemTexto, i) => {
                        const partes = itemTexto.split(" - ");
                        const nomeCompleto = partes[0];
                        const premio = partes[1] || "Sem prêmio";

                        return (
                          <div
                            key={i}
                            className={`gn-winner-card ${redrawingIndex === i ? "redrawing-anim" : ""}`}
                            onDoubleClick={() =>
                              handleRedrawSecret(i, itemTexto)
                            }
                            title="Duplo clique rápido para ressortear"
                          >
                            <div className="floating-ribbon-gala">
                              <div className="round-part-gala">Nº {rodada}</div>
                              <div className="prize-part-gala">{premio}</div>
                            </div>
                            <h2 className="gn-winner-name">
                              {redrawingIndex === i
                                ? "Ressorteando..."
                                : nomeCompleto}
                            </h2>
                          </div>
                        );
                      })
                    : null}
              </ul>
            </div>
          </div>
          {/* FIM DA TELA DO PROJETOR */}

          {/* BACKSTAGE ADMIN: Imediatamente abaixo da tela do projetor */}
          <div className="admin-backstage">
            <div className="gn-glass-panel">
              <div className="gn-control-inputs">
                <div className="gn-input-wrapper">
                  <label>Sorteados</label>
                  <div className="custom-number-input">
                    <button
                      type="button"
                      className="qtd-btn"
                      onClick={() => setQuant((q) => Math.max(1, q - 1))}
                      disabled={loading || quant <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={names.length}
                      value={quant}
                      onChange={(e) => setQuant(Number(e.target.value))}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="qtd-btn"
                      onClick={() =>
                        setQuant((q) => Math.min(names.length, q + 1))
                      }
                      disabled={loading || quant >= names.length}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className={`gn-btn-play ${loading ? "disabled" : ""}`}
                  onClick={name_drawer}
                  disabled={loading || names.length === 0}
                >
                  {loading ? "SORTEANDO..." : "SORTEAR AGORA"}
                  {!loading && (
                    <FaPlay size={14} style={{ marginLeft: "8px" }} />
                  )}
                </button>
              </div>

              <div className="gn-admin-buttons">
                <button
                  className={`gn-tab-btn ${isVisibleNames ? "active" : ""}`}
                  onClick={() => setIsVisibleNames(!isVisibleNames)}
                  title="Lista de Nomes"
                >
                  {isVisibleNames ? <FaRegEye /> : <FaRegEyeSlash />} Nomes (
                  {names.length})
                </button>
                <button
                  className={`gn-tab-btn ${isVisiblePrizes ? "active" : ""}`}
                  onClick={() => setIsVisiblePrizes(!isVisiblePrizes)}
                  title="Lista de Brindes"
                >
                  <FaGift /> Brindes ({listaBrindes.length})
                </button>
                <button className="gn-tab-btn">
                  <Link
                    to="/report"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    Relatório
                  </Link>
                </button>
                <button className="gn-tab-btn">
                  <Link
                    to="/style"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    Estilo
                  </Link>
                </button>
              </div>
            </div>

            <div className="form_areas_container">
              <textarea
                ref={textAreaRef}
                className={`gn-area ${isVisibleNames ? "show" : "hide"}`}
                id="list"
                placeholder="Cole a lista de NOMES aqui e aperte Enter..."
                onLoad={getList}
                onKeyDown={writeList}
              />
              <textarea
                className={`gn-area ${isVisiblePrizes ? "show" : "hide"}`}
                value={textoBrindes}
                onChange={handleBrindesChange}
                placeholder="Cole a lista de BRINDES aqui..."
              />
            </div>

            {participantesUltimoEvento.length > 0 && (
              <div className="participacoes-gala">
                <h3>
                  Participantes Check-in: {participantesUltimoEvento.length}
                </h3>
                <ul>
                  {participantesUltimoEvento.map((p) => (
                    <li key={p.id}>
                      {p.nome ? p.nome.toUpperCase() : "(sem nome)"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </section>
    </>
  );
}
export default Home;
