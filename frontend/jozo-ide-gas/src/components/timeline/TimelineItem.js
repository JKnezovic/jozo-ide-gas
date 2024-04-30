import React from "react";
import TripDetailHeader from "./TripDetailHeader";
import LineCircle from "./LineCircle";
import Images from "./Images";
import Statuses from "./Statuses";
const TimelineItem = ({ routeName, handleClick, ride, selectedRide, startDate }) => {
  return (
    <div className={`trip-details-container`} onClick={() => handleClick(ride)}>
      <LineCircle routeName={routeName} selectedRide={selectedRide} />
      <div style={{ width: "100%", marginTop: "10px" }}>
        <TripDetailHeader
          date={ride.date}
          length={ride.length}
          routeName={routeName}
          startDate={startDate}
        />
        <div className="trip-details-body">
          <Statuses statuses={ride.statuses} />
          <Images images={ride.images} />
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
