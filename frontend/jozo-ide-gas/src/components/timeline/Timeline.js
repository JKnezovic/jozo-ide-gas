import React from "react";
import TimelineItem from "./TimelineItem";

const Timeline = ({ rides, setSelectedRide, selectedRide }) => {
  const handleClick = (ride) => {
    setSelectedRide(ride);
  };

  const timelineItems = rides.map((ride, index) => {
    const routeName = ride.routeName;

    return (
      <TimelineItem
        handleClick={handleClick}
        key={index}
        routeName={routeName}
        ride={ride}
        selectedRide={selectedRide}
      />
    );
  });
  return (
    <div className="trip-text-section">
      <h1 className="heading">Stobreč - Prevlaka</h1>
      <div className="trip-details">{timelineItems}</div>
    </div>
  );
};

export default Timeline;
