import React from "react";
import Chip from "@mui/material/Chip";
import Moment from "moment";
const TripDetailHeader = ({ length, date, routeName }) => {
  const startDate = Moment("2023-08-20");
  const moment = Moment(date);
  const difference = moment.diff(startDate, "days") + 1;
  const label = length ? `${length}km` : "REST";
  return (
    <div className="trip-details-header">
      <div className="flex" style={{ marginTop: "6px" }}>
        <p className="route-name">{routeName + " (Day " + difference + ")"}</p>
        <p className="date">{" - " + moment.format("DD.MMM.YY.")}</p>
      </div>
      <Chip
        label={label}
        variant={length ? "outlined" : "filled"}
        style={
          length
            ? { marginRight: "10px" }
            : { backgroundColor: "#94722e", color: "white", marginRight: "10px" }
        }
      />
    </div>
  );
};

export default TripDetailHeader;
