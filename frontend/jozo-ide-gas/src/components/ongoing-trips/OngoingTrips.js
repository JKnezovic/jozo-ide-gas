import React from "react";
import Map from "../maps/Map";
import api from "../../api/axiosConfig";
import { useEffect, useState, useRef } from "react";
import Timeline from "../timeline/Timeline";
import "./OngoingTrips.css";
import Loading from "../loading/Loading";
import NoTripMessage from "./NoTripMessage";
import ErrorMessage from "../loading/ErrorMessage";
const OngoingTrips = () => {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const scrollRef = useRef(null);
  const [mapVisible, setMapVisible] = useState(true);
  const getTrip = async () => {
    try {
      const response = await api.get("/api/v1/trips/ongoing");
      setTripData(response.data[0]);
      const rides = response.data[0].rideIds;
      setSelectedRide(rides[rides.length - 1]);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError(true);
      setLoading(false);
    }
  };
  const handleClick = () => {
    setMapVisible(!mapVisible);
  };
  useEffect(() => {
    getTrip();
  }, []);

  if (loading) return <Loading />;
  else if (error) return <ErrorMessage />;
  else if (tripData && tripData.rideIds.length)
    return (
      <div className="ongoing-trip-container">
        <Map
          tripData={tripData}
          selectedRide={selectedRide}
          setSelectedRide={setSelectedRide}
          scrollRef={scrollRef}
          liveLocation={true}
          mapVisible={mapVisible}
        />
        <Timeline
          rides={tripData.rideIds}
          selectedRide={selectedRide}
          setSelectedRide={setSelectedRide}
          scrollRef={scrollRef}
          tripName={tripData.tripName}
          totalLength={tripData.totalLength}
          mapVisible={mapVisible}
          liveLocation={true}
        />
        <div onClick={() => handleClick()} className="button-switch">
          {mapVisible ? "Show Timeline" : "Show on Map"}
        </div>
      </div>
    );
  else return <NoTripMessage />;
};

export default OngoingTrips;
