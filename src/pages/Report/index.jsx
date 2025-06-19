import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import { FaArrowLeft } from "react-icons/fa";
import { useStyle } from "../../Context/useStyle";

import "./style.css";

function Report() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [names, setNames] = useState([]);
  const [drawn_n, setDrawn_n] = useState([]);

  // Configurador de estilo da página

  const { styleConfig } = useStyle();

  // Busca os nomes dos participantes

  useEffect(() => {
    axios
      .get(`${API_URL}/arquivo/nomes.json`)
      .then((res) => setNames(res.data))
      .catch((err) => console.log(err));
  }, [API_URL]);

  // Busca os nomes dos sorteados

  useEffect(() => {
    axios
      .get(`${API_URL}/relatorio`)
      .then((res) => setDrawn_n(res.data))
      .catch((err) => console.log(err));
  }, [API_URL]);

  // Abaixa arquivo relatorio.pdf

  const downloading = () => {
    if (drawn_n == 0) alert("Nenhum nome sorteado");
    window.location.href = `${API_URL}/relatorio/download`;
  };

  return (
    <>
      <nav className="nav-bar">
        <Link to={"/"}>
          <FaArrowLeft size={20} className="arrow-icon" />
        </Link>
        <h1 className="nav-title">Relatório do Sorteio</h1>
      </nav>
      <section
        className="container2"
        style={{
          background:
            styleConfig.backgroundType === "color"
              ? styleConfig.backgroundValue
              : `url(${styleConfig.backgroundValue})`,
        }}
      >
        <main>
          <div className="report">
            <h1>Informações</h1>

            <div className="inf">
              <ul>
                {/* Busca a quantidade de Participantes */}

                <li>Total de Participantes: {names.length}</li>

                {/* Busca a quantidade de Sorteados */}

                <li>Total de Sorteados: {drawn_n.length}</li>

                <li>
                  Sorteados:
                  <ol>
                    {/* Mostra os 10 primeiros sorteados */}

                    {drawn_n.slice(0, 10).map((p, i) => (
                      <li key={i} className="drawn_names">
                        {p}
                      </li>
                    ))}
                  </ol>
                </li>

                {/* Mostra o número do último sorteado */}

                <li className="last_name_d">{drawn_n.length}. ...</li>
              </ul>
            </div>

            <button className="download_b" onClick={downloading}>
              Baixar Relatório
            </button>
          </div>
        </main>
      </section>
    </>
  );
}

export default Report;
