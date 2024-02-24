import React from "react";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
const LineCircle = ({ routeName, selectedRide }) => {
  const bgColor = routeName === selectedRide.routeName ? "#93712D" : "#6B92B2";

  return (
    <div className="line-circle">
      <div
        className="circle"
        style={{
          backgroundColor: bgColor,
          borderColor: bgColor,
        }}
      >
        <PlaceOutlinedIcon fontSize="inherit" style={{ margin: "3px" }} />
      </div>
      <div className="line-div" style={{ backgroundColor: bgColor }}></div>
    </div>
  );
};

export default LineCircle;
