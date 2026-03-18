import Link from "next/link";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="glassFooter">
        <h2>STAF</h2>
        <div className="contactFooter">
          <h3>Contact:</h3>
          <ul>
            <li>
              <Link href={"#"} className="lien">
                Pst Juliano
              </Link>
            </li>
            <li>
              <Link href={"#"} className="lien">
                Pst Hanitra
              </Link>
            </li>
          </ul>
        </div>
        <div className="reseaux">
          <h3>Reseaux:</h3>
          <ul>
            <li className="reseauxLink">
              <Link
                href={"https://www.facebook.com/staf.foibe.fpvm"}
                target="_blank"
                className="lien"
              >
                STAF Foibe
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mention">Mention Legal | &copy; Copyright</div>
    </footer>
  );
}
