import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import play from "../../assets/play.jpg";

import { useStyle } from "../../Context/StyleContext";

import "./style.css";

function Home() {
  const [names, setNames] = useState([]);
  const [drawer_n, setDrawer_n] = useState([]);
  const [quant, setQuant] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  const { styleConfig } = useStyle();

  const textAreaRef = useRef(null);

  useEffect(() => {
    getList();
  }, []);

  const reset = async () => {
    try {
      const res = await axios.get("http://localhost:3001/reset/lista.txt");

      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const name_drawer = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/sortear/nomes.json/${quant}`
      );

      const sorteados = res.data.sorteados;

      setDrawer_n(sorteados);

      const novosNomes = await axios.get(
        "http://localhost:3001/arquivo/nomes.json"
      );
      setNames(novosNomes.data);

      // eslint-disable-next-line no-unused-vars
      const post = await axios.post(
        "http://localhost:3001/relatorio/escrever",
        sorteados
      );
    } catch (error) {
      alert("Sorteio Finalizado!");
      console.log(error);
    }
  };

  const getList = async () => {
    try {
      const res = await axios.get("http://localhost:3001/lista");

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
  };

  const writeList = async (e) => {
    try {
      if (e.key === "Enter") {
        const textArea = document.querySelector("#list");
        const value = textArea.value;
        const lines = value.split("\n").filter(Boolean);

        const res = await axios.post(
          "http://localhost:3001/escrever/lista.txt",
          lines
        );

        console.log("Lista enviada com sucesso:", lines);

        reset();

        return res;
      }
    } catch (error) {
      console.log(error);
    }
  };

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
              {styleConfig.logo && (
                <img
                  src={styleConfig.logo}
                  alt="Logo"
                  style={{ width: "550px" }}
                  onClick={reset}
                />
              )}

              <h1 className="edition">{styleConfig.title}</h1>

              <div className="form_qtd">
                <input
                  id="qtd"
                  type="number"
                  min={1}
                  max={names.length}
                  value={quant}
                  onChange={(e) => setQuant(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {drawer_n.length > 0 && (
            <div className="random">
              <ul>
                {drawer_n.map((nome, i) => (
                  <li key={i}>{nome}</li>
                ))}
              </ul>
            </div>
          )}

          <button className="drawer_b" onClick={name_drawer}>
            <img src={play} alt="Player" />
          </button>

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
        </main>
      </section>
    </>
  );
}

export default Home;
