import React from "react";
import BannerImage from "../../assets/path29.png";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-image-section">
        <img src={BannerImage} alt="" />
      </div>

      <div className="home-banner-container">
        <div className="home-text-section">
          <h1 className="primary-heading">JOZO IDE GAS</h1>
          <p className="primary-text">
            Zaronite u svijet biciklističkih čuda s Jozom! Pratite ga na putovanjima biciklom kroz
            Europu. Otkrijte ljepotu staza, kulture i nevjerojatne trenutke.
          </p>
          <Link to="/ongoing" className="secondary-button">
            Započni{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
