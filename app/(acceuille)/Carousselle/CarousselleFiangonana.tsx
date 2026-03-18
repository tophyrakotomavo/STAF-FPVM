import { useState } from "react";

type SampanaList = {
  id: number;
  nom: string;
};

const sampanalist: SampanaList[] = [
  {
    id: 1,
    nom: "MiM",
  },
  {
    id: 2,
    nom: "CLAM",
  },
];
type Fiangonana = {
  id: number;
  name: string;
  description: string;
};
const fiangonana: Fiangonana[] = [
  {
    id: 1,
    name: `FPVM Ambohipo`,
    description: `Ny FPVM Ambohipo Tanana dia manana sampana 2`,
  },
  {
    id: 2,
    name: `FPVM Ampitatafika`,
    description: `Ny FPVM Ampitatafika dia manana sampana 10`,
  },
];

function Afficher({
  isOpen,
  onClose,
  fiangonanaList,
}: {
  isOpen: boolean;
  onClose: () => void;
  fiangonanaList: Fiangonana | null;
}) {
  if (!fiangonanaList) return null;
  const currentView = fiangonana.find((v) => v.id === fiangonanaList.id);
  return (
    <div className="affichage" style={{ display: isOpen ? `block` : `none` }}>
      <button className="button" onClick={onClose}>
        X
      </button>
      <div className="entete">
        <p>FPVM</p>
        <p>Fiangonana Protestanta Vaovao eto Madagasikara</p>
        <h2 className="h2">FPVM AMBOHITSIFANTATRA</h2>
      </div>
      <div className="corpsDuDocument">
        <p>{currentView?.description}</p>
        <p style={{ textDecoration: `underline` }}>
          Ireto avy ny sampana misy eto amin'ny FPVM ...:
        </p>
        <div className="All">
          <div className="sousTitre">
            <p>Id</p>
            <p>Fiangonana FPVM...</p>
          </div>
          <div className="contenu">
            {sampanalist.map((item) => (
              <div className="filsContenu" key={item.id}>
                <span>{`#00${item.id}`}</span>
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
      />
    </section>
  );
}
