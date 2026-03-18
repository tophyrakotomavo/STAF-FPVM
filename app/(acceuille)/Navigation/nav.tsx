import Image from "next/image";
import Link from "next/link";

export default function Navigation() {
  return (
    <div>
      <nav>
        <span className="logo">
          <span>
            <Image
              src="/staf-logo.jpg"
              width={40}
              height={40}
              alt="staf"
              className="logo1"
            />
          </span>
          <span>STAF</span>
        </span>
        <span className="tools">
          <span className="link">
            <Link href="#acceuil">acceuil</Link>
          </span>
          <span className="link">
            <Link href="#sampana">sampana</Link>
          </span>
          <span className="link">
            <Link href="#fpvm">FPVM</Link>
          </span>
          <span className="link">
            <Link href="/login" target="_blank">
              Log in
            </Link>
          </span>
        </span>
      </nav>
    </div>
  );
}
