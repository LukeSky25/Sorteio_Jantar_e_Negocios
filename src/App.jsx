import { useEffect, useState } from "react";
import axios from "axios";

import Header from "./components/Header";
import "./style.css";

function App() {
  const [names, setNames] = useState([]);
  const [drawer_n, setDrawer_n] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/arquivo/test2.json")
      .then((res) => setNames(res.data))
      .catch((err) => console.log(err));
  }, []);

  const name_drawer = () => {
    if (names.length >= 2) {
      const index1 = Math.floor(Math.random() * names.length);
      let sorteados = [];
      let index2;

      sorteados.push(names[index1].nome);

      do {
        index2 = Math.floor(Math.random() * names.length);
      } while (index2 === index1);

      sorteados.push(names[index2].nome);

      setDrawer_n(sorteados);
      console.log("Sorteados:", sorteados);
    } else {
      alert("É necessário pelo menos 2 nomes para o sorteio.");
    }
  };

  return (
    <>
      <Header />

      <section>
        <main className="container">
          <div className="top_bar">
            <div className="header2">
              <h2>Sorteio dos Nomes</h2>
            </div>
            <span className="total_p">
              Total de Participantes: {names.length}
            </span>
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
            Sortear
          </button>
        </main>
      </section>
    </>
  );
}

export default App;
