import React, { useEffect } from "react";
import Map from "../maps/Map";
import { useState, useRef } from "react";
import Timeline from "../timeline/Timeline";
import "../ongoing-trips/OngoingTrips.css";
import { useParams } from "react-router-dom";
import Loading from "../loading/Loading";
const TripDetails = ({ tripData }) => {
  const [selectedRide, setSelectedRide] = useState(null);
  const [trip, setTrip] = useState(tripData[0]);
  const scrollRef = useRef(null);
  const { tripName } = useParams();
  const [mapVisible, setMapVisible] = useState(true);

  useEffect(() => {
    const trip = tripData.find((trip) => trip.tripId === tripName);
    const rides = trip.rideIds;
    setTrip(trip);
    setSelectedRide(rides[rides.length - 1]);
  }, [tripData, tripName]);
  const handleClick = () => {
    setMapVisible(!mapVisible);
  };
  return !selectedRide ? (
    <Loading />
  ) : (
    <div className="ongoing-trip-container">
      <Map
        tripData={trip}
        selectedRide={selectedRide}
        setSelectedRide={setSelectedRide}
        scrollRef={scrollRef}
        liveLocation={false}
        mapVisible={mapVisible}
      />
      <Timeline
        rides={trip.rideIds}
        selectedRide={selectedRide}
        setSelectedRide={setSelectedRide}
        scrollRef={scrollRef}
        tripName={trip.tripName}
        totalLength={trip.totalLength}
        mapVisible={mapVisible}
        liveLocation={false}
      />
      <div onClick={() => handleClick()} className="button-switch">
        {mapVisible ? "Show Timeline" : "Show on Map"}
      </div>
    </div>
  );
};

export default TripDetails;
