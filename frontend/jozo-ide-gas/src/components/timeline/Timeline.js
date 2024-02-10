import React, { useEffect } from "react";
import TimelineItem from "./TimelineItem";

const Timeline = ({ rides, setSelectedRide, selectedRide, scrollRef, tripName }) => {
  const handleClick = (ride) => {
    setSelectedRide(ride);
  };

  useEffect(() => {
    let index = scrollRef.current.childElementCount - 1;
    const selectedItem = scrollRef.current.childNodes[index];
    selectedItem.scrollIntoView({ behavior: "smooth", block: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <h1 className="heading">{tripName}</h1>
      <div ref={scrollRef} className="trip-details">
        {timelineItems}
      </div>
    </div>
  );
};

export default Timeline;
