import React from "react";
import Map from "../maps/Map";
import api from "../../api/axiosConfig";
import { useEffect, useState } from "react";
import LabelValue from "../label_value/LabelValue";
import { Link } from "react-router-dom";

const OngoingTrips = () => {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTrip = async () => {
    try {
      const response = await api.get("/api/v1/trips/ongoing");
      console.log(response.data);
      setTripData(response.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    getTrip();
  }, []);
  return (
    <div className="home-banner-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Map tripData={tripData} />
          <div className="trip-text-section">
            <h1 className="primary-heading">Stobreč - Nordkapp</h1>
            <div className="trip-details">
              <div className="column">
                <LabelValue label={"Ukupno Kilometara"} value={"4285km"} />
                <LabelValue label={"Pređeno"} value={"1240km"} />
                <LabelValue label={"Do kraja"} value={"3045km"} />
              </div>
              <div className="column">
                <LabelValue label={"Datum početka"} value={"1.5.2024."} />
                <LabelValue label={"Dana na putu"} value={5} />
                <LabelValue label={"KM po danu"} value={"90km"} />
              </div>
            </div>
            <Link to="/ongoing" className="bottom-right-button">
              Detalji{" "}
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default OngoingTrips;
