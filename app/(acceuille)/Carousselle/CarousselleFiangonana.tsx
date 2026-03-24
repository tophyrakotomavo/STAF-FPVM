"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Fiangonana = {
  id: string;
  name: string;
  description: string;
};

type SampanaList = {
  id: string;
  nom: string;
};

function Afficher({
  isOpen,
  onClose,
  fiangonanaList,
  sampanaList,
}: {
  isOpen: boolean;
  onClose: () => void;
  fiangonanaList: Fiangonana | null;
  sampanaList: SampanaList[];
}) {
  if (!fiangonanaList) return null;
  return (
    <div className="affichage" style={{ display: isOpen ? `block` : `none` }}>
      <button className="button" onClick={onClose}>
        X
      </button>
      <div className="entete">
        <p>FPVM</p>
        <p>Fiangonana Protestanta Vaovao eto Madagasikara</p>
        <h2 className="h2">{fiangonanaList.name.toUpperCase()}</h2>
      </div>
      <div className="corpsDuDocument">
        <p>{fiangonanaList.description}</p>
        <p style={{ textDecoration: `underline` }}>
          Ireto avy ny sampana misy eto amin'ny FPVM ...:
        </p>
        <div className="All">
          <div className="sousTitre">
            <p>Id</p>
            <p>Fiangonana FPVM...</p>
          </div>
          <div className="contenu">
            {sampanaList.map((item) => (
              <div className="filsContenu" key={item.id}>
                <span>{`#00${item.id.slice(0, 1)}`}</span>
                <span>{`${item.nom}`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarousselFiangonana() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Fiangonana | null>(null);
  const [fiangonana, setFiangonana] = useState<Fiangonana[]>([]);
  const [sampanaList, setSampanaList] = useState<SampanaList[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: churchesData } = await supabase
        .from("churches")
        .select("*")
        .like("name", "FPVM%");

      console.log(churchesData);

      const { data: sampanaData } = await supabase
        .from("sampana")
        .select("id, name");

      if (churchesData) setFiangonana(churchesData);
      if (sampanaData)
        setSampanaList(
          sampanaData.map((s: { id: string; name: string }) => ({
            id: s.id,
            nom: s.name,
          }))
        );
    };

    fetchData();
  }, []);

  return (
    <section className="fiangonana" id="fpvm">
      <legend className="legend">fiangonana rehetra</legend>
      <div className="carousselSampana">
        {fiangonana.map((item) => (
          <div key={item.id} className="duplicate">
            <span className="forme formeVide blockBefore"> </span>
            <span className="forme formeVide blockBeforeHaut blockBefore">
              {" "}
            </span>
            <span className="forme formeVide blockBeforeBas blockBefore">
              {" "}
            </span>
            <span className="sampanaLogo design">
              <button
                className="forme btnfiangonana formehover"
                onClick={() => (setSelected(item), setIsOpen(true))}
              >
                {item.name}
              </button>
            </span>
            <span className="forme formeVide"> </span>
            <span className="forme formeVide blockHaut"> </span>
            <span className="forme formeVide blockBas"> </span>
            <span className="forme formeVide blockHautGauche"> </span>
            <span className="forme formeVide blockBasGauche"> </span>
          </div>
        ))}
      </div>
      <Afficher
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        fiangonanaList={selected}
        sampanaList={sampanaList}
      />
    </section>
  );
}
