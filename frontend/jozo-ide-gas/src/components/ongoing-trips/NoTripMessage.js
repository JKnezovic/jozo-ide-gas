import React from "react";
import { Link } from "react-router-dom";

const NoTripMessage = () => {
  return (
    <div className="loading-container">
      <p>There are currently no trips ongoing. </p>
      <p>While waiting for a new trip to start</p>
      <p>take a look at some of the past trips.</p>
      <Link to="/done" className="secondary-button">
        Past Trips
      </Link>
    </div>
  );
};

export default NoTripMessage;
