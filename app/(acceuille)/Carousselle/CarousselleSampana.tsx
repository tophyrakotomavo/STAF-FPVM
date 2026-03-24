"use client";

import Image from "next/image";
import "./affichage/affichage.css";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Sampana = {
  id: string;
  name: string;
  description: string;
  image_url: string;
};

type SampanaView = {
  id: string;
  name: string;
  church_name: string;
  description: string;
};

function Afficher({
  isOpen,
  onClose,
  sampana,
  sampanaView,
}: {
  isOpen: boolean;
  onClose: () => void;
  sampana: Sampana | null;
  sampanaView: SampanaView[];
}) {
  if (!sampana) return null;
  return (
    <div className="affichage" style={{ display: isOpen ? `block` : `none` }}>
      <button className="button" onClick={onClose}>
        X
      </button>
      <div className="entete">
        <p>Sampana</p>
        <p>
          <em>({sampana.name})</em>
        </p>
        <h2 className="h2">{sampana.name}</h2>
      </div>
      <div className="corpsDuDocument">
        <p>{sampana.description}</p>
        <p style={{ textDecoration: `underline` }}>
          Ireto avy ny fiangonana misy ny sampana {sampana.name}:
        </p>
        <div className="All">
          <div className="sousTitre">
            <p>Sampana</p>
            <p>Fiangonana misy azy</p>
          </div>
          <div className="contenu">
            {sampanaView.map((item) => (
              <div className="filsContenu" key={item.id}>
                <span>{`${item.name}`}</span>
                <span>{`${item.church_name}`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarousselSampana() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Sampana | null>(null);
  const [sampana, setSampana] = useState<Sampana[]>([]);
  const [sampanaView, setSampanaView] = useState<SampanaView[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: sampanaData } = await supabase
        .from("sampana")
        .select("id, name, description, image_url");

      if (sampanaData) setSampana(sampanaData);
      if (sampanaData) {
        const views = sampanaData.map(
          (s: { id: string; name: string; description: string }) => ({
            id: s.id,
            name: s.name,
            church_name: "FPVM Loharanom-pitahiana",
            description: s.description || "",
          }),
        );
        setSampanaView(views);
      }
    };

    fetchData();
  }, []);

  return (
    <section>
      <legend className="legend">sampana rehetra</legend>
      <div className="carousselSampana">
        {sampana.map((item) => (
          <div className="duplicate" key={item.id}>
            <span className="forme formeVide blockBefore"> </span>
            <span className="forme formeVide blockBeforeHaut"> </span>
            <span className="forme formeVide blockBeforeBas"> </span>

            <span className="sampanaLogo design">
              <div
                className="forme formehover"
                onClick={() => {
                  (setSelected(item), setIsOpen(true));
                }}
              >
                <Image
                  width={200}
                  height={200}
                  alt={item.name}
                  src={item.image_url || "/images.jpg"}
                />
              </div>
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
        sampana={selected}
        sampanaView={sampanaView}
      />
    </section>
  );
}
