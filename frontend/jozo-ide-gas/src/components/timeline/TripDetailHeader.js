import React from "react";
import Moment from "moment";
const TripDetailHeader = ({ length, date, routeName, startDate }) => {
  const moment = Moment(date);
  const difference = moment.diff(startDate, "days") + 1;
  const label = length ? `${length}km` : "REST";
  return (
    <div className="trip-details-header">
      <div style={{ marginTop: "6px" }}>
        <p className="route-name">{routeName + " (Day " + difference + ")"}</p>
        <p className="date">{moment.format("DD.MMM.YY.")}</p>
      </div>
      <div className="length">{label}</div>
    </div>
  );
};

export default TripDetailHeader;
