"use client";

import { useState, useEffect } from "react";
import "./section.css";
import { createClient } from "@/lib/supabase/client";

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

type Sampana = {
  id: string;
  name: string;
  description: string;
  color: string;
  church_id: string;
};

export default function Search() {
  const [className, setClassName] = useState<string>("");
  const [fanasana, setFanasana] = useState<Fanasana>({
    nomSampana: "",
    nomLava: "",
    fpvm: "",
    ml: "",
    synoda: "",
  });
  const [search, setSearch] = useState("");
  const [sampanaList, setSampanaList] = useState<Sampana[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSampana() {
      const { data } = await supabase
        .from("sampana")
        .select("id, name, description, color, church_id");
      if (data) {
        setSampanaList(data);
      }
    }
    fetchSampana();
  }, []);

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

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearch(value);
    if (value.trim()) {
      const filtered = sampanaList.find(
        (s) => s.name.toLowerCase() === value.toLowerCase()
      );
      if (filtered) {
        setFanasana({
          nomSampana: filtered.name,
          nomLava: filtered.description || "",
          fpvm: filtered.church_id || "",
          ml: filtered.id || "",
          synoda: filtered.color || "",
        });
      }
    } else {
      setFanasana({
        nomSampana: "",
        nomLava: "",
        fpvm: "",
        ml: "",
        synoda: "",
      });
    }
  }

  return (
    <section>
      <div className="form">
        <input
          type="text"
          placeholder="hitady sampana"
          className="search"
          value={search}
          onChange={handleSearchChange}
        />
        <button rel="noopener" className="btnsearch">
          search
        </button>
      </div>

      <fieldset id="sampana">
        <legend>result {search}</legend>
        <div className="find">
          {sampanaList
            .filter((s) => search.trim() !== "" && s.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 5)
            .map((s) => (
              <div key={s.id} className="element">
                <button
                  className="result"
                  onClick={() => {
                    setFanasana({
                      nomSampana: s.name,
                      nomLava: s.description || "",
                      fpvm: s.church_id || "",
                      ml: s.id || "",
                      synoda: s.color || "",
                    });
                    setSearch(s.name);
                  }}
                  disabled={!s.name}
                >
                  {s.name}
                </button>
                <span
                  className="sampana"
                  onClick={() => {
                    if (s.name) {
                      setClassName("flex");
                    }
                  }}
                >{`${s.name} ${s.church_id} `}</span>
                <button
                  className="result contact"
                  onClick={() => setClassName("flex")}
                  disabled={!s.name}
                >
                  contact
                </button>
              </div>
            ))}
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
