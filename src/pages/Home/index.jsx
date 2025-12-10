import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Ícones
import { FaRegEye, FaRegEyeSlash, FaGift } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";

// Componentes e Contexto
import Spinner from "../../Components/Spinner";
import { useStyle } from "../../Context/useStyle";
import { supabase } from "../../supabaseClient";

// Confetes
import ReactConfetti from "react-confetti";

// CSS
import "./style.css";

function Home() {
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados principais
  const [names, setNames] = useState([]);
  const [drawer_n, setDrawer_n] = useState([]);
  const [quant, setQuant] = useState(1);
  const [loading, setLoading] = useState(false);
  const [participantesUltimoEvento, setParticipantesUltimoEvento] = useState(
    []
  );

  // Estados da lógica de Prêmios e Rodadas
  const [rodada, setRodada] = useState(0);
  const [listaBrindes, setListaBrindes] = useState([]);
  const [textoBrindes, setTextoBrindes] = useState("");
  const [indiceBrinde, setIndiceBrinde] = useState(0); // Controla qual prêmio da lista será pego

  // Controle de Visualização (Inputs e Confetes)
  const [isVisibleNames, setIsVisibleNames] = useState(false);
  const [isVisiblePrizes, setIsVisiblePrizes] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recycleConfetti, setRecycleConfetti] = useState(true);

  // Dimensões da janela para os confetes
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const textAreaRef = useRef(null);
  const { styleConfig } = useStyle();

  // Atualiza tamanho da janela para confetes se redimensionar
  const detectSize = () => {
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", detectSize);
    return () => {
      window.removeEventListener("resize", detectSize);
    };
  }, [windowDimension]);

  // --- FUNÇÃO RESET ---
  const reset = async () => {
    try {
      setRodada(0);
      setIndiceBrinde(0);
      setDrawer_n([]);
      setShowConfetti(false);
      const res = await axios.get(`${API_URL}/reset/lista.txt`);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // --- FUNÇÃO DE SORTEIO ---
  const name_drawer = async () => {
    try {
      setLoading(true);
      setShowConfetti(false); // Reseta confetes antes de começar
      setRecycleConfetti(true);

      // 1. Busca sorteados
      const res = await axios.get(`${API_URL}/sortear/nomes.json/${quant}`);
      const sorteados = res.data.sorteados;

      // 2. Atualiza tela
      setDrawer_n(sorteados);

      // 3. Atualiza lista geral
      const novosNomes = await axios.get(`${API_URL}/arquivo/nomes.json`);
      setNames(novosNomes.data);

      // 4. Lógica de Rodada e Prêmios
      setRodada((prev) => prev + 1);
      setIndiceBrinde((prev) => prev + sorteados.length); // Avança na lista de prêmios

      // 5. Salva relatório
      // eslint-disable-next-line no-unused-vars
      const post = await axios.post(`${API_URL}/relatorio/escrever`, sorteados);

      setLoading(false);

      setShowConfetti(true);
      setRecycleConfetti(true);

      setTimeout(() => {
        setRecycleConfetti(false);
      }, 2000);

      // 3. Após 10 segundos (tempo suficiente para todos caírem), remove o componente
      setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
    } catch (error) {
      alert("Sorteio Finalizado ou Erro de conexão!");
      console.log(error);
      setLoading(false);
    }
  };

  const getList = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/lista`);
      if (textAreaRef.current) {
        if (Array.isArray(res.data)) {
          textAreaRef.current.value = res.data.join("\n");
        } else {
          textAreaRef.current.value = res.data;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [API_URL]);

  useEffect(() => {
    getList();
    fetchParticipantesUltimoEvento();
  }, [getList]);

  // Manipula o texto da lista de brindes
  const handleBrindesChange = (e) => {
    const texto = e.target.value;
    setTextoBrindes(texto);
    const lista = texto.split("\n").filter((item) => item.trim() !== "");
    setListaBrindes(lista);
  };

  const fetchParticipantesUltimoEvento = async () => {
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
          participacoes.map((p) => p.id_participante).filter((id) => id != null)
        )
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
      console.error("Erro ao buscar participantes:", error);
      setParticipantesUltimoEvento([]);
    }
  };

  const writeList = async (e) => {
    try {
      if (e.key === "Enter") {
        const textArea = document.querySelector("#list");
        const value = textArea.value;
        const lines = value.split("\n").filter(Boolean);
        const res = await axios.post(`${API_URL}/escrever/lista.txt`, lines);
        console.log("Lista enviada com sucesso:", lines);
        reset();
        return res;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* Confetes cobrindo a tela quando ativado */}
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
            <div className="header">
              {styleConfig.logo && (
                <img src={`${styleConfig.logo}`} alt="Logo" onClick={reset} />
              )}

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

                <button className="play_button2" onClick={name_drawer}>
                  Sortear Nomes
                  <span>
                    <FaPlay color="red" size={13} style={{ marginLeft: 5 }} />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* --- ÁREA DOS GANHADORES --- */}
          {loading ? (
            <Spinner />
          ) : drawer_n.length > 0 ? (
            <div className="random-container">
              <div className="random">
                <ul className={drawer_n.length % 2 !== 0 ? "odd-items" : ""}>
                  {drawer_n.map((nome, i) => {
                    // Limita o nome para não quebrar layout
                    const partes = nome.split(" ");
                    const nomeResumido = partes.slice(0, 3).join(" ");

                    // Lógica para pegar o prêmio sequencial
                    const indiceDoPremioParaEsteGanhador =
                      indiceBrinde - drawer_n.length + i;
                    const premioAtual = listaBrindes[
                      indiceDoPremioParaEsteGanhador
                    ]
                      ? listaBrindes[indiceDoPremioParaEsteGanhador]
                      : `Prêmio ${indiceDoPremioParaEsteGanhador + 1}`;

                    return (
                      <div key={i} className="winner-wrapper">
                        {/* 1. BOLINHA DA RODADA (NA ESQUERDA) */}
                        <div className="badge-rodada">{rodada}</div>

                        {/* 2. NOME DO PRÊMIO (EM CIMA) */}
                        <div className="prize-label">{premioAtual}</div>

                        {/* 3. CARD DO NOME */}
                        <li className="winner-card">{nomeResumido}</li>
                      </div>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : null}

          {/* --- ÁREA DE INPUTS (NOMES E BRINDES) --- */}
          <div className="form_areas_container">
            {/* Input Nomes */}
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
                className={`names_area ${
                  isVisibleNames ? "visible" : "invisible"
                }`}
                id="list"
                placeholder="Cole a lista de NOMES aqui e aperte Enter..."
                onLoad={getList}
                onKeyDown={writeList}
              />
            </div>

            {/* Input Brindes */}
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
                className={`names_area ${
                  isVisiblePrizes ? "visible" : "invisible"
                }`}
                value={textoBrindes}
                onChange={handleBrindesChange}
                placeholder="Cole a lista de BRINDES aqui (um por linha)..."
                style={{ borderColor: "#ffd700" }}
              />
            </div>
          </div>

          <div className="buttons">
            <button id="report_b">
              <Link to={"/report"}>Relatório</Link>
            </button>
            <button id="style_b">
              <Link to={"/style"}>Estilo</Link>
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
