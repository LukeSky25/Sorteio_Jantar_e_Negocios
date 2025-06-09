import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import { FaArrowLeft } from "react-icons/fa";
import { useStyle } from "../../Context/StyleContext";

import "./style.css";

function Report() {
  const [names, setNames] = useState([]);
  const [drawn_n, setDrawn_n] = useState([]);

  const { styleConfig } = useStyle();

  useEffect(() => {
    axios
      .get("http://localhost:3001/arquivo/nomes.json")
      .then((res) => setNames(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3001/relatorio")
      .then((res) => setDrawn_n(res.data))
      .catch((err) => console.log(err));
  }, []);

  const downloading = () => {
    if (drawn_n == 0) alert("Nenhum nome sorteado");
    window.location.href = "http://localhost:3001/relatorio/download";
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
                <li>Total de Participantes: {names.length}</li>
                <li>Total de Sorteados: {drawn_n.length}</li>
                <li>
                  Sorteados:
                  <ol>
                    {drawn_n.slice(0, 10).map((p, i) => (
                      <li key={i} className="drawn_names">
                        {p}
                      </li>
                    ))}
                  </ol>
                </li>
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
