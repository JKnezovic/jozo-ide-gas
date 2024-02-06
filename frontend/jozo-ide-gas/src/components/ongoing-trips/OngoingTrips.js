import React from "react";
import Map from "../maps/Map";
import api from "../../api/axiosConfig";
import { useEffect, useState } from "react";
import Timeline from "../timeline/Timeline";

const OngoingTrips = () => {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState([]);

  const getTrip = async () => {
    try {
      const response = await api.get("/api/v1/trips/ongoing");
      setTripData(response.data[0]);
      setLoading(false);
      const rides = response.data[0].rideIds;
      setSelectedRide(rides[rides.length - 1]);
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
          <Map tripData={tripData} selectedRide={selectedRide} setSelectedRide={setSelectedRide} />
          <Timeline
            rides={tripData.rideIds}
            selectedRide={selectedRide}
            setSelectedRide={setSelectedRide}
          />
        </>
      )}
    </div>
  );
};

export default OngoingTrips;
