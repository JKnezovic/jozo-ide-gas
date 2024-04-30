import React from "react";
import TimelineItem from "./TimelineItem";
import "./Timeline.css";
import { CProgressBar, CProgress } from "@coreui/react";
const Timeline = ({
  rides,
  setSelectedRide,
  selectedRide,
  scrollRef,
  tripName,
  totalLength,
  mapVisible,
  liveLocation,
}) => {
  const handleClick = (ride) => {
    setSelectedRide(ride);
  };

  const kilometersDone = rides.map((ride) => ride.length).reduce((acc, val) => acc + val, 0);

  const startDate = rides[0].date;

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
          startDate={startDate}
        />
      );
    });
  return (
    <div className={"trip-text-section" + (mapVisible ? " none" : "")}>
      <div className="route-header">
        <h1 className="route-name-heading">{tripName}</h1>
        <div className="total-length">{totalLength + "km"}</div>
      </div>
      {liveLocation && (
        <div className="progress-km">
          <CProgress height={7} color="6b92b2">
            <CProgressBar
              color="6b92b2"
              value={(kilometersDone / totalLength) * 100}
            ></CProgressBar>
          </CProgress>
          <p className="percentage">{`${kilometersDone}km(${(
            (kilometersDone / totalLength) *
            100
          ).toFixed(1)}%)`}</p>
        </div>
      )}

      <div ref={scrollRef} className="trip-details">
        {timelineItems}
      </div>
    </div>
  );
};

export default Timeline;
