import "./style.css";
import Navigation from "./Navigation/nav";
import Search from "./Search/section";
import CarousselSampana from "./Carousselle/CarousselleSampana";
import CarousselFiangonana from "./Carousselle/CarousselleFiangonana";
import Blog from "./Blog/blog";
import Footer from "./Footer/footer";

const HomePage = () => (
  <body>
    <Navigation />
    <header>
      <div className="head" id="acceuille">
        <span className="staf">STAF</span>
        <span className="fpvm">FPVM</span>
      </div>
    </header>
    <Search />
    <CarousselSampana />
    <CarousselFiangonana />
    <Blog />
    <Footer />
  </body>
);

export default HomePage;
