import { useState } from "react";
import "./section.css";
import { useEffect } from "react";

type Fanasana = {
  nomSampana: string;
  nomLava: string;
  fpvm: string;
  ml: string;
  synoda: string;
};
type Mpanasa = {
  nomMpanasa: string;
  toeranaMpanasa: string;
};

const mpanasa: Mpanasa = {
  nomMpanasa: `FPVM...`,
  toeranaMpanasa: `Ambohitsifantatra`,
};

function Rendre({ fanasana }: { fanasana: Fanasana }) {
  return (
    <div className="rendre">
      <h3>{fanasana.nomSampana}</h3>
      <p>{fanasana.nomLava}</p>
      <p>FPVM {fanasana.fpvm}</p>
      <p>Mpiray Lohavolana faha{fanasana.ml}</p>
      <p>Sinodam-paritra {fanasana.synoda}</p>
    </div>
  );
}

export default function Search() {
  const [className, setClassName] = useState<string>("");
  const [fanasana, setFanasana] = useState<Fanasana>({
    nomSampana: "MiM",
    nomLava: `Mpamakilain'i Madagasikara`,
    fpvm: `Loharanom-pitahiana Ambohipo Tanana`,
    ml: `2`,
    synoda: `Analamanga Atsimo`,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (fanasana.nomSampana === "") {
      setFanasana((prev) => ({
        ...prev,
        nomLava: "",
        fpvm: "",
        ml: "",
        synoda: "",
      }));
    }
  }, [fanasana.nomSampana]);

  function ouverture() {
    setClassName(`flex`);
  }
  function fermeture() {
    setClassName(`none`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setClassName(`none`);
    setFanasana((prev) => ({
      ...prev,
      nomLava: prev.nomSampana + ` FANASANA ENVOYE`,
    }));
  }

  function handleSubmit(e: string) {
    if (!e) return;
    console.log(e);
  }

  return (
    <section>
      <div className="form" onClick={() => handleSubmit(search)}>
        <input
          type="text"
          placeholder="hitady sampana"
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button rel="noopener" className="btnsearch">
          search
        </button>
      </div>

      <fieldset id="sampana">
        <legend>result {search}</legend>
        <div className="find">
          <div className="element">
            <button
              className="result"
              onClick={ouverture}
              disabled={fanasana.nomSampana === ``}
            >
              {fanasana.nomSampana}
            </button>
            <span
              className="sampana"
              onClick={() => {
                if (fanasana.nomSampana !== ``) {
                  ouverture();
                }
              }}
            >{`${fanasana.nomSampana} ${fanasana.fpvm} `}</span>
            <button
              className="result contact"
              onClick={ouverture}
              disabled={fanasana.nomSampana === ``}
            >
              contact
            </button>
          </div>
        </div>
      </fieldset>

      <div className="inviting" style={{ display: className }}>
        <button className="button" onClick={fermeture}>
          X
        </button>
        <Rendre fanasana={fanasana} />
        <label className="labelFanasana">Fanasana:</label>
        <form method="post" className="fanasana" onSubmit={submit}>
          <p>
            Izahay <strong>{mpanasa.nomMpanasa}</strong>
          </p>
          <p>dia faly manasa anareo hanatrika/hanatanteraka </p>
          <input
            className="forums"
            type="text"
            required
            placeholder="anton'ny fanasana"
          />
          <p>
            aty aminay <strong>{mpanasa.toeranaMpanasa} </strong>
          </p>
          <p> izay ho tanterahina ny</p>
          <input className="forumsDate" type="date" required />
          <div className="control">
            <button className="submit">handefa fanasana</button>
            <button className="reset" type="reset">
              hamafa
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
