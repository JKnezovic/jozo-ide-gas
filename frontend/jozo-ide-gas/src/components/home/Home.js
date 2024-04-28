import React from "react";
import BannerImage from "../../assets/Home-banner.png";
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
            Join me and experience the thrill of exploration, the warmth of camaraderie, and the joy
            of discovery on these unforgettable cycling escapades.
          </p>
          <Link to="/ongoing" className="secondary-button">
            Start{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
