import React from "react";
import Chip from "@mui/material/Chip";
const TimelineItem = ({ routeName, handleClick, ride, selectedRide }) => {
  const bgColor = routeName === selectedRide.routeName ? "red" : "blue";
  const shadow = routeName === selectedRide.routeName ? "active" : "";
  return (
    <div
      className={`trip-details-container ${shadow}`}
      onClick={() => handleClick(ride)}
    >
      <div className="line-circle">
        <div
          style={{
            position: "absolute",
            top: "3px",
            backgroundColor: bgColor,
            borderRadius: "50%",
            borderColor: "white",
            borderStyle: "solid",
            borderWidth: "1px",
            minHeight: "15px",
            minWidth: "15px",
          }}
        />
        <div className="line-div" style={{ backgroundColor: bgColor }}></div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex" }}>
          <p>{routeName}</p>
          <p
            style={{
              color: "gray",
              fontSize: "small",
              marginTop: "3px",
              marginLeft: "3px",
            }}
          >
            {" - 10.Jan.2024"}
          </p>
        </div>
        <Chip
          label="102km"
          variant="outlined"
          style={{ marginRight: "10px" }}
        />
      </div>
    </div>
  );
};

export default TimelineItem;
