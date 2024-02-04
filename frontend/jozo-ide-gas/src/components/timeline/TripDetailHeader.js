import React from "react";
import Chip from "@mui/material/Chip";
import Moment from "moment";
const TripDetailHeader = ({ ride, routeName }) => {
  const startDate = Moment("2023-08-20");
  const date = Moment(ride.date);
  const difference = date.diff(startDate, "days") + 1;
  return (
    <div className="trip-details-header">
      <div className="flex" style={{ marginTop: "6px" }}>
        <p className="route-name">{routeName + " (Day " + difference + ")"}</p>
        <p className="date">{" - " + date.format("DD.MMM.YY.")}</p>
      </div>
      <Chip label={ride.length + "km"} variant="outlined" style={{ marginRight: "10px" }} />
    </div>
  );
};

export default TripDetailHeader;
