import { useEffect, useState } from "react";
import axios from "axios";

import logo from "./assets/logo.png";
import play from "./assets/play.jpg";

import "./style.css";

function App() {
  const [names, setNames] = useState([]);
  const [drawer_n, setDrawer_n] = useState([]);
  const [quant, setQuant] = useState(1);

  useEffect(() => {
    axios
      .get("http://localhost:3001/arquivo/test2.json")
      .then((res) => setNames(res.data))
      .catch((err) => console.log(err));
  }, []);

  const name_drawer = () => {
    if (names.length >= quant) {
      const copiaNomes = [...names];
      const sorteados = [];

      for (let i = 0; i < quant; i++) {
        const index = Math.floor(Math.random() * copiaNomes.length);
        sorteados.push(copiaNomes[index].nome);
        copiaNomes.splice(index, 1);
      }

      setDrawer_n(sorteados);
    } else {
      alert(`É necessário pelo menos ${quant} nomes para o sorteio.`);
    }
  };

  return (
    <>
      <section>
        <main className="container">
          <div className="top_bar">
            <div className="header">
              <img src={logo} alt="Logo Jantar & Negócios" />

              <h1>N°25</h1>

              <div className="form_qtd">
                <input
                  id="qtd"
                  type="text"
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
        </main>
      </section>
    </>
  );
}

export default App;
