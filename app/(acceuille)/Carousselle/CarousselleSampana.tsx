import Image from "next/image";
import "./affichage/affichage.css";
import { useState } from "react";

type Sampana = {
  id: number;
  sampana: string;
  sampanaNom: string;
  image: string;
};

type SampanaView = {
  id: number;
  nom: string;
  fiangonana: string;
  description: string;
};

const sampana_view: SampanaView[] = [
  {
    id: 1,
    nom: "MiM Fiv42",
    fiangonana: `FPVM Loharanom-pitahiana Ambohipo Tanana`,
    description: `Ny Sampana mpamakilay dia isan'ny fikambanana SCOUT mijoro eto anivon'ny FPVM`,
  },
];

const sampana: Sampana[] = [
  {
    id: 1,
    sampana: "MIM",
    sampanaNom: "Mpamakilain'i Madagasikara",
    image: "/images.jpg",
  },
  {
    id: 2,
    sampana: "AFAFI",
    sampanaNom: "AFAFI",
    image: "/images (1).png",
  },
];

function Afficher({
  isOpen,
  onClose,
  sampana,
}: {
  isOpen: boolean;
  onClose: () => void;
  sampana: Sampana | null;
}) {
  if (!sampana) return null;
  const currentView = sampana_view.find((v) => v.id === sampana.id);
  return (
    <div className="affichage" style={{ display: isOpen ? `block` : `none` }}>
      <button className="button" onClick={onClose}>
        X
      </button>
      <div className="entete">
        <p>Sampana</p>
        <p>
          <em>({sampana.sampana})</em>
        </p>
        <h2 className="h2">{sampana.sampanaNom}</h2>
      </div>
      <div className="corpsDuDocument">
        <p>{currentView?.description}</p>
        <p style={{ textDecoration: `underline` }}>
          Ireto avy ny fiangonana misy ny sampana {sampana.sampana}:
        </p>
        <div className="All">
          <div className="sousTitre">
            <p>Sampana</p>
            <p>Fiangonana misy azy</p>
          </div>
          <div className="contenu">
            {sampana_view.map((item) => (
              <div className="filsContenu" key={item.id}>
                <span>{`${item.nom}`}</span>
                <span>{`${item.fiangonana}`}</span>
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
                  alt={item.sampana}
                  src={item.image}
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
      />
    </section>
  );
}
