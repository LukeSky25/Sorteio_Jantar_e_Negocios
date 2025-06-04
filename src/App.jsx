import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import logo from "./assets/logo.png";
import play from "./assets/play.jpg";

import "./style.css";

function App() {
  const [names, setNames] = useState([]);
  const [drawer_n, setDrawer_n] = useState([]);
  const [quant, setQuant] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  const textAreaRef = useRef(null);

  useEffect(() => {
    getList();
  }, []);

  const reset = async () => {
    try {
      const res = await axios.get("http://localhost:3001/escrever/lista.txt");

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
      console.log(sorteados);
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
          "http://localhost:3001/lista/lista.txt",
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
      <section>
        <main className="container">
          <div className="top_bar">
            <div className="header">
              <img src={logo} alt="Logo Jantar & Negócios" onClick={reset} />

              <h1 className="edition">Edição Nº211 - El Uruguayo</h1>

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
        </main>
      </section>
    </>
  );
}

export default App;
