import React from "react";
import { Link } from "react-router-dom";
const Card = ({ tripName, totalLength, description, days, imageSource, date, tripId }) => {
  return (
    <Link to={"/done/" + tripId} className="Link">
      <div className="past-trips-card">
        <img className="card-image" alt="" src={imageSource}></img>
        <p className="card-title">{tripName}</p>
        <p className="card-date">{date}</p>
        <p className="card-description">{description}</p>
        <div className="card-chips-container">
          <p className="length card-length">{totalLength + " km"}</p>
          <p className="card-days length">{days + " Days"}</p>
        </div>
      </div>
    </Link>
  );
};

export default Card;
