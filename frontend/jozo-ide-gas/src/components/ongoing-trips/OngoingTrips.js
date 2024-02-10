import React from "react";
import Map from "../maps/Map";
import api from "../../api/axiosConfig";
import { useEffect, useState, useRef } from "react";
import Timeline from "../timeline/Timeline";

const OngoingTrips = () => {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const scrollRef = useRef(null);

  const getTrip = async () => {
    try {
      const response = await api.get("/api/v1/trips/ongoing");
      setTripData(response.data[0]);
      const rides = response.data[0].rideIds;
      setSelectedRide(rides[rides.length - 1]);
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
          <Map
            tripData={tripData}
            selectedRide={selectedRide}
            setSelectedRide={setSelectedRide}
            scrollRef={scrollRef}
          />
          <Timeline
            rides={tripData.rideIds}
            selectedRide={selectedRide}
            setSelectedRide={setSelectedRide}
            scrollRef={scrollRef}
            tripName={tripData.tripName}
          />
        </>
      )}
    </div>
  );
};

export default OngoingTrips;
