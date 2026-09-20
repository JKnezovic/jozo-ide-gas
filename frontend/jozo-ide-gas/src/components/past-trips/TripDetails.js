import React, { useEffect } from "react";
import Map from "../maps/Map";
import { useState, useRef } from "react";
import Timeline from "../timeline/Timeline";
import "../ongoing-trips/OngoingTrips.css";
import { useParams } from "react-router-dom";
import Loading from "../loading/Loading";
import ErrorMessage from "../loading/ErrorMessage";
const TripDetails = ({ tripData }) => {
  const [selectedRide, setSelectedRide] = useState(null);
  const [trip, setTrip] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const scrollRef = useRef(null);
  const { tripName } = useParams();
  const [mapVisible, setMapVisible] = useState(true);

  useEffect(() => {
    // A hand-typed or stale /done/:tripId matches nothing, and a trip can exist with no
    // rides recorded yet - neither should take the page down.
    const match = tripData.find((item) => item.tripId === tripName);
    const rides = match?.rideIds ?? [];
    setNotFound(!match || rides.length === 0);
    setTrip(match ?? null);
    setSelectedRide(rides.length ? rides[rides.length - 1] : null);
  }, [tripData, tripName]);
  const handleClick = () => {
    setMapVisible(!mapVisible);
  };
  if (notFound) return <ErrorMessage />;

  return !trip || !selectedRide ? (
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
