import React from "react";
import TimelineItem from "./TimelineItem";
import "./Timeline.css";
const Timeline = ({
  rides,
  setSelectedRide,
  selectedRide,
  scrollRef,
  tripName,
  totalLength,
  mapVisible,
}) => {
  const handleClick = (ride) => {
    setSelectedRide(ride);
  };

  const timelineItems = rides
    .slice()
    .reverse()
    .map((ride, index) => {
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
    <div className={"trip-text-section" + (mapVisible ? " none" : "")}>
      <div className="route-header">
        <h1 className="route-name-heading">{tripName}</h1>
        <div className="total-length">{totalLength + "km"}</div>
      </div>
      <div ref={scrollRef} className="trip-details">
        {timelineItems}
      </div>
    </div>
  );
};

export default Timeline;
