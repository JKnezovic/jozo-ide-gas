import React from "react";
import TripDetailHeader from "./TripDetailHeader";
import LineCircle from "./LineCircle";
import Images from "./Images";
import Statuses from "./Statuses";
const TimelineItem = ({ routeName, handleClick, ride, selectedRide }) => {
  const shadow = routeName === selectedRide.routeName ? "active" : "";
  return (
    <div
      className={`trip-details-container ${shadow}`}
      onClick={() => handleClick(ride)}
    >
      <LineCircle routeName={routeName} selectedRide={selectedRide} />
      <div style={{ width: "100%" }}>
        <TripDetailHeader ride={ride} routeName={routeName} />
        <div className="trip-details-body">
          <Statuses statuses={ride.statuses} />
          <Images images={ride.images} />
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
