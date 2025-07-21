import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";

import Spinner from "../../Components/Spinner";

import { useStyle } from "../../Context/useStyle";

import "./style.css";
import { supabase } from "../../supabaseClient";

function Home() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [names, setNames] = useState([]);
  const [drawer_n, setDrawer_n] = useState([]);
  const [quant, setQuant] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const [dados, setDados] = useState([]);

  const textAreaRef = useRef(null);

  // Configurador de estilo da página

  const { styleConfig } = useStyle();

  // Reseta a lista de participantes e sorteados

  const reset = async () => {
    try {
      const res = await axios.get(`${API_URL}/reset/lista.txt`);

      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Busca os nomes sorteados e os envia para /relatorio

  const name_drawer = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/sortear/nomes.json/${quant}`);

      const sorteados = res.data.sorteados;

      setDrawer_n(sorteados);

      const novosNomes = await axios.get(`${API_URL}/arquivo/nomes.json`);
      setNames(novosNomes.data);

      // eslint-disable-next-line no-unused-vars
      const post = await axios.post(`${API_URL}/relatorio/escrever`, sorteados);

      setLoading(false);
    } catch (error) {
      alert("Sorteio Finalizado!");
      console.log(error);
      setLoading(false);
    }
  };

  // Busca a lista de participantes

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

  // Busca os nomes dos participantes

  useEffect(() => {
    getList();
  }, [getList]);

  useEffect(() => {
    const buscarParticipacoes = async () => {
      // Primeiro, buscar o maior id_evento
      const { data: eventos, error: erroEvento } = await supabase
        .from("Participacao_Evento")
        .select("id_evento")
        .order("id_evento", { ascending: false })
        .limit(1);

      if (erroEvento) {
        console.error("Erro ao buscar último evento:", erroEvento);
        return;
      }

      const ultimoEventoId =
        eventos && eventos.length > 0 ? eventos[0].id_evento : null;
      if (!ultimoEventoId) {
        setDados([]);
        return;
      }

      // Agora buscar apenas as participações do último evento
      const { data, error } = await supabase
        .from("Participacao_Evento")
        .select(
          `
          id,
          id_evento,
          id_participante,
          Participante (
            id,
            nome,
            email,
            empresa
          )
        `
        )
        .eq("id_evento", ultimoEventoId);

      if (error) {
        console.error("Erro ao buscar dados:", error);
      } else {
        setDados(data);
      }
    };

    buscarParticipacoes();
  }, []);

  // Escreve os nomes na lista de participantes

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

  // Torna a textarea visivel e não visivel

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
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
              {/* Carrega a logo de StyleContext */}

              {styleConfig.logo && (
                <img src={`${styleConfig.logo}`} alt="Logo" onClick={reset} />
              )}

              {/* Carrega o texto e a cor da edição de StyleContext */}

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
                    <FaPlay color="red" size={13} />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Carrega os nomes sorteados da API com apenas os 3 primeiros nomes e utiliza um spinner */}

          {loading ? (
            <Spinner />
          ) : drawer_n.length > 0 ? (
            <div className="random">
              <ul className={drawer_n.length % 2 !== 0 ? "odd-items" : ""}>
                {drawer_n.map((nome, i) => {
                  const partes = nome.split(" ");
                  const nomeResumido = partes.slice(0, 3).join(" ");
                  return <li key={i}>{nomeResumido}</li>;
                })}
              </ul>
            </div>
          ) : null}

          {/* <div className="play-container">
            <button className="play_button" onClick={name_drawer}>
              <FaPlay color="red" size={15} />
            </button>
          </div> */}

          <div className="form_names">
            <textarea
              ref={textAreaRef}
              className={`names_${isVisible ? "visible" : "invisible"}`}
              id="list"
              type="text"
              onLoad={getList}
              onKeyDown={writeList}
            />
            <button id="hiding_b" onClick={toggleVisibility}>
              {/* Torna a textarea visivel e não visivel */}

              {isVisible ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
            </button>
          </div>

          <div className="buttons">
            <button id="report_b">
              <Link to={"/report"}>Relatório</Link>
            </button>
            <button id="style_b">
              <Link to={"/style"}>Estilo</Link>
            </button>
          </div>

          {dados.length > 0 && (
            <div className="participacoes">
              <h3>Participantes</h3>
              <br />
              <ul>
                {dados.map((item) => (
                  <li key={item.id}>{item.Participante?.nome.toUpperCase()}</li>
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
